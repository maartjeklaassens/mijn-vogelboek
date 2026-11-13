// Mijn Vogelboek — stickers v9 (zonder vervangende soorten).
// Vertrouw uitsluitend op bestanden uit de officiële stickers.json-index.
// species.json is bewust niet nodig: dit bestand geeft via jsDelivr HTTP 403.
const ROOT = 'https://cdn.jsdelivr.net/gh/alchaincyf/huashu-bird-sticker@main/';
const RAW_ROOT = 'https://raw.githubusercontent.com/alchaincyf/huashu-bird-sticker/main/';
const INDEX = ROOT + 'data/stickers.json';
const byName = new Map();
let loading;

const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[_‐‑‒–—-]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

// Uitsluitend alternatieve wetenschappelijke namen van dezelfde soort,
// of de taxonomische samengevoegde soort (zonder een andere soort te verzinnen).
// Bij echte ondersoorten die niet in de gewone index staan gebruiken we GEEN
// bovenliggende soort als vervanger.
const aliases = {
  'cygnus bewickii': ['Cygnus columbianus'],
  'cygnus columbianus bewickii': ['Cygnus columbianus'],
  'ixobrychus minutus': ['Botaurus minutus'],
  'bubulcus ibis': ['Ardea ibis'],
  'accipiter gentilis': ['Astur gentilis'],
  'dendrocopos medius': ['Dendrocoptes medius'],
  'sylvia curruca': ['Curruca curruca'],
  'sylvia althaea': ['Curruca althaea'],
  'emberiza schoeniclus': ['Schoeniclus schoeniclus'],
  'emberiza aureola': ['Schoeniclus aureolus'],
  'emberiza personata': ['Schoeniclus personatus'],
  'emberiza bruniceps': ['Melophus bruniceps'],
  'emberiza melanocephala': ['Melophus melanocephalus'],
  'emberiza pusilla': ['Schoeniclus pusillus'],
  'emberiza rustica': ['Schoeniclus rusticus'],
  'emberiza chrysophrys': ['Schoeniclus chrysophrys'],
  'corvus monedula': ['Coloeus monedula'],
  'corvus dauuricus': ['Coloeus dauuricus'],
  'phalacrocorax aristotelis': ['Gulosus aristotelis'],
  'phalacrocorax pygmeus': ['Microcarbo pygmaeus'],
  'charadrius alexandrinus': ['Anarhynchus alexandrinus'],
  'eudromias morinellus': ['Charadrius morinellus'],
  'sterna sandvicensis': ['Thalasseus sandvicensis'],
  'aquila pennata': ['Hieraaetus pennatus']
};
const dutchAliases = {
  'kleine zwaan': ['Cygnus columbianus', 'Cygnus bewickii'],
  'woudaap': ['Ixobrychus minutus','Botaurus minutus'],
  'koereiger': ['Bubulcus ibis','Ardea ibis'],
  'rietgors': ['Emberiza schoeniclus','Schoeniclus schoeniclus'],
  'wilgengors': ['Emberiza aureola','Schoeniclus aureolus'],
  'maskergors': ['Emberiza personata','Schoeniclus personatus'],
  'bruinkopgors': ['Emberiza bruniceps','Melophus bruniceps'],
  'zwartkopgors': ['Emberiza melanocephala','Melophus melanocephalus'],
  'geelbrauwgors': ['Emberiza chrysophrys','Schoeniclus chrysophrys'],
  'dwerggors': ['Emberiza pusilla','Schoeniclus pusillus'],
  'bosgors': ['Emberiza rustica','Schoeniclus rusticus'],
  'amerikaanse wintertaling': ['Anas carolinensis'],
  'bonte kraai': ['Corvus cornix'],
  'amerikaanse grote stern': ['Thalasseus acuflavidus'],
  'humes braamsluiper': ['Curruca althaea'],
  'witstuitbarmsijs': ['Acanthis hornemanni'],
  'witbuikrotgans': ['Branta hrota','Branta bernicla hrota'],
  'zwarte rotgans': ['Branta nigricans','Branta bernicla nigricans']
};

function validPath(path) {
  return typeof path === 'string' && /^stickers\/[a-z\d_-]+\/[a-z\d_-]+\/[a-z\d_.-]+\.(?:webp|png)$/i.test(path) && !path.includes('..');
}
function add(name, path, cdn) {
  const key=norm(name);
  if (!key || byName.has(key)) return;
  byName.set(key, {url: cdn+path, backupUrl: RAW_ROOT+path, path});
}
export async function loadStickerIndex() {
  if (loading) return loading;
  loading = (async()=>{
    let response;
    try {response=await fetch(INDEX);} catch {response=null;}
    if (!response?.ok) response=await fetch(RAW_ROOT+'data/stickers.json');
    if (!response.ok) throw Error('Stickerindex HTTP '+response.status);
    const data=await response.json();
    if (!Array.isArray(data.stickers)) throw Error('Onbekend stickerindex-formaat');
    // In de bronindex staat de volledige, juiste padnaam per sticker.
    const cdn = typeof data.cdn==='string' && /^https:\/\//.test(data.cdn)
      ? data.cdn.replace(/\/?$/, '/') : ROOT;
    for (const s of data.stickers) {
      if (!validPath(s.file)) continue;
      const file = s.file.split('/').pop().replace(/\.(?:webp|png)$/i,'');
      add(file,s.file,cdn);
      for (const name of [s.sci,s.scientific,s.scientificName,s.id]) add(name,s.file,cdn);
    }
    console.info('Mijn Vogelboek: '+data.stickers.length+' soortstickers uit de officiële index geladen.');
    return byName.size;
  })();
  try {return await loading;} catch (e) {loading=null; throw e;}
}
export function stickerMatch(scientific, dutchName='') {
  const keys=[];
  const addCandidate=s=>{const k=norm(s); if(k&&!keys.includes(k))keys.push(k);};
  addCandidate(scientific);
  for (const a of aliases[norm(scientific)]||[]) addCandidate(a);
  for (const a of dutchAliases[norm(dutchName)]||[]) {
    addCandidate(a);
    for (const b of aliases[norm(a)]||[]) addCandidate(b);
  }
  for (const key of keys) {
    const match=byName.get(key);
    if (match) return {...match, kind:'exact', scientific:key};
  }
  return null;
}
export function stickerFor(scientific,dutchName='') {
  return stickerMatch(scientific,dutchName)?.url||'';
}
