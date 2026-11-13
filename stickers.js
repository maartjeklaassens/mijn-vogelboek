// Mijn Vogelboek: één resolver voor soortstickers, AviList en ondersoorten.
// Bron: https://github.com/alchaincyf/huashu-bird-sticker (CC BY 4.0).
// Er worden geen willekeurige vervangende soorten gebruikt.
const CDN = 'https://cdn.jsdelivr.net/gh/alchaincyf/huashu-bird-sticker@main/';
const RAW = 'https://raw.githubusercontent.com/alchaincyf/huashu-bird-sticker/main/';
const STICKERS = 'data/stickers.json';
const CROSSWALK = 'data/crosswalk-ioc15.2-avilist2026.csv';
const matches = new Map();
const conversions = new Map();
let promise;
let sourceStatus = {index:false, crosswalk:false, stickerCount:0, converted:0};

const norm = x => String(x ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[_‐‑‒–—-]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const keyToFile = x => String(x).trim().replace(/\s+/g,'_');
const validPath = p => typeof p==='string' && /^stickers\/[a-z0-9_-]+\/[a-z0-9_-]+\/[a-z0-9_.-]+\.(webp|png)$/i.test(p) && !p.includes('..');
const addCandidate = (out, p, origin) => {if(validPath(p)&&!out.some(x=>x.path===p))out.push({path:p,origin});};

// Exacte alternatieve namen; alleen dezelfde soort, nooit een lookalike.
const aliases = {
  'cygnus bewickii':['Cygnus columbianus'],
  'ixobrychus minutus':['Botaurus minutus'],
  'bubulcus ibis':['Ardea ibis'],
  'accipiter gentilis':['Astur gentilis'],
  'dendrocopos medius':['Dendrocoptes medius'],
  'sylvia curruca':['Curruca curruca'],
  'sylvia althaea':['Curruca althaea'],
  'emberiza schoeniclus':['Schoeniclus schoeniclus'],
  'emberiza aureola':['Schoeniclus aureolus'],
  'emberiza personata':['Schoeniclus personatus'],
  'emberiza bruniceps':['Melophus bruniceps'],
  'emberiza melanocephala':['Melophus melanocephalus'],
  'emberiza pusilla':['Schoeniclus pusillus'],
  'emberiza rustica':['Schoeniclus rusticus'],
  'emberiza chrysophrys':['Schoeniclus chrysophrys'],
  'corvus monedula':['Coloeus monedula'],
  'corvus dauuricus':['Coloeus dauuricus'],
  'phalacrocorax aristotelis':['Gulosus aristotelis'],
  'phalacrocorax pygmeus':['Microcarbo pygmaeus'],
  'charadrius alexandrinus':['Anarhynchus alexandrinus'],
  'eudromias morinellus':['Charadrius morinellus'],
  'sterna sandvicensis':['Thalasseus sandvicensis'],
  'aquila pennata':['Hieraaetus pennatus'],
  'calonectris diomedea':['Calonectris borealis'],
  'saxicola maurus':['Saxicola maurus'],
  'acanthis cabaret':['Acanthis flammea'],
  'carduelis cabaret':['Acanthis flammea']
};
// Algemene genusverschuivingen die bij de grasmussen en andere zangvogels
// vaak voorkomen. Alleen gebruiken als de exacte doelnaam in de index bestaat.
const genusChanges = [
  ['Sylvia','Curruca'], ['Curruca','Sylvia'], ['Dendrocopos','Dendrocoptes'],
  ['Phalacrocorax','Gulosus'], ['Phalacrocorax','Microcarbo'],
  ['Larus','Ichthyaetus'], ['Larus','Leucophaeus'],
  ['Emberiza','Schoeniclus'], ['Emberiza','Melophus'],
  ['Corvus','Coloeus'], ['Accipiter','Astur'], ['Charadrius','Anarhynchus'],
  ['Sterna','Thalasseus'], ['Aquila','Hieraaetus'], ['Puffinus','Ardenna'],
  ['Locustella','Helopsaltes'], ['Carduelis','Acanthis']
];
// De vormen hieronder zijn taxa die in een andere checklist als aparte
// soort staan. Hun eigen vormafbeelding moet voorrang krijgen.
const explicitForms = {
  'witbuikrotgans': {parent:'Branta bernicla', form:'hrota'},
  'zwarte rotgans': {parent:'Branta bernicla', form:'nigricans'},
  'amerikaanse wintertaling': {parent:'Anas crecca', form:'carolinensis'},
  'bonte kraai': {parent:'Corvus corone', form:'cornix'},
  'kleine zwaan': {parent:'Cygnus columbianus', form:'bewickii'},
  'humes braamsluiper': {parent:'Curruca curruca', form:'althaea'},
  'witstuitbarmsijs': {parent:'Acanthis flammea', form:'hornemanni'},
  'kleine barmsijs': {parent:'Acanthis flammea', form:'cabaret'},
  'amerikaanse grote stern': {parent:'Thalasseus sandvicensis', form:'acuflavidus'}
};
const dutchExact = {
  'kleine zwaan':['Cygnus bewickii','Cygnus columbianus'],
  'witbuikrotgans':['Branta hrota'], 'zwarte rotgans':['Branta nigricans'],
  'amerikaanse wintertaling':['Anas carolinensis'],
  'humes braamsluiper':['Curruca althaea'],
  'bonte kraai':['Corvus cornix'],
  'amerikaanse grote stern':['Thalasseus acuflavidus'],
  'witstuitbarmsijs':['Acanthis hornemanni'],
  'maskergors':['Schoeniclus personatus'],
  'wilgengors':['Schoeniclus aureolus'],
  'rietgors':['Schoeniclus schoeniclus']
};

async function getText(path) {
  let problem;
  for(const root of [CDN,RAW]) {
    try {
      const r=await fetch(root+path);
      if(r.ok) return await r.text();
      problem=Error(path+' HTTP '+r.status);
    } catch(e) {problem=e;}
  }
  throw problem || Error('Kan '+path+' niet ophalen');
}

// Geen simpele split(','): taxonomische CSV bevat komma's in aanhalingstekens.
function readCsv(text) {
  const records=[];let line=[], field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"') {if(quoted&&text[i+1]==='"'){field+='"';i++;} else quoted=!quoted;}
    else if(c===','&&!quoted){line.push(field);field='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;line.push(field);if(line.length>1)records.push(line);line=[];field='';}
    else field+=c;
  }
  if(field||line.length){line.push(field);records.push(line);}
  const head=records.shift()||[];
  return records.map(row=>Object.fromEntries(head.map((name,i)=>[name,row[i]||''])));
}

function addIndex(name,file) {
  const n=norm(name);
  if(n&&!matches.has(n)&&validPath(file)) matches.set(n,file);
}
function indexRow(row){
  const p=row.file;
  if(!validPath(p))return;
  const filename=p.split('/').at(-1).replace(/\.(webp|png)$/i,'');
  for(const n of [filename,row.sci,row.scientific,row.scientificName,row.id]) addIndex(n,p);
}
export async function loadStickerIndex() {
  if(promise)return promise;
  promise=(async()=>{
    const data=JSON.parse(await getText(STICKERS));
    if(!Array.isArray(data.stickers))throw Error('Onbekend stickerindex-formaat');
    for(const row of data.stickers)indexRow(row);
    sourceStatus.index=true;
    sourceStatus.stickerCount=data.stickers.length;
    // De crosswalk is aanvullend: een storing mag de reeds gevonden stickers
    // absoluut niet meer laten verdwijnen.
    try {
      const rows=readCsv(await getText(CROSSWALK));
      for(const row of rows){
        if(!row.ioc_sci||!row.avilist_sci)continue;
        if(!['renamed','lumped','same'].includes(row.relation))continue;
        conversions.set(norm(row.ioc_sci), {name:row.avilist_sci, relation:row.relation});
      }
      sourceStatus.crosswalk=true;
      sourceStatus.converted=conversions.size;
    } catch(e) {console.warn('Taxonomische crosswalk niet geladen; basisstickers blijven werken:',e.message);}
    console.info('Mijn Vogelboek: '+sourceStatus.stickerCount+' soortstickers; '+sourceStatus.converted+' naamkoppelingen.');
    return sourceStatus;
  })();
  try {return await promise;}catch(e){promise=null;throw e;}
}
function namesFor(sci, dutch) {
  const names=[];
  const add = s => {const k=norm(s);if(k&&!names.includes(k))names.push(k);};
  add(sci);
  for(const a of dutchExact[norm(dutch)]||[])add(a);
  for(let i=0;i<names.length&&i<25;i++){
    const name=names[i];
    const conversion=conversions.get(name);
    if(conversion&&conversion.relation!=='lumped')add(conversion.name);
    for(const a of aliases[name]||[])add(a);
    const parts=name.split(' ');
    if(parts.length>=2){
      for(const [old,newName] of genusChanges){
        if(parts[0]===old.toLowerCase())add(newName+' '+parts.slice(1).join(' '));
      }
    }
  }
  return names;
}
function formCandidate(parent,form){
  const parentPath=matches.get(norm(parent));
  if(!parentPath)return '';
  return parentPath.replace(/\.(webp|png)$/i,'.'+form.toLowerCase()+'.$1');
}
export function stickerCandidates(scientific, dutchName='') {
  const result=[];
  const names=namesFor(scientific,dutchName);
  const forced=explicitForms[norm(dutchName)];
  if(forced){
    const form=formCandidate(forced.parent,forced.form);
    addCandidate(result,form,'ondersoort '+forced.form);
  }
  const conv=conversions.get(norm(scientific));
  if(conv?.relation==='lumped') {
    const epithet=norm(scientific).split(' ').at(-1);
    addCandidate(result,formCandidate(conv.name,epithet),'ondersoort '+epithet);
  }
  for(const name of names){
    const p=matches.get(name);
    addCandidate(result,p,'exacte soort '+name);
  }
  // Kleine zwaan is in AviList Cygnus columbianus; dit was al het
  // geaccepteerde werkende gedrag in v9. Voor andere ondersoorten wordt de
  // algemene moeder-/bovenliggende soort juist NIET als vervanger gebruikt.
  return result.flatMap(x=>[
    {...x,url:CDN+x.path},
    {...x,url:RAW+x.path}
  ]);
}
export function stickerMatch(scientific,dutchName='') {
  const items=stickerCandidates(scientific,dutchName);
  if(!items.length)return null;
  return {url:items[0].url, backupUrl:items[1]?.url||'',candidates:items,kind:'exact',scientific:norm(scientific)};
}
export function stickerDiagnostics(species){
  const unresolved=species.filter(s=>!stickerCandidates(s.scientific,s.name).length)
    .map(s=>({name:s.name,scientific:s.scientific,reason:'geen indexmatch of ondersoortpad'}));
  return {total:species.length,candidates:species.length-unresolved.length,unresolved,sourceStatus:{...sourceStatus}};
}
