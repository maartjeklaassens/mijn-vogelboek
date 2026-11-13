// Mijn Vogelboek — stickers v8.
// Gebruik uitsluitend echte bestandslocaties uit de Huashu/AviList-index.
// Voor 91 eerder zelfstandige soorten bevat species.json extra 'forms'-stickers.
// Geen substituten: zonder aantoonbare match tonen we het bestaande silhouet.
const CDN = 'https://cdn.jsdelivr.net/gh/alchaincyf/huashu-bird-sticker@main/';
const INDEX_URL = CDN + 'data/stickers.json';
const SPECIES_URL = CDN + 'data/species.json';
const byScientific = new Map();
const formByOldName = new Map();
let loading = null;
let formsLoading = null;

function norm(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[_\-’']/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
}
function validFile(file) {
  if(typeof file !== 'string') return null;
  const f = file.replace(/^\/+/, '');
  if (!/^stickers\/[\w-]+\/[\w-]+\/[\w.\-]+\.(?:webp|png)$/i.test(f)) return null;
  return f;
}
function keyFromFile(file) {
  return norm(file.split('/').pop().replace(/\.(webp|png)$/i,''));
}
function knownName(name) {
  // Verifieerbare AviList 2026 wijzigingen (zelfde vogel, andere genusnaam).
  const rename = {
    'emberiza schoeniclus':'Schoeniclus schoeniclus',
    'emberiza aureola':'Schoeniclus aureolus',
    'emberiza personata':'Schoeniclus personatus',
    'emberiza pusilla':'Schoeniclus pusillus',
    'emberiza chrysophrys':'Schoeniclus chrysophrys',
    'emberiza rustica':'Schoeniclus rusticus',
    'emberiza melanocephala':'Melophus melanocephalus',
    'emberiza bruniceps':'Melophus bruniceps',
    'emberiza spodocephala':'Schoeniclus spodocephalus',
    'ixobrychus minutus':'Botaurus minutus',
    'bubulcus ibis':'Ardea ibis',
    'sylvia curruca':'Curruca curruca',
    'sylvia althaea':'Curruca althaea',
    'accipiter gentilis':'Astur gentilis',
    'dendrocopos medius':'Dendrocoptes medius'
  };
  return rename[norm(name)] || '';
}
const targetNames = {
  'amerikaanse wintertaling': 'Anas carolinensis',
  'woudaap': 'Ixobrychus minutus',
  'koereiger': 'Bubulcus ibis',
  'humes braamsluiper': 'Curruca althaea',
  'bonte kraai': 'Corvus cornix',
  'amerikaanse grote stern': 'Thalasseus acuflavidus',
  'witstuitbarmsijs': 'Acanthis hornemanni',
  'maskergors': 'Emberiza personata',
  'wilgengors': 'Emberiza aureola',
  'rietgors': 'Emberiza schoeniclus',
  'bruinkopgors': 'Emberiza bruniceps',
  'zwartkopgors': 'Emberiza melanocephala',
  'geelbrauwgors': 'Emberiza chrysophrys',
  'dwerggors': 'Emberiza pusilla',
  'bosgors': 'Emberiza rustica'
};

// Waar AviList soorten samenvoegt is er soms een eigen 'form'-sticker.
// Deze toewijzingen noemen de exacte oude soort en de AviList-ondersoort;
// er wordt pas iets getoond als de form daadwerkelijk in species.json staat.
const formNames = {
  'anas carolinensis': {parent:'Anas crecca', suffix:'carolinensis'},
  'corvus cornix': {parent:'Corvus corone', suffix:'cornix'},
  'thalasseus acuflavidus': {parent:'Thalasseus sandvicensis', suffix:'acuflavidus'},
  'acanthis hornemanni': {parent:'Acanthis flammea', suffix:'hornemanni'},
  'curruca althaea': {parent:'Curruca curruca', suffix:'althaea'}
};

export async function loadStickerIndex(){
  if(loading) return loading;
  loading=(async()=>{
    const r=await fetch(INDEX_URL);
    if(!r.ok) throw Error('Stickerindex HTTP '+r.status);
    const index=await r.json();
    if(!Array.isArray(index.stickers)) throw Error('Onbekend stickerindex-formaat');
    const base=typeof index.cdn==='string'&&index.cdn.startsWith('https://')?index.cdn:CDN;
    const prefix=base.endsWith('/')?base:base+'/';
    for(const s of index.stickers){
      const path=validFile(s.file);
      if(!path)continue;
      const url=prefix+path;
      byScientific.set(keyFromFile(path),url);
      for(const name of [s.scientific,s.scientificName,s.sci,s.id]){
        if(name&&!byScientific.has(norm(name)))byScientific.set(norm(name),url);
      }
    }
    console.info('Mijn Vogelboek: '+index.stickers.length+' soortstickers ingelezen.');
    // Forms worden alleen apart opgehaald indien een van de doelsoorten ontbreekt.
    const needsForms=Object.values(formNames).some((_,i)=>{
      const old=Object.keys(formNames)[i];
      return !byScientific.has(old);
    });
    if(needsForms){
      loadForms().then(()=>window.dispatchEvent(new Event('vogelboek-stickers-updated')))
        .catch(err=>console.warn('Form-stickers konden niet laden:',err));
    }
    return byScientific.size;
  })();
  try{return await loading}catch(err){loading=null;throw err}
}

async function loadForms(){
  if(formsLoading)return formsLoading;
  formsLoading=(async()=>{
    const r=await fetch(SPECIES_URL);
    if(!r.ok)throw Error('Soortendata HTTP '+r.status);
    const raw=await r.json();
    const all=Array.isArray(raw)?raw:(raw.species||[]);
    const base=CDN;
    let count=0;
    for(const s of all){
      if(!Array.isArray(s.forms))continue;
      const parent=norm(s.scientificName);
      for(const form of s.forms){
        const f=validFile(form?.sticker?.file||form?.file);
        if(!f)continue;
        const names=[form.scientificName,form.formerScientificName,form.iocScientificName,form.id,form.previous?.id,form.previous?.scientificName];
        for(const n of names){if(n){formByOldName.set(norm(n),base+f)}}
        // For a form named Genus_species.subspecies.webp, identify the actual
        // bird by *both* the parent species and the suffix (not suffix alone).
        const filename=f.split('/').pop();
        const match=filename.match(/^([A-Za-z]+_[a-z]+)\.([a-z]+)\.(webp|png)$/i);
        if(match){
          const suffix=match[2].toLowerCase();
          for(const [old, spec] of Object.entries(formNames)){
            if(parent===norm(spec.parent)&&suffix===spec.suffix){
              formByOldName.set(old,base+f);
            }
          }
        }
        count++;
      }
    }
    console.info('Mijn Vogelboek: '+count+' aanvullende vormstickers doorzocht.');
    for(const [old] of Object.entries(formNames)) {
      console.info('[sticker-check]',old, formByOldName.has(old)?'vormsticker gevonden':'geen exacte vormsticker gevonden');
    }
    return count;
  })();
  return formsLoading;
}

export function stickerMatch(scientific, dutchName=''){
  const candidateNames=[];
  const add=n=>{if(n&&!candidateNames.some(x=>norm(x)===norm(n)))candidateNames.push(n)};
  const original=scientific||'';
  const selected=targetNames[norm(dutchName)];
  add(selected);
  add(original);
  if(selected)add(knownName(selected));
  add(knownName(original));
  for(const name of candidateNames){
    const url=byScientific.get(norm(name));
    if(url)return {url,kind:'exact',scientific:name,label:dutchName};
  }
  // Alleen de door de maker zelf opgenomen vormafbeelding, geen andere soort.
  for(const name of candidateNames){
    const url=formByOldName.get(norm(name));
    if(url)return {url,kind:'exact-form',scientific:name,label:dutchName};
  }
  return null;
}
export function stickerFor(scientific,dutchName=''){
  return stickerMatch(scientific,dutchName)?.url||'';
}
