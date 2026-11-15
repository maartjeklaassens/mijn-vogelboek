#!/usr/bin/env python3
"""Bouw per Nederlandse soort een EXACT geverifieerde bron-stickerkaart.

Draait in GitHub Actions na een blobloze Git clone van huashu-bird-sticker.
Elke uitgegeven afbeeldingsnaam komt voor in de upstream Git-boom; nooit een
vervangende soortsticker genereren. Informatie over het werkelijk renderen van
afbeeldingen vereist afzonderlijke browser-/HTTP-tests.
"""
import csv
import io
import json
import re
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
UP=Path('/tmp/huashu-source')
TARGETS={
  'Witbuikrotgans': ('Branta bernicla','hrota'),
  'Zwarte Rotgans': ('Branta bernicla','nigricans'),
  'Thayers Meeuw': ('Larus glaucoides','thayeri'),
  # Steppeklapekster is in de site Lanius lahtora; niet zonder taxonomisch bewijs omzetten naar pallidirostris.
  'Steppeklapekster': ('Lanius lahtora','lahtora'),
  'Strandleeuwerik': ('Eremophila alpestris','flava'),
  'Siberische Tjiftjaf': ('Phylloscopus collybita','tristis'),
  'Humes Braamsluiper': ('Curruca curruca','althaea'),
  'Engelse Kwikstaart': ('Motacilla flava','flavissima'),
  'Noordse Kwikstaart': ('Motacilla flava','thunbergi'),
  'Witkeelkwikstaart': ('Motacilla flava','cinereocapilla'),
  'Balkankwikstaart': ('Motacilla flava','feldegg'),
  'Rouwkwikstaart': ('Motacilla alba','yarrellii'),
  'Witstuitbarmsijs': ('Acanthis flammea','hornemanni'),
  'Kleinste Canadese Gans': ('Branta hutchinsii','minima')
}
# Alternatieve namen die aantoonbaar dezelfde soort bedoelen; geen ouder-
# soort sticker voor een hieronder gevraagde ondersoort.
ALIASES={
 'Tetrao tetrix':'Lyrurus tetrix',
 'Microcarbo pygmeus':'Microcarbo pygmaeus',
 'Charadrius morinellus':'Eudromias morinellus',
 'Charadrius dubius':'Thinornis dubius',
 'Athene vidalii':'Athene noctua',
 'Dendropicos medius':'Dendrocoptes medius',
 'Erythrina erythrina':'Carpodacus erythrinus',
 'Sinosuthora webbiana':'Suthora webbiana',
 'Schoeniclus schoeniclus':'Schoeniclus schoeniclus',
}

def norm(value):
 return re.sub(r'\s+',' ',str(value or '').replace('_',' ')).strip().lower()

def git(*args):
 return subprocess.check_output(['git','-C',str(UP),*args],text=True)

def parse_species():
 text=(ROOT/'species.js').read_text(encoding='utf8')
 m=re.search(r'export\s+const\s+seed\s*=\s*`([\s\S]*?)`', text)
 if not m: raise SystemExit('species.js heeft geen herkenbare export const seed = `...`')
 results=[]
 for row in m.group(1).strip().splitlines():
  cols=row.split('|')
  if len(cols)>=2: results.append({'name':cols[0], 'scientific':cols[1]})
 return results

def source_json(path):return json.loads(git('show','HEAD:'+path))

def candidate_form_names(form):
 # Zoek op beschreven oude namen, nooit generiek op de bovenliggende soort.
 out=set()
 def walk(value, key=''):
  if isinstance(value,dict):
   for k,v in value.items():
    if k in ('file','path','url','source','license','reference','referenceUrl'):continue
    walk(v,k)
  elif isinstance(value,list):
   for v in value:walk(v,key)
  elif isinstance(value,str):
   if re.match(r'^[A-Z][a-z]+ [a-z-]{3,}(?: [a-z-]{3,})?$',value):out.add(norm(value))
 walk(form)
 return out

def form_paths(form,all_paths):
 found=set()
 def walk(value,key=''):
  if isinstance(value,dict):
   for k,v in value.items():walk(v,k)
  elif isinstance(value,list):
   for v in value:walk(v,key)
  elif isinstance(value,str):
   path=value.removeprefix('/')
   if path in all_paths and path.startswith('stickers/'):
    found.add(path)
 walk(form)
 return found

