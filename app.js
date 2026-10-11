import {seed} from './species.js';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const validPages=['dashboard','vogels','fotos','ontdekken','statistieken','instellingen'];
const rarityOrder=['Algemeen','Schaars','Zeldzaam','Dwaalgast'];

function getHashPage(){
    const h=location.hash.replace('#','');
    return validPages.includes(h)?h:'dashboard';
}

let page=getHashPage(),term='',group='Alle groepen',rarity='Alle zeldzaamheden',filter='alle',modal=null, busy=false, message='',msgType='notice';
let species=seed;
let entries=JSON.parse(localStorage.getItem('vogelboek-entries')||'{}');
let supabase=null,session=null,cloud=false;let config=JSON.parse(localStorage.getItem('vogelboek-config')||'null');
const STORE='vogelboek-entries';
function saveLocal(){localStorage.setItem(STORE,JSON.stringify(entries))}
function notify(t,typ='notice'){message=t;msgType=typ;render()}

async function initCloud(){
    if(!config?.url||!config?.key){render();return}
    try{
        const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2');
        supabase=createClient(config.url,config.key);
        const {data:{session:s}}=await supabase.auth.getSession();
        session=s;cloud=!!s;
        if(s)await fetchCloud();
        if(location.hash.includes('access_token=')){
            history.replaceState(null,'','#dashboard');
            page='dashboard';
        }
        supabase.auth.onAuthStateChange((_event,s)=>{
            session=s;cloud=!!s;
            if(s){setTimeout(()=>fetchCloud(),0)}else{entries={};render()}
        });
    }catch(e){message='Cloudverbinding niet beschikbaar: '+e.message;msgType='error'}
    render();
}

