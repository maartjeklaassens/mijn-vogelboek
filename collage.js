/**
 * Mijn Vogelboek — levenslijstcollage.
 * Eigen, frameworkvrije implementatie geïnspireerd door Everybird van Yusuf Taleb
 * (https://github.com/yusuftaleb/everybird, MIT).
 * Illustraties: huashu-bird-sticker, CC BY 4.0.
 * Gebruikt uitsluitend de bestaande soortspecifieke stickerCandidates-resolver.
 */
const escapeHtml = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastCleanup = null;
let chosenView = 'collage';
let scientificLabels = false;
let groupFilter = 'alle';
let activePositions = [];
let activeBirds = [];

function hash(s) {
  let h=2166136261;
  for(let i=0;i<s.length;i++)h=Math.imul(h ^ s.charCodeAt(i),16777619);
  return h>>>0;
}
const rand = n => (Math.sin(n*12.9898+78.233)*43758.5453)%1;
function safeRand(n) {const r=rand(n);return r-Math.floor(r);}

// Het middelste aantal krijgt een werkelijk vrijgehouden rechthoek.
// Iedere sticker heeft zijn eigen hitbox; ruimtelijke hash voorkomt O(n³)-werk.
function pack(birds, width) {
  const n=birds.length;
  const w=Math.max(260,Math.round(width));
  const narrow=w<530;
  const baseH=narrow?Math.max(480,Math.min(2300,500+n*3.5)):Math.max(440,Math.min(1650,440+n*1.9));
  const h=Math.ceil(baseH);
  const area=w*h;
  const nominal=Math.min(narrow?92:120,Math.max(narrow?24:29,Math.sqrt(area/Math.max(12,n)*0.46)));
  const cx=w/2,cy=h/2;
  const holeW=Math.min(w*.55,narrow?155:220),holeH=narrow?115:155;
  const bins=new Map();
  const cell=46;
  const out=[];
  function key(x,y){return x+','+y}
  function eachNearby(x,y,s,fn){
    const l=Math.floor((x-s/2-7)/cell), r=Math.floor((x+s/2+7)/cell);
    const t=Math.floor((y-s/2-7)/cell), b=Math.floor((y+s/2+7)/cell);
    for(let a=l;a<=r;a++)for(let z=t;z<=b;z++)for(const j of bins.get(key(a,z))||[])if(fn(out[j]))return true;
    return false;
  }
  function insert(p){
    const i=out.length;out.push(p);
    for(let a=Math.floor((p.x-p.s/2-7)/cell);a<=Math.floor((p.x+p.s/2+7)/cell);a++)
      for(let z=Math.floor((p.y-p.s/2-7)/cell);z<=Math.floor((p.y+p.s/2+7)/cell);z++){
        const k=key(a,z);if(!bins.has(k))bins.set(k,[]);bins.get(k).push(i);
      }
  }
  const ordered=[...birds].sort((a,b)=>hash(a.id)-hash(b.id));
  // Voor een kleine lijst mogen vogels groter zijn; voor een lange lijst
  // wordt de ruimte gevuld met compacte, maar nog duidelijk herkenbare stickers.
  ordered.forEach((bird,index)=>{
    const jitter=.81+safeRand(hash(bird.id))*0.42;
    let s=Math.max(18,nominal*jitter);
    let chosen=null;
    for(let shrink=0;shrink<6&&!chosen;shrink++){
      const step=s*(0.88**shrink), pad=2.0;
      for(let k=0;k<3200;k++){
        // Gulden-hoekspiraal met stabiele per-soort jitter: organische spreiding.
        const prog=(k+.5)/3200;
        const theta=k*2.399963229728653+hash(bird.id)%29;
        const rad=Math.sqrt(prog);
        const x=cx+Math.cos(theta)*rad*(w/2-step*.65);
        const y=cy+Math.sin(theta)*rad*(h/2-step*.65);
        const left=x-step/2,top=y-step/2;
        if(left<4||top<4||left+step>w-4||top+step>h-4)continue;
        if(left<cx+holeW/2+pad&&left+step>cx-holeW/2-pad&&top<cy+holeH/2+pad&&top+step>cy-holeH/2-pad)continue;
        const conflict=eachNearby(x,y,step,p=>Math.abs(p.x-x)<(p.s+step)*.44+pad && Math.abs(p.y-y)<(p.s+step)*.44+pad);
        if(!conflict){chosen={id:bird.id,bird,x,y,s:step,deg:(safeRand(hash(bird.id)+10)-.5)*19};break;}
      }
    }
    if(chosen)insert(chosen);
  });
  // Als uitzonderlijk veel soorten niet meer in het kader passen, wordt het
  // kader uitgebreid en opnieuw ingedeeld (geen stilzwijgend verdwenen vogels).
  return {positions:out,width:w,height:h,count:n,missing:n-out.length};
}