def build():
 species=parse_species()
 tree=set(git('ls-tree','-r','--name-only','HEAD','stickers').splitlines())
 if len(tree)<11000: raise SystemExit(f'Git-boom te klein: slechts {len(tree)} stickers')
 data=source_json('data/stickers.json')
 sticker_rows=data['stickers']
 lookup={}
 for row in sticker_rows:
  path=row.get('file')
  if path not in tree:continue
  for k in ['scientific','sci','scientificName','name','id']:
   if row.get(k):lookup[norm(row[k])]=path
  name=Path(path).stem.replace('_',' ')
  lookup[norm(name)]=path
 # Taxonomische naamwijzigingen (geen lumps naar oudersticker!)
 crosswalk=list(csv.DictReader(io.StringIO(git('show','HEAD:data/crosswalk-ioc15.2-avilist2026.csv'))))
 cross={norm(row['ioc_sci']):row for row in crosswalk if row.get('ioc_sci')}
 forms=[]
 upstream=source_json('data/species.json')
 all_rows=upstream if isinstance(upstream,list) else upstream.get('species',[])
 for parent in all_rows:
  if not isinstance(parent,dict):continue
  for form in parent.get('forms',[]) or []:
   paths=form_paths(form,tree)
   if not paths:continue
   names=candidate_form_names(form)
   forms.append({'names':names,'paths':paths,'parent':norm(parent.get('scientificName') or parent.get('id'))})
 # Kijk ook naar de werkelijke filename in de git-boom: .ondersoort.webp
 # Dit is geen gok: alleen paden die git ls-tree daadwerkelijk heeft gevonden.
 by_form={}
 for path in tree:
  stem=Path(path).stem
  if '.' not in stem:continue
  parent,form=stem.rsplit('.',1)
  by_form.setdefault((norm(parent),norm(form)),[]).append(path)
 result={};report=[]
 for item in species:
  name=item['name'];sci=item['scientific'];key=norm(sci)
  choices=[]
  special=TARGETS.get(name)
  if special:
   parent,epithet=special
   pp=norm(parent)
   # Alleen echte afzonderlijke bestandspaden voor de gewenste vorm.
   choices += by_form.get((pp, norm(epithet)),[])
   for form in forms:
    if key in form['names'] or norm(parent+' '+epithet) in form['names']:
     choices += [p for p in form['paths'] if p in tree]
  else:
   candidates=[key]
   if sci in ALIASES:candidates.append(norm(ALIASES[sci]))
   row=cross.get(key)
   if row and row.get('relation') in ('renamed','same'):
    candidates.append(norm(row.get('avilist_sci')))
   if len(key.split())==2:
    a,b=key.split()
    for frm,to in [('sylvia','curruca'),('emberiza','schoeniclus'),('emberiza','melophus')]:
     if a==frm:candidates.append(to+' '+b)
   choices += [lookup[x] for x in candidates if x in lookup]
   for form in forms:
    if key in form['names']:choices += list(form['paths'])
  choices=list(dict.fromkeys(p for p in choices if p in tree))
  # Een naam mag nooit automatisch naar de moeder-/bovenliggende soort vallen.
  if choices: result[name]=choices[0]
  report.append({'name':name,'scientific':sci,'file':choices[0] if choices else None,
                 'status':'EXACT_BESTAND_IN_GIT' if choices else 'GEEN_AFZONDERLIJK_BESTAND_GEVONDEN'})
 (ROOT/'sticker-verified.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 summary=['# Broncontrole vogelstickers','','Deze controle leest **echte Git-bestandspaden**; geen geraden URL’s of alternatieve vogels.',
          f'','- Soorten in jouw catalogus: **{len(species)}**',
          f'- Exacte bestandspaden gevonden: **{len(result)}**',
          f'- Nog zonder exact bestand: **{len(species)-len(result)}**','',
          '## Veertien gemelde probleemsoorten','', '| Vogel | Resultaat | Bronpad |','|---|---|---|']
 for item in report:
  if item['name'] in TARGETS:
   summary.append(f"| {item['name']} | {item['status']} | `{item['file'] or '—'}` |")
 summary+=['','## Alle overige ontbrekende bestanden','']
 for item in report:
  if not item['file'] and item['name'] not in TARGETS:
   summary.append(f"- {item['name']} ({item['scientific']})")
 summary+=['','Let op: Een pad in de Git-boom bewijst dat het bestand bestaat in de bron, niet dat jsDelivr het op elk moment levert.','',
           'Alleen bestanden die hier exact gevonden worden mogen als soortsticker worden gebruikt.']
 (ROOT/'sticker-bronrapport.md').write_text('\n'.join(summary)+'\n',encoding='utf8')
 print('\n'.join(summary[:25]))

if __name__=='__main__':build()
