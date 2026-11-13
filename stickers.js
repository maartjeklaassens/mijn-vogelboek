// Mijn Vogelboek — exacte stickerkoppeling v7 (2026-11-13).
// Bron: https://github.com/alchaincyf/huashu-bird-sticker (CC BY 4.0).
// Geen vervangende soorten. Gebruik de bestandsnaam uit de officiële index als bron.
const CDN = 'https://cdn.jsdelivr.net/gh/alchaincyf/huashu-bird-sticker@main/';
const INDEX_URL = CDN + 'data/stickers.json';
const byName = new Map();
let indexPromise;

function norm(x) {
  return String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-’']/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}
function filenameKey(path) {
  return norm(String(path).split('/').pop().replace(/\.(?:webp|png|jpe?g)$/i, ''));
}
function safeStickerPath(path) {
  if (typeof path !== 'string') return null;
  const p = path.replace(/^\/+/, '');
  return /^stickers\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\.(webp|png)$/i.test(p) ? p : null;
}
const exactSpecies = {
  'amerikaanse wintertaling': { scientific: 'Anas carolinensis', file: 'stickers/Anseriformes/Anatidae/Anas_carolinensis.webp' },
  'woudaap': { scientific: 'Ixobrychus minutus', file: 'stickers/Pelecaniformes/Ardeidae/Ixobrychus_minutus.webp' },
  'koereiger': { scientific: 'Bubulcus ibis', file: 'stickers/Pelecaniformes/Ardeidae/Bubulcus_ibis.webp' },
  'humes braamsluiper': { scientific: 'Curruca althaea', file: 'stickers/Passeriformes/Sylviidae/Curruca_althaea.webp' },
  'bonte kraai': { scientific: 'Corvus cornix', file: 'stickers/Passeriformes/Corvidae/Corvus_cornix.webp' },
  'amerikaanse grote stern': { scientific: 'Thalasseus acuflavidus', file: 'stickers/Charadriiformes/Laridae/Thalasseus_acuflavidus.webp' },
  'witstuitbarmsijs': { scientific: 'Acanthis hornemanni', file: 'stickers/Passeriformes/Fringillidae/Acanthis_hornemanni.webp' },
  'maskergors': { scientific: 'Emberiza personata', file: 'stickers/Passeriformes/Emberizidae/Emberiza_personata.webp' },
  'wilgengors': { scientific: 'Emberiza aureola', file: 'stickers/Passeriformes/Emberizidae/Emberiza_aureola.webp' },
  'rietgors': { scientific: 'Emberiza schoeniclus', file: 'stickers/Passeriformes/Emberizidae/Emberiza_schoeniclus.webp' },
};

// Old genera are considered only where they refer to the same species;
// never silently map one species to a different species.
const dutchAliases = {
    'kleine zwaan': ['Cygnus bewickii','Cygnus columbianus'],
    'witbuikrotgans': ['Branta bernicla','Branta hrota','Branta bernicla hrota'],
    'zwarte rotgans': ['Branta bernicla','Branta nigricans','Branta bernicla nigricans'],
    'korhoen': ['Lyrurus tetrix','Tetrao tetrix'],
    'amerikaanse wintertaling': ['Anas carolinensis','Anas crecca carolinensis'],
    'horusgierzwaluw': ['Apus horus'],
    'vale pijlstormvogel': ['Calonectris borealis','Calonectris diomedea'],
    'woudaap': ['Ixobrychus minutus','Ardeola minuta'],
    'koereiger': ['Bubulcus ibis','Ardea ibis'],
    'dwergaalscholver': ['Microcarbo pygmaeus','Phalacrocorax pygmeus'],
    'kuifaalscholver': ['Gulosus aristotelis','Phalacrocorax aristotelis'],
    'morinelplevier': ['Charadrius morinellus','Eudromias morinellus'],
    'kleine plevier': ['Charadrius dubius'],
    'strandplevier': ['Anarhynchus alexandrinus','Charadrius alexandrinus'],
    'taiga strandloper': ['Calidris subminuta'],
    'taigastrandloper': ['Calidris subminuta'],
    'bairds strandloper': ['Calidris bairdii'],
    'grauwe franjepoot': ['Phalaropus lobatus'],
    'zwarte zeekoet': ['Cepphus grylle'],
    'lachmeeuw': ['Leucophaeus atricilla','Larus atricilla'],
    'franklins meeuw': ['Leucophaeus pipixcan','Larus pipixcan'],
    'zwartkop meeuw': ['Ichthyaetus melanocephalus','Larus melanocephalus'],
    'audoinsmeeuw': ['Ichthyaetus audouinii','Larus audouinii'],
    "audouinsmeeuw": ['Ichthyaetus audouinii','Larus audouinii'],
    'thayers meeuw': ['Larus thayeri','Larus glaucoides'],
    'sierlijke stern': ['Onychoprion anaethetus','Sterna anaethetus'],
    'grote stern': ['Thalasseus sandvicensis','Sterna sandvicensis'],
    'amerikaanse grote stern': ['Thalasseus acuflavidus','Sterna acuflavida','Sterna acuflavida acuflavida'],
    'dwergarend': ['Hieraaetus pennatus','Aquila pennata'],
    'havik': ['Astur gentilis','Accipiter gentilis'],
    'steenuil': ['Athene noctua'],
    'grijskopspecht': ['Picus canus'],
    'middelste bonte specht': ['Dendrocoptes medius','Dendrocopos medius'],
    'steppeklapekster': ['Lanius pallidirostris','Lanius excubitor'],
    'notenkraker': ['Nucifraga caryocatactes'],
    'kauw': ['Coloeus monedula','Corvus monedula'],
    'daurische kauw': ['Coloeus dauuricus','Corvus dauuricus'],
    'bonte kraai': ['Corvus cornix','Corvus corone cornix'],
    'strandleeuwerik': ['Eremophila alpestris'],
    'groene fitis': ['Phylloscopus trochiloides'],
    'bruine boszanger': ['Phylloscopus fuscatus'],
    'balkan bergfluiter': ['Phylloscopus orientalis'],
    'balkanbergfluiter': ['Phylloscopus orientalis'],
    'siberische tjiftjaf': ['Phylloscopus tristis','Phylloscopus collybita'],
    'humes braamsluiper': ['Curruca althaea','Sylvia althaea','Curruca curruca althaea'],
    'braamsluiper': ['Curruca curruca','Sylvia curruca'],
    'kleine zwartkop': ['Curruca melanocephala','Sylvia melanocephala'],
    'provencaalse grasmus': ['Curruca undata','Sylvia undata'],
    'provençaalse grasmus': ['Curruca undata','Sylvia undata'],
    'siberische sprinkhaanzanger': ['Helopsaltes certhiola','Locustella certhiola'],
    'stejnegers roodborsttapuit': ['Saxicola stejnegeri','Saxicola maurus'],
    'noordse kwikstaart': ['Motacilla thunbergi','Motacilla flava'],
    'witkeelkwikstaart': ['Motacilla cinereocapilla','Motacilla flava'],
    'engelse kwikstaart': ['Motacilla flavissima','Motacilla flava'],
    'rouwkwikstaart': ['Motacilla yarrellii','Motacilla alba'],
    'balkankwikstaart': ['Motacilla feldegg','Motacilla flava'],
    'oeverpieper': ['Anthus petrosus'],
    'atlasvink': ['Fringilla spodiogenys'],
    'roodmus': ['Carpodacus erythrinus'],
    'kleine barmsijs': ['Acanthis cabaret','Carduelis cabaret','Acanthis flammea cabaret','Carduelis flammea cabaret'],
    'witstuitbarmsijs': ['Acanthis hornemanni','Carduelis hornemanni','Acanthis flammea hornemanni','Acanthis exilipes','Carduelis hornemanni exilipes'],
    'bruinkopgors': ['Emberiza bruniceps','Emberiza bruniceps bruniceps'],
    'zwartkopgors': ['Emberiza melanocephala','Emberiza melanocephala melanocephala'],
    'wartkopgors': ['Emberiza melanocephala'],
    'bruinkeelortolaan': ['Emberiza caesia'],
    'cirlgors': ['Emberiza cirlus'],
    'rietgors': ['Emberiza schoeniclus'],
    'wilgengors': ['Emberiza aureola','Emberiza aureola aureola'],
    'geelbrauwgors': ['Emberiza chrysophrys','Emberiza chrysophrys chrysophrys'],
    'dwerggors': ['Emberiza pusilla','Emberiza pusilla pusilla'],
    'bosgors': ['Emberiza rustica','Emberiza rustica rustica'],
    'maskergors': ['Emberiza personata','Emberiza spodocephala personata'],
    'kleinste canadese gans': ['Branta hutchinsii'],
    'heilige ibis': ['Threskiornis aethiopicus'],
    'bruinkopdiksnavelmees': ['Paradoxornis webbianus','Suthora webbiana']
};

const scientificAliases = {
  'accipiter gentilis':['Astur gentilis'],
  'corvus monedula':['Coloeus monedula'],
  'dendrocopos medius':['Dendrocoptes medius'],
  'sylvia curruca':['Curruca curruca'],
  'sylvia undata':['Curruca undata'],
  'sylvia althaea':['Curruca althaea'],
  'sterna sandvicensis':['Thalasseus sandvicensis'],
  'sterna acuflavida':['Thalasseus acuflavidus'],
  'larus melanocephalus':['Ichthyaetus melanocephalus'],
  'larus audouinii':['Ichthyaetus audouinii'],
  'charadrius alexandrinus':['Anarhynchus alexandrinus'],
  'aquila pennata':['Hieraaetus pennatus']
};

export async function loadStickerIndex() {
  if (indexPromise) return indexPromise;
  indexPromise = (async () => {
    const response = await fetch(INDEX_URL);
    if (!response.ok) throw new Error('Stickerindex: HTTP ' + response.status);
    const index = await response.json();
    if (!Array.isArray(index.stickers)) throw new Error('Stickerindex: onverwacht formaat');
    const base = typeof index.cdn === 'string' && /^https:\/\//.test(index.cdn)
      ? index.cdn.replace(/\/?$/, '/') : CDN;
    let valid = 0;
    for (const r of index.stickers) {
      // Crucial fix: a record's `scientific` field is optional;
      // we ALWAYS index the exact filename, even if metadata names are absent.
      const path = safeStickerPath(r.file);
      if (!path) continue;
      const url = base + path;
      byName.set(filenameKey(path), url);
      for (const name of [r.scientific, r.scientificName, r.sci, r.id]) {
        if (name && !byName.has(norm(name))) byName.set(norm(name), url);
      }
      valid++;
    }
    console.info('Mijn Vogelboek: ' + valid + ' stickerbestanden ingelezen.');
    // Log independently whether the requested names exist in the current index.
    for (const [nl, spec] of Object.entries(exactSpecies)) {
      console.info('[sticker-check]', nl, byName.has(norm(spec.scientific)) ? 'in index' : 'exact pad als extra optie');
    }
    return valid;
  })();
  try { return await indexPromise; }
  catch (e) { indexPromise = null; throw e; }
}

export function stickerMatch(scientific, dutchName = '') {
  const nl = norm(dutchName), exact = exactSpecies[nl];
  if (exact) {
    // Look up actual filename in index; only use the named species.
    const url = byName.get(norm(exact.scientific)) || CDN + exact.file;
    return {url, kind:'exact', scientific: exact.scientific, label:dutchName};
  }
  const candidates = [scientific, ...(scientificAliases[norm(scientific)] || []), ...(dutchAliases[nl] || [])];
  for (const name of candidates) {
    const url = byName.get(norm(name));
    if (url) return {url,kind:'exact',scientific:name,label:dutchName};
  }
  return null;
}
export function stickerFor(scientific,dutchName='') {
  return stickerMatch(scientific,dutchName)?.url || '';
}