function validBirds(species,entries,stickerCandidates){
  return species.filter(s=>entries[s.id]?.seen).map(s=>{
    const candidates=stickerCandidates(s.scientific,s.name).map(c=>c.url);
    return {...s,urls:[...new Set(candidates)]};
  }).sort((a,b)=>a.name.localeCompare(b.name,'nl'));
}
function firstImage(b){return b.urls[0]||''}
function stageHtml(birds,count){
  const note=count===0?'Vink je eerste vogel af om je collage te beginnen.':'';
  return `<div class="vb-collage-stage" id="vb-collage-stage" role="group" aria-label="Collage van ${count} geziene soorten"><div class="vb-collage-counter"><strong>${count.toLocaleString('nl-NL')}</strong><span>SOORTEN</span></div>${note?`<div class="vb-collage-empty">${note}</div>`:''}</div>`;
}
function listHtml(birds){return `<div class="vb-collage-list">${birds.map(b=>`<button type="button" class="vb-collage-list-row" data-collage-species="${escapeHtml(b.id)}"><span class="vb-collage-mini">${firstImage(b)?`<img loading="lazy" src="${escapeHtml(firstImage(b))}" alt="">`:'◇'}</span><span><strong>${escapeHtml(scientificLabels?b.scientific:b.name)}</strong><small>${escapeHtml(scientificLabels?b.name:b.scientific)}</small></span><span aria-hidden="true">›</span></button>`).join('')}</div>`;}

function createStickers(stage,positions){
  const frag=document.createDocumentFragment();
  positions.forEach((p,i)=>{
    const b=p.bird;
    const button=document.createElement('button');
    button.type='button';button.className='vb-collage-bird';
    button.dataset.collageSpecies=b.id;
    button.title=scientificLabels?b.scientific:b.name;
    button.setAttribute('aria-label',b.name+' — bekijk de waarneming');
    button.style.cssText=`left:${p.x-p.s/2}px;top:${p.y-p.s/2}px;width:${p.s}px;height:${p.s}px;--rotate:${p.deg.toFixed(2)}deg;--delay:${Math.min(i*7,600)}ms;`;
    if(b.urls.length){
      const image=document.createElement('img');
      image.alt='';image.loading=i<70?'eager':'lazy';image.decoding='async';image.referrerPolicy='no-referrer';
      let ix=0;
      image.onerror=()=>{ix++;if(ix<b.urls.length)image.src=b.urls[ix];else{image.remove();button.classList.add('vb-collage-outline');button.innerHTML='<span aria-hidden="true">◇</span>';}};
      image.src=b.urls[0];button.appendChild(image);
    } else {button.classList.add('vb-collage-outline');button.innerHTML='<span aria-hidden="true">◇</span>';}
    const hint=document.createElement('span');hint.className='vb-collage-hint';hint.textContent=scientificLabels?b.scientific:b.name;
    button.appendChild(hint);frag.appendChild(button);
  });
  stage.appendChild(frag);
}

