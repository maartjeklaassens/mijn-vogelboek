// Sticker index: https://github.com/alchaincyf/huashu-bird-sticker
// AI-illustraties CC BY 4.0; indexdata MIT.
// We zoeken primair op wetenschappelijke naam, maar vangen ook taxonomische
// naamswijzigingen en een aantal Nederlandse namen/subsoorten op.
const INDEX_URL = 'https://cdn.jsdelivr.net/gh/alchaincyf/huashu-bird-sticker@main/data/stickers.json';
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/alchaincyf/huashu-bird-sticker@main/';
const stickerMap = new Map();
let loading = null;

function normalize(name){
    return String(name ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'')
        .trim()
        .replace(/[_’'`-]/g,' ')
        .replace(/\s+/g,' ')
        .toLowerCase();
}

// Handmatige vangnetten voor soorten die in jouw Nederlandse lijst anders heten,
// op ondersoortniveau staan of in AviList een andere wetenschappelijke naam hebben.
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

// Door gebruiker gecontroleerde namen. De bestandsnamen uit de repository
// zijn doorgaans .webp; de volledige URL halen we uit data/stickers.json.
const confirmedStickerNames = {
    'amerikaanse wintertaling': 'Anas carolinensis',
    'woudaap': 'Ixobrychus minutus',
    'koereiger': 'Bubulcus ibis',
    'humes braamsluiper': 'Curruca althaea',
    'bonte kraai': 'Corvus cornix',
    'amerikaanse grote stern': 'Thalasseus acuflavidus',
    'witstuitbarmsijs': 'Acanthis hornemanni',
    'maskergors': 'Emberiza personata',
    'wilgengors': 'Emberiza aureola',
    'rietgors': 'Emberiza schoeniclus'
};

const scientificAliases = {
    'cygnus columbianus': ['Cygnus bewickii'],
    'phalacrocorax pygmeus': ['Microcarbo pygmaeus'],
    'phalacrocorax aristotelis': ['Gulosus aristotelis'],
    'accipiter gentilis': ['Astur gentilis'],
    'corvus monedula': ['Coloeus monedula'],
    'corvus dauuricus': ['Coloeus dauuricus'],
    'dendrocopos medius': ['Dendrocoptes medius'],
    'larus melanocephalus': ['Ichthyaetus melanocephalus'],
    'larus audouinii': ['Ichthyaetus audouinii'],
    'sternula sandvicensis': ['Thalasseus sandvicensis'],
    'ster na sandvicensis': ['Thalasseus sandvicensis'],
    'ster na acuflavida': ['Thalasseus acuflavidus'],
    'st erna sandvicensis': ['Thalasseus sandvicensis'],
    'st erna acuflavida': ['Thalasseus acuflavidus'],
    'sterna sandvicensis': ['Thalasseus sandvicensis'],
    'sterna acuflavida': ['Thalasseus acuflavidus'],
    'aquila pennata': ['Hieraaetus pennatus'],
    'charadrius alexandrinus': ['Anarhynchus alexandrinus'],
    'eudromias morinellus': ['Charadrius morinellus'],
    'puffinus griseus': ['Ardenna grisea'],
    'puffinus gravis': ['Ardenna gravis'],
    'calonectris diomedea': ['Calonectris borealis'],
    'sylvia curruca': ['Curruca curruca'],
    'sylvia melanocephala': ['Curruca melanocephala'],
    'sylvia undata': ['Curruca undata'],
    'sylvia althaea': ['Curruca althaea'],
    'saxicola maura': ['Saxicola maurus'],
    'motacilla flava flavissima': ['Motacilla flavissima','Motacilla flava'],
    'motacilla alba yarrellii': ['Motacilla yarrellii','Motacilla alba'],
    'motacilla flava thunbergi': ['Motacilla thunbergi','Motacilla flava'],
    'branta hrota': ['Branta bernicla'],
    'branta nigricans': ['Branta bernicla'],
    'anas crecca carolinensis': ['Anas carolinensis'],
    'corvus corone cornix': ['Corvus cornix'],
    'curruca curruca althaea': ['Curruca althaea','Sylvia althaea'],
    'acanthis flammea cabaret': ['Acanthis cabaret'],
    'carduelis flammea cabaret': ['Acanthis cabaret','Carduelis cabaret'],
    'acanthis flammea hornemanni': ['Acanthis hornemanni'],
    'acanthis exilipes': ['Acanthis hornemanni'],
    'carduelis hornemanni exilipes': ['Acanthis hornemanni','Carduelis hornemanni'],
    'emberiza spodocephala personata': ['Emberiza personata'],
    'motacilla flava cinereocapilla': ['Motacilla cinereocapilla','Motacilla flava'],
    'branta hutchinsii minima': ['Branta hutchinsii']
};

// Geen vervangende soorten: als een identieke soort niet in de index kan worden
// gevonden, blijft het bestaande groepssilhouet zichtbaar.

function pushUnique(list, value){
    if(!value) return;
    const key = normalize(value);
    if(key && !list.some(x => normalize(x) === key)) list.push(value);
}

function buildScientificCandidates(scientific = '', dutchName = ''){
    const out = [];
    const sci = String(scientific || '').trim();
    const dutchKey = normalize(dutchName);
    const sciKey = normalize(sci);

    // Voor de expliciet bevestigde soorten nooit terugvallen op een andere soort.
    if (confirmedStickerNames[dutchKey]) return [confirmedStickerNames[dutchKey]];
    pushUnique(out, sci);

    if(scientificAliases[sciKey]) {
        for (const candidate of scientificAliases[sciKey]) pushUnique(out, candidate);
    }

    if (sci.startsWith('Sylvia ')) pushUnique(out, sci.replace(/^Sylvia\s+/,'Curruca '));
    if (sci.startsWith('Curruca ')) pushUnique(out, sci.replace(/^Curruca\s+/,'Sylvia '));
    if (sci.startsWith('Corvus monedula')) pushUnique(out, sci.replace(/^Corvus\s+/,'Coloeus '));
    if (sci.startsWith('Corvus dauuricus')) pushUnique(out, sci.replace(/^Corvus\s+/,'Coloeus '));
    if (sci.startsWith('Accipiter gentilis')) pushUnique(out, 'Astur gentilis');
    if (sci.startsWith('Dendrocopos medius')) pushUnique(out, 'Dendrocoptes medius');
    if (sci.startsWith('Phalacrocorax pygmeus')) pushUnique(out, 'Microcarbo pygmaeus');
    if (sci.startsWith('Phalacrocorax aristotelis')) pushUnique(out, 'Gulosus aristotelis');
    if (sci.startsWith('Sterna sandvicensis')) pushUnique(out, 'Thalasseus sandvicensis');
    if (sci.startsWith('Sterna acuflavida')) pushUnique(out, 'Thalasseus acuflavidus');
    if (sci.startsWith('Aquila pennata')) pushUnique(out, 'Hieraaetus pennatus');
    if (sci.startsWith('Charadrius alexandrinus')) pushUnique(out, 'Anarhynchus alexandrinus');
    if (sci.startsWith('Puffinus griseus')) pushUnique(out, 'Ardenna grisea');
    if (sci.startsWith('Puffinus gravis')) pushUnique(out, 'Ardenna gravis');
    if (sci.startsWith('Calonectris diomedea')) {
        pushUnique(out, 'Calonectris borealis');
        pushUnique(out, 'Calonectris diomedea');
    }

    if(dutchAliases[dutchKey]) {
        for (const candidate of dutchAliases[dutchKey]) pushUnique(out, candidate);
    }

    return out;
}

export async function loadStickerIndex(){
    if(loading) return loading;
    loading = (async()=>{
      const response = await fetch(INDEX_URL);
      if(!response.ok) throw new Error('HTTP ' + response.status);
      const index = await response.json();
      if(!Array.isArray(index.stickers)) throw new Error('Stickerindex heeft onverwacht formaat');
      const base = typeof index.cdn === 'string' && index.cdn.startsWith('https://cdn.jsdelivr.net/') ? index.cdn : CDN_BASE;
      for(const record of index.stickers){
        if(typeof record.file !== 'string' || !record.file.startsWith('stickers/') || record.file.includes('..')) continue;
        const scientific = record.scientific || record.sci || record.scientificName || record.name || record.id;
        if(!scientific) continue;
        const key = normalize(scientific);
        if(!stickerMap.has(key)) stickerMap.set(key, base + record.file);
        // Extra exacte index op bestandsnaam (Genus_species.webp), juist omdat
        // de metadata soms een andere taxonomische weergave gebruikt.
        const basename = record.file.split('/').pop().replace(/\.(webp|png|jpg|jpeg)$/i, '');
        const fileKey = normalize(basename);
        if (!stickerMap.has(fileKey)) stickerMap.set(fileKey, base + record.file);
      }
      console.info(`Vogelstickers: ${stickerMap.size} afbeeldingen geïndexeerd`);
      return stickerMap.size;
    })();
    try { return await loading; }
    catch(err) { loading = null; throw err; }
}

export function stickerMatch(scientific, dutchName = ''){
    for(const candidate of buildScientificCandidates(scientific, dutchName)){
        const url=stickerMap.get(normalize(candidate));
        if(url) return {url,kind:'exact',label:dutchName,scientific:candidate};
    }
    return null;
}

export function stickerFor(scientific, dutchName = ''){
    return stickerMatch(scientific,dutchName)?.url || '';
}
