#!/usr/bin/env python3
"""Добавляет проекты, появившиеся на moydom.by позже снимков архива. Берёт карточки с живой /proekty/ и разделы для признаков."""
import json,os,re,html,subprocess,sys,time
from PIL import Image
import numpy as np
BASE=os.path.dirname(os.path.abspath(__file__));COV=BASE+'/../../site/public/p'
SKIP={'proekty/proekt-garage-1297'}  # гараж: в фильтре «что строим» такой группы нет
def get(url,fn=None):
    a=['curl','-sSL','--compressed','-A','Mozilla/5.0','-m','45']+(['-o',fn] if fn else [])+[url]
    r=subprocess.run(a,capture_output=True);time.sleep(1.5);return r.stdout.decode('utf8','ignore')
def cards(h):
    out=[]
    for m in re.finditer(r'<div class="product-layout',h):
        b=h[m.start():m.start()+2600]
        n=re.search(r'name" content="([^"]+)"',b);u=re.search(r'href="https?://moydom\.by/([^"]+)"',b)
        if not(n and u):continue
        img=re.search(r'<img src="([^"]+)"',b);pr=re.search(r'price" content="([\d.]+)"',b)
        a=re.search(r'area-value">\s*(.*?)\s*</span>',b,re.S);s=re.search(r'bedrooms-value">\s*(.*?)\s*</span>',b,re.S)
        out.append(dict(slug=u.group(1).strip('/').split('?')[0],name=html.unescape(n.group(1)).strip(),img=img and img.group(1),price=float(pr.group(1)) if pr else None,areaRaw=a and a.group(1).strip(),bedRaw=s and s.group(1).strip(),cats=[]))
    return out
raw=json.load(open(BASE+'/projects.raw.json'));have={r['slug'] for r in raw}
top=[];seen=set()
for c in cards(get('https://moydom.by/proekty/?limit=100')):
    if c['slug'] in seen:continue
    seen.add(c['slug'])
    if c['slug'] not in have and c['slug'] not in SKIP:top.append(c)
print('new',[c['slug'] for c in top],flush=True)
if not top:sys.exit()
want={c['slug']:c for c in top}
for f in sorted(os.listdir(BASE+'/cache')):
    cat=f[:-5]
    if '?' in cat or cat=='proekty_' or not cat.startswith('proekty_'):continue
    x=cat[len('proekty_'):].rstrip('_').replace('_','-')
    found=[y['slug'] for y in cards(get(f'https://moydom.by/proekty/{x}/?limit=100'))]
    if not found: found=[y['slug'] for y in cards(get(f"https://moydom.by/{cat.rstrip('_').replace('_','-')}/?limit=100"))]
    hit=[s for s in want if s in found]
    for s in hit:want[s]['cats'].append(cat)
    print(cat,len(found),len(hit),flush=True)
for i,c in enumerate(top):
    c['orderHint']=-len(top)+i
    get('https://moydom.by/'+c['slug'],BASE+'/pages/'+re.sub(r'[^a-zA-Z0-9]+','_',c['slug'])+'.html')
    fn=COV+'/'+re.sub(r'[^a-zA-Z0-9]+','-',c['slug'].replace('proekty/',''))+'.jpg'
    u=c['img'];u=('https:'+u) if u.startswith('//') else u
    get(u,fn)
    im=Image.open(fn).convert('RGB');a=np.asarray(im).astype(int);w=a.min(axis=2)>=243
    rows=w.mean(axis=1)>.96;cols=w.mean(axis=0)>.96;H,W=rows.size,cols.size;t=0;b=H;l=0;r=W
    while t<H//2 and rows[t]:t+=1
    while b>H//2 and rows[b-1]:b-=1
    while l<W//2 and cols[l]:l+=1
    while r>W//2 and cols[r-1]:r-=1
    im.crop((l,t,r,b)).save(fn,quality=88)
json.dump(raw+top,open(BASE+'/projects.raw.json','w'),ensure_ascii=False,indent=0)
print('added',len(top),[ (c['slug'],len(c['cats'])) for c in top],flush=True)
