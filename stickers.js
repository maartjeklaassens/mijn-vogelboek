// Sticker index: https://github.com/alchaincyf/huashu-bird-sticker
// AI-illustraties CC BY 4.0; indexdata MIT. Wetenschappelijke namen gebruiken
// zodat Nederlandse vertalingen geen onjuiste match opleveren.
const INDEX_URL = 'https://cdn.jsdelivr.net/gh/alchaincyf/huashu-bird-sticker@main/data/stickers.json';
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/alchaincyf/huashu-bird-sticker@main/';
const stickerMap = new Map();
let loading = null;
function normalize(name){
    return String(name??'').trim().replace(/_/g,' ').replace(/\s+/g,' ').toLowerCase();
}
export async function loadStickerIndex(){
    if(loading) return loading;
    loading=(async()=>{
      const response=await fetch(INDEX_URL);
      if(!response.ok) throw new Error('HTTP '+response.status);
      const index=await response.json();
      if(!Array.isArray(index.stickers)) throw new Error('Stickerindex heeft onverwacht formaat');
      const base=typeof index.cdn==='string' && index.cdn.startsWith('https://cdn.jsdelivr.net/')?index.cdn:CDN_BASE;
      for(const record of index.stickers){
        if(typeof record.file!=='string' || !record.file.startsWith('stickers/') || record.file.includes('..')) continue;
        // Index bevat wetenschappelijke naam; herken ook velden uit eerdere releases.
        const scientific=record.scientific || record.sci || record.scientificName || record.name || record.id;
        if(!scientific) continue;
        const key=normalize(scientific);
        if(!stickerMap.has(key)) stickerMap.set(key,base+record.file);
      }
      console.info(`Vogelstickers: ${stickerMap.size} afbeeldingen geïndexeerd`);
      return stickerMap.size;
    })();
    try{return await loading}catch(err){loading=null;throw err}
}
export function stickerFor(scientific){return stickerMap.get(normalize(scientific))||''}