async function exportPng(stage,positions,count){
  const scale=2;
  const width=Math.ceil(stage.clientWidth),height=Math.ceil(stage.clientHeight);
  const canvas=document.createElement('canvas');canvas.width=width*scale;canvas.height=height*scale;
  const c=canvas.getContext('2d');c.scale(scale,scale);
  c.fillStyle='#f6f4ef';c.fillRect(0,0,width,height);
  const images=await Promise.all(positions.map(async p=>{
    for(const u of p.bird.urls){
      try{
        const image=new Image();image.crossOrigin='anonymous';image.referrerPolicy='no-referrer';
        await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=u;});
        return image;
      }catch{} // dezelfde soort via volgende geldige host
    }
    return null;
  }));
  positions.forEach((p,i)=>{
    const img=images[i];
    if(img){c.save();c.translate(p.x,p.y);c.rotate(p.deg*Math.PI/180);c.drawImage(img,-p.s/2,-p.s/2,p.s,p.s);c.restore();}
    else{c.strokeStyle='#b5aea4';c.font=`${Math.max(15,p.s*.55)}px Georgia`;c.textAlign='center';c.fillStyle='#a49c90';c.fillText('◇',p.x,p.y+6);}
  });
  const num=count.toLocaleString('nl-NL');
  c.textAlign='center';c.fillStyle='#1e1e24';c.font=`700 ${Math.min(width*.19,108)}px Georgia,serif`;
  c.fillText(num,width/2,height/2+12);
  c.font='600 13px sans-serif';c.fillStyle='#77736e';c.fillText('S O O R T E N',width/2,height/2+38);
  c.fillStyle='#625d58';c.font='12px sans-serif';c.fillText('Mijn Vogelboek · stickers: huashu-bird-sticker (CC BY 4.0)',width/2,height-12);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw new Error('Afbeelding maken mislukt');
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mijn-vogelboek-collage.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
}

export function collagePanelHtml(species,entries){
  const count=species.filter(s=>entries[s.id]?.seen).length;
  return `<section class="vb-collage" id="vb-collage" aria-label="Vogelcollage van ${count} geziene soorten"><div id="vb-collage-content">${stageHtml([],count)}</div></section>`;
}

export function mountCollage({species,entries,stickerCandidates,onSelect}){
  if(lastCleanup){lastCleanup();lastCleanup=null;}
  const root=document.getElementById('vb-collage');if(!root)return;
  const content=root.querySelector('#vb-collage-content');
  let disposed=false,observer=null,lastWidth=0;
  const all=validBirds(species,entries,stickerCandidates);
  function paint(){
    if(disposed||!root.isConnected)return;
    const filtered=all;
    activeBirds=filtered;
    const width=Math.min(1130,Math.max(260,Math.floor(content.getBoundingClientRect().width)));

    content.innerHTML=stageHtml(filtered,filtered.length);
    const stage=content.querySelector('#vb-collage-stage');
    if(!filtered.length){stage.style.height='330px';activePositions=[];return;}
    const result=pack(filtered,width);
    stage.style.height=result.height+'px';
    activePositions=result.positions;
    createStickers(stage,result.positions);
    if(result.missing)console.warn(`Vogelcollage: ${result.missing} stickers pasten niet in de beschikbare ruimte.`);
  }
  function clicks(e){
    const bird=e.target.closest('[data-collage-species]');
    if(bird)onSelect(bird.dataset.collageSpecies);
  }
  root.addEventListener('click',clicks);
  observer=new ResizeObserver(entries=>{const w=Math.round(entries[0].contentRect.width);if(Math.abs(w-lastWidth)>12){lastWidth=w;paint();}});
  observer.observe(content);
  paint();
  lastCleanup=()=>{disposed=true;observer.disconnect();root.removeEventListener('click',clicks)};
}