async function fetchCloud(){if(!supabase||!session)return;try{const {data,error}=await supabase.from('observations').select('species_id,seen_date,location,photo_path,created_at');if(error)throw error;entries={};for(const d of data)entries[d.species_id]={seen:true,date:d.seen_date||'',location:d.location||'',photoPath:d.photo_path||''};cloud=true;render()}catch(e){notify('Ophalen mislukt: '+e.message,'error')}}
async function persist(id,obj,file){if(cloud){let path=obj.photoPath||null;if(file){if(!file.type.startsWith('image/'))throw Error('Kies een afbeeldingsbestand.');if(file.size>8*1024*1024)throw Error('Foto mag maximaal 8 MB zijn.');path=session.user.id+'/'+id+'/'+crypto.randomUUID()+'-'+file.name.replace(/[^a-zA-Z0-9_.-]/g,'_');const up=await supabase.storage.from('bird-photos').upload(path,file,{contentType:file.type});if(up.error)throw up.error}const {error}=await supabase.from('observations').upsert({user_id:session.user.id,species_id:id,seen_date:obj.date||null,location:obj.location||null,photo_path:path},{onConflict:'user_id,species_id'});if(error)throw error;entries[id]={...obj,photoPath:path};return}if(file){if(!file.type.startsWith('image/'))throw Error('Kies een afbeeldingsbestand.');if(file.size>2*1024*1024)throw Error('In de lokale proefstand maximaal 2 MB per foto.');obj.photo=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Foto lezen mislukt'));r.readAsDataURL(file)})}entries[id]=obj;try{saveLocal()}catch(e){throw Error('Browseropslag is vol. Kies een kleinere foto of koppel cloudopslag.')}}
async function removeEntry(id){if(cloud){const {error}=await supabase.from('observations').delete().eq('species_id',id);if(error)throw error}delete entries[id];if(!cloud)saveLocal()}
async function photoUrl(id){let e=entries[id];if(!e)return '';if(e.photo)return e.photo;if(!e.photoPath||!cloud)return '';const {data,error}=await supabase.storage.from('bird-photos').createSignedUrl(e.photoPath,3600);return error?'':data.signedUrl}
let photoCache={};async function loadPhotos(){if(!cloud)return;const ps=Object.entries(entries).filter(([id,e])=>e.photoPath&&!Object.prototype.hasOwnProperty.call(photoCache,id));await Promise.all(ps.map(async([id])=>{photoCache[id]=await photoUrl(id)}));render()}
function countSeen(){return Object.keys(entries).filter(k=>entries[k]?.seen).length}function countPhoto(){return Object.values(entries).filter(x=>x.seen&&(x.photo||x.photoPath)).length}

const iconBird = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg>`;
const iconCam = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`;
const iconChart = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>`;

const tabs=[
  ['dashboard','⌂','Overzicht'],
  ['vogels',iconBird,'Alle vogels'],
  ['fotos',iconCam,"Mijn foto's"],
  ['ontdekken','⌕','Ontdekken'],
  ['statistieken',iconChart,'Statistieken']
];

function nav(){return tabs.map(([k,icon,title])=>`<button data-page="${k}" class="${k===page?'active':''}"><span style="display:inline-flex;width:20px;justify-content:center">${icon}</span> &nbsp; ${title}</button>`).join('')}
function header(title,sub){return `<div class="top"><div><div class="eyebrow">Mijn persoonlijke natuurdagboek</div><h1>${title}</h1>${sub?`<div class="muted">${sub}</div>`:''}</div>${cloud?'':'<span class="pill">◌ Lokale proefstand</span>'}</div>`}
function stat(label,value){return `<div class="stat"><span>${label}</span><b>${value}</b></div>`}

function dashboard(){const seen=countSeen(),photos=countPhoto();const recent=species.filter(s=>entries[s.id]?.seen).slice(-5);return `${header('Welkom in je vogelboek',"Overzicht van al je waarnemingen en foto's.")}
<div class="hero"><div><div class="eyebrow" style="color:#dab5c6">JOUW LEVENSLIJST</div><h2>Houd je waarnemingen bij</h2><p>Vink je geziene soorten af, voeg je eigen foto's toe en bekijk welke vogels je nog kunt ontdekken.</p><button class="button" style="margin-top:18px;background:#f4e9ed;color:#512534" data-page="vogels">Bekijk alle vogels →</button></div></div>
<div class="stats">${stat('Soorten gezien',seen)}${stat("Met eigen foto",photos)}${stat('Nog zonder foto',seen-photos)}${stat('Dit jaar',Object.values(entries).filter(e=>e.seen&&e.date?.startsWith(new Date().getFullYear().toString())).length)}</div>
<div class="layout"><section class="panel"><div class="panel-header"><h2>Jouw waarnemingen</h2><button class="link" data-page="vogels">Alle vogels →</button></div>${recent.length?recent.map(s=>rowitem(s)).join(''):'<div class="empty">Nog geen waarnemingen. Begin met je eerste vogel afvinken! 🐦</div>'}</section><section class="panel"><h2>Op zoek naar...</h2><p class="sectionlead">Je eigen ontdek-lijst: soorten die je nog wilt zien en gefotografeerde soorten die ontbreken.</p><button class="button" data-page="ontdekken">Bekijk je zoeklijst</button></section></div>`}

function rowitem(s){let e=entries[s.id],src=e?.photo||photoCache[s.id];return `<div class="rowitem">${src?`<img class="thumb" src="${esc(src)}" alt="Eigen foto ${esc(s.name)}">`:`<div class="emoji">${s.emoji||'🐦'}</div>`}<div><b>${esc(s.name)}</b><br><span>${esc(s.group)} · ${esc(s.rarity)}${e?.date?' · '+esc(e.date):''}</span></div><button class="link" data-edit="${esc(s.id)}">Bewerk →</button></div>`}

function card(s){const e=entries[s.id],src=e?.photo||photoCache[s.id];return `<div class="bird-card"><div class="bird-top">${src?`<img src="${esc(src)}" alt="Eigen foto ${esc(s.name)}">`:(s.emoji||'🐦')}<div class="flag">${e?.seen?'✓ Gezien':'○ Niet gezien'}</div></div><div class="bird-info"><b>${esc(s.name)}</b><small>${esc(s.scientific)}</small><div class="counter" style="margin-top:8px">${esc(s.group)} · ${esc(s.rarity)} · ${src?'📷 foto':'geen foto'}</div></div><div class="bird-bottom"><button data-toggle="${esc(s.id)}">${e?.seen?'✓ Gezien':'＋ Gezien'}</button><button data-edit="${esc(s.id)}">Details →</button></div></div>`}

function stampCard(s){const e=entries[s.id],src=e?.photo||photoCache[s.id];return `<div class="stamp-wrapper" data-edit="${esc(s.id)}"><div class="stamp-card"><img src="${esc(src)}" alt="${esc(s.name)}"><div class="stamp-name">${esc(s.name)}</div></div></div>`}

function vogels(){
    let groups=[...new Set(species.map(s=>s.group))].sort();
    let arr=species.filter(s=>
        (s.name+' '+s.scientific).toLowerCase().includes(term.toLowerCase()) &&
        (group==='Alle groepen'||s.group===group) &&
        (rarity==='Alle zeldzaamheden'||s.rarity===rarity) &&
        (filter==='alle'||(filter==='gezien'&&entries[s.id]?.seen)||(filter==='ongezien'&&!entries[s.id]?.seen)||(filter==='zonderfoto'&&entries[s.id]?.seen&&!entries[s.id]?.photo&&!entries[s.id]?.photoPath))
    );
    return `${header('Alle vogels','Zoek, sorteer en bouw je persoonlijke levenslijst op.')}<div class="toolbar" style="margin-bottom:18px"><div class="filterbar"><input class="input search" id="search" placeholder="🔎 Zoek Nederlandse of Latijnse naam" value="${esc(term)}"><select class="select" id="group"><option>Alle groepen</option>${groups.map(g=>`<option ${group===g?'selected':''}>${esc(g)}</option>`).join('')}</select><select class="select" id="rarity"><option>Alle zeldzaamheden</option>${rarityOrder.map(r=>`<option ${rarity===r?'selected':''}>${esc(r)}</option>`).join('')}</select><select class="select" id="filter"><option value="alle" ${filter==='alle'?'selected':''}>Alle soorten</option><option value="gezien" ${filter==='gezien'?'selected':''}>Gezien</option><option value="ongezien" ${filter==='ongezien'?'selected':''}>Niet gezien</option><option value="zonderfoto" ${filter==='zonderfoto'?'selected':''}>Foto ontbreekt</option></select></div><span class="counter">${arr.length} van ${species.length} soorten <small class="muted" style="display:block;font-size:11px;text-align:right">Bron: Dutch Avifauna (CSNA)</small></span></div><div class="birds">${arr.map(card).join('')}</div>${arr.length?'':'<div class="empty">Geen soorten gevonden voor deze filters.</div>'}`;
}

function fotos(){const birds=species.filter(s=>entries[s.id]?.seen&&(entries[s.id].photo||entries[s.id].photoPath));const missing=species.filter(s=>entries[s.id]?.seen&&!entries[s.id].photo&&!entries[s.id].photoPath);return `${header("Mijn foto's",'Jouw eigen vogelfotocollectie.')}${birds.length?`<div class="photo-collage">${birds.map(stampCard).join('')}</div>`:'<div class="empty">Nog geen foto toegevoegd. Open een geziene vogel om jouw foto te uploaden.</div>'}<section class="panel" style="margin-top:35px"><h2>Gezien, maar nog geen foto</h2>${missing.length?missing.map(rowitem).join(''):'<p class="muted">Nog geen soorten zonder foto.</p>'}</section>`}

function ontdekken(){const missing=species.filter(s=>entries[s.id]?.seen&&!entries[s.id]?.photo&&!entries[s.id]?.photoPath);const unseen=species.filter(s=>!entries[s.id]?.seen);return `${header('Ontdekken','Welke vogel wordt jouw volgende?')}<div class="grid2" style="margin-top:20px;align-items:start"><section class="panel"><div class="panel-header"><h2>Wel gezien, geen foto</h2><span class="pill">${missing.length}</span></div>${missing.length?missing.slice(0,15).map(rowitem).join(''):'<p class="muted">Vink eerst een soort af om je fotowensenlijst te vullen.</p>'}</section><section class="panel"><div class="panel-header"><h2>Nog te ontdekken</h2><span class="pill">${unseen.length}</span></div>${unseen.slice(0,15).map(rowitem).join('')}</section></div>`}

function stats(){
    const seen=species.filter(s=>entries[s.id]?.seen),total=species.length;
    const rarities=rarityOrder.map(r=>({r,n:seen.filter(s=>s.rarity===r).length,total:species.filter(s=>s.rarity===r).length}));
    const groups=[...new Set(species.map(s=>s.group))].map(g=>({g,n:seen.filter(s=>s.group===g).length,total:species.filter(s=>s.group===g).length})).sort((a,b)=>b.n-a.n);
    return `${header('Statistieken','Jouw vogeldagboek in cijfers.')}
<div class="stats">${stat('Levenslijst',seen.length)}${stat('Voortgang catalogus',total?Math.round(100*seen.length/total)+'%':'0%')}${stat('Foto’s',countPhoto())}</div>
<section class="panel"><h2>Zeldzaamheid</h2>${rarities.map(x=>`<div class="chartline"><label>${esc(x.r)}</label><div class="track"><div style="width:${x.total?100*x.n/x.total:0}%"></div></div><span>${x.n}/${x.total}</span></div>`).join('')}</section>
<section class="panel"><h2>Vogelgroepen</h2>${groups.map(x=>`<div class="chartline"><label>${esc(x.g)}</label><div class="track"><div style="width:${x.total?100*x.n/x.total:0}%"></div></div><span>${x.n}/${x.total}</span></div>`).join('')}</section>`;
}

function settings(){return `${header('Instellingen','Beheer je account en back-up.')}
<div class="layout"><section class="panel"><h2>${cloud?'Mijn account':'Online synchronisatie'}</h2>${cloud?`<p>Ingelogd als <b>${esc(session.user.email)}</b>. Nieuwe waarnemingen worden online opgeslagen.</p><button class="button alt" id="logout">Uitloggen</button>`:`<p class="sectionlead">Je gebruikt ${supabase?'nog geen ingelogd account':'de lokale proefstand'}. Om synchronisatie en privé-foto’s in te schakelen, koppel je eerst een Supabase-project volgens de README.</p><div class="formfield">Supabase project URL<input class="input" id="supurl" value="${esc(config?.url||'')}" placeholder="https://xxxx.supabase.co"></div><div class="formfield">Publishable / anon key<input class="input" id="supkey" value="${esc(config?.key||'')}" placeholder="sb_publishable_..."></div><button class="button" id="connect">Verbinding opslaan</button>${supabase?`<hr style="border:0;border-top:1px solid #ebe4e7;margin:22px 0"><form id="loginform"><label class="formfield">E-mailadres<input type="email" class="input" name="email" required></label><label class="formfield">Wachtwoord<input type="password" class="input" name="password" minlength="6" required></label><button class="button" value="login" name="action">Inloggen</button> <button class="button alt" value="signup" name="action">Account maken</button></form>`:''}`}</section>
<section class="panel"><h2>Back-up van je gegevens</h2><p class="sectionlead">Download je gegevens als JSON. Foto's uit de online opslag worden als verwijzing opgenomen; bewaar daarvan zelf ook kopieën.</p><button class="button alt" id="export">Download JSON-back-up</button> <label class="button outline" style="display:inline-block;cursor:pointer">Importeer JSON <input type="file" id="import-json" accept=".json" hidden></label><p class="muted" style="font-size:12px">JSON-import is alleen in de lokale proefstand mogelijk. Voor bestaande lokale gegevens geldt: importeer ze vóór je aan je online account begint.</p></section></div>`}

function modalHtml(){if(!modal)return '';const s=species.find(x=>x.id===modal);if(!s)return '';const e=entries[s.id]||{};return `<div class="overlay" id="overlay"><div class="modal"><div class="modalhead"><div><div class="eyebrow">${esc(s.group)} · ${esc(s.rarity)}</div><h2 style="margin:5px 0">${esc(s.name)}</h2><i class="muted">${esc(s.scientific)}</i></div><button class="x" id="close">×</button></div><form id="obsform" style="margin-top:22px"><label class="formfield" style="display:flex;align-items:center;gap:10px;flex-direction:row;font-size:16px"><input type="checkbox" id="seen" name="seen" ${e.seen?'checked':''} style="width:19px;height:19px"> Deze soort heb ik gezien</label><div id="obsfields"><div class="grid2"><label class="formfield">Datum <small>optioneel</small><input class="input" type="date" name="date" value="${esc(e.date||'')}"></label><label class="formfield">Locatie <small>optioneel</small><input class="input" name="location" maxlength="240" placeholder="Bijv. Lauwersmeer" value="${esc(e.location||'')}"></label></div><label class="formfield">Mijn eigen foto <small>optioneel; jpg/png/webp, maximaal 8 MB online</small><input class="input" type="file" name="photo" accept="image/*"></label>${e.photo||photoCache[s.id]?`<img class="photo" src="${esc(e.photo||photoCache[s.id])}" alt="Eigen foto">`:''}</div><div style="display:flex;justify-content:space-between;gap:10px;margin-top:25px"><button type="button" class="button danger" id="delete" ${!e.seen?'disabled':''}>Verwijder waarneming</button><button type="submit" class="button" id="save">Opslaan</button></div></form></div></div>`}

function render(){const views={dashboard,vogels,fotos,ontdekken,statistieken:stats,instellingen:settings};$('#app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="logo">Mijn Vogelboek<small>Vogels verzamelen</small></div><div class="nav">${nav()}</div><div class="foot"><div class="account">${cloud?'':'◌ Lokale proefstand<br>'}<button class="button alt" data-page="instellingen">⚙ Instellingen</button></div><p>Een online dagboek voor vogels.</p></div></aside><main class="main">${message?`<div class="notice ${msgType}">${esc(message)} <button class="link" id="dismiss">×</button></div>`:''}${(views[page]||dashboard)()}</main><nav class="mobile-nav">${tabs.map(([k,ic,t])=>`<button data-page="${k}" class="${k===page?'active':''}"><span style="font-size:19px;display:flex;align-items:center;height:22px">${ic}</span>${t}</button>`).join('')}<button data-page="instellingen" class="${page==='instellingen'?'active':''}"><span style="font-size:19px;display:flex;align-items:center;height:22px">⚙</span><span>Instellingen</span></button></nav></div>${modalHtml()}`;const f=$('#obsfields');if(f)f.style.opacity=$('#seen').checked?'1':'.45';if(cloud&&Object.values(entries).some(e=>e.photoPath)&&Object.entries(entries).some(([id,e])=>e.photoPath&&!Object.prototype.hasOwnProperty.call(photoCache,id)))loadPhotos()}

window.addEventListener('hashchange',()=>{
    const newPage=getHashPage();
    if(newPage!==page || modal!==null){
        page=newPage;
        modal=null;
        render();
        window.scrollTo(0,0);
    }
});

document.addEventListener('click',async ev=>{let t=ev.target.closest('[data-page],[data-edit],[data-toggle],#close,#delete,#logout,#connect,#export,#dismiss');if(!t)return;if(t.dataset.page){const target=t.dataset.page;if(location.hash==='#'+target){page=target;modal=null;render();window.scrollTo(0,0)}else{location.hash=target}}else if(t.dataset.edit){modal=t.dataset.edit;render()}else if(t.dataset.toggle){const id=t.dataset.toggle;try{if(entries[id]?.seen){await removeEntry(id)}else await persist(id,{seen:true,date:'',location:''});render()}catch(e){notify(e.message,'error')}}else if(t.id==='close'){modal=null;render()}else if(t.id==='dismiss'){message='';render()}else if(t.id==='delete'){if(!confirm('Wil je deze waarneming verwijderen?'))return;try{await removeEntry(modal);modal=null;render()}catch(e){notify(e.message,'error')}}else if(t.id==='logout'){await supabase.auth.signOut();entries={};cloud=false;render()}else if(t.id==='connect'){let url=$('#supurl').value.trim(),key=$('#supkey').value.trim();if(!/^https:\/\/[\w-]+\.supabase\.co\/?$/.test(url)||!key){notify('Voer een geldige Supabase URL en publishable key in.','error');return}localStorage.setItem('vogelboek-config',JSON.stringify({url,key}));config={url,key};location.reload()}else if(t.id==='export'){const payload=JSON.stringify({version:1,species,entries},null,2);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([payload],{type:'application/json'}));a.download='mijn-vogelboek-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)}});
document.addEventListener('input',e=>{if(e.target.id==='search'){let pos=e.target.selectionStart;term=e.target.value;render();const el=$('#search');el.focus();el.setSelectionRange(pos,pos)}});
document.addEventListener('change',async e=>{if(e.target.id==='group'){group=e.target.value;render()}else if(e.target.id==='rarity'){rarity=e.target.value;render()}else if(e.target.id==='filter'){filter=e.target.value;render()}else if(e.target.id==='seen'){$('#obsfields').style.opacity=e.target.checked?'1':'.45'}else if(e.target.id==='import-json'){if(cloud){notify('Importeer JSON alleen in de lokale proefstand.','error');return}try{let x=JSON.parse(await e.target.files[0].text());if(!x.entries||typeof x.entries!=='object')throw Error('Ongeldige back-up');if(!confirm('Vervang lokale waarnemingen door deze back-up?'))return;entries=x.entries;saveLocal();notify('Back-up geïmporteerd.','success')}catch(err){notify(err.message,'error')}}});
document.addEventListener('submit',async ev=>{if(ev.target.id==='obsform'){ev.preventDefault();const f=ev.target;if(busy)return;busy=true;try{if(!f.elements.seen.checked){await removeEntry(modal)}else{const old=entries[modal]||{};await persist(modal,{...old,seen:true,date:f.elements.date.value,location:f.elements.location.value},f.elements.photo.files[0]);if(cloud){delete photoCache[modal];if(entries[modal].photoPath)photoCache[modal]=await photoUrl(modal)}}modal=null;notify('Waarneming opgeslagen.','success')}catch(e){notify('Opslaan mislukt: '+e.message,'error')}finally{busy=false}}else if(ev.target.id==='loginform'){ev.preventDefault();const f=ev.target;const btn=ev.submitter;const email=f.elements.email.value,password=f.elements.password.value;try{const result=btn.value==='signup'?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});if(result.error)throw result.error;notify(btn.value==='signup'?'Account aangemaakt. Controleer zo nodig je e-mail ter bevestiging.':'Je bent ingelogd.','success')}catch(e){notify(e.message,'error')}}});
initCloud();
