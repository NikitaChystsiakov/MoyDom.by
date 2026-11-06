#!/usr/bin/env python3
"""Склеивает страницы разделов в список проектов: какой проект в каких разделах лежит.
Так же будет работать настоящий перенос: только источником станет база OpenCart."""
import re,glob,os,json,html
BASE=os.path.dirname(os.path.abspath(__file__))
P={}
cards=re.compile(r'<div class="product-layout.*?(?=<div class="product-layout|mfilter-content-container|class="row pagination|<div class="pagination|$)',re.S)
def num(s):
    m=re.search(r'\d+(?:[.,]\d+)?',s or ''); return float(m.group(0).replace(',','.')) if m else None
for f in sorted(glob.glob(BASE+'/cache/*.html')):
    cat=os.path.basename(f)[:-5]
    h=open(f,encoding='utf8',errors='ignore').read()
    if '?' in cat: pass
    for m in re.finditer(r'<div class="product-layout',h):
        b=h[m.start():m.start()+2600]
        n=re.search(r'name" content="([^"]+)"',b); u=re.search(r'href="https?://moydom\.by/([^"]+)"',b)
        if not (n and u): continue
        img=re.search(r'<img src="([^"]+)"',b); pr=re.search(r'price" content="([\d.]+)"',b)
        a=re.search(r'area-value">\s*(.*?)\s*</span>',b,re.S); s=re.search(r'bedrooms-value">\s*(.*?)\s*</span>',b,re.S)
        slug=u.group(1).strip('/')
        p=P.setdefault(slug,dict(slug=slug,name=html.unescape(n.group(1)).strip(),img=img and img.group(1),price=float(pr.group(1)) if pr else None,
              areaRaw=a and a.group(1).strip(),bedRaw=s and s.group(1).strip(),cats=[]))
        if cat not in p['cats']: p['cats'].append(cat)
out=sorted(P.values(),key=lambda p:p['slug'])
json.dump(out,open(BASE+'/projects.raw.json','w'),ensure_ascii=False,indent=1)
print(len(out))
