#!/usr/bin/env python3
"""Качает планы и большие фото проектов из веб-архива. Использует планы, найденные normalize.py."""
import json,os,re,subprocess,time,sys
BASE=os.path.dirname(os.path.abspath(__file__));SITE=BASE+'/../../site/public'
d=json.load(open(BASE+'/../../site/data/projects.json'))
os.makedirs(SITE+'/plan',exist_ok=True);os.makedirs(SITE+'/big',exist_ok=True)
def abs_(u):
    u=u.strip()
    if u.startswith('//'):u='https:'+u
    if u.startswith('/'):u='https://moydom.by'+u
    if not u.startswith('http'):u='https://moydom.by/'+u
    return u.replace(' ','%20')
def fetch(u,fn):
    if os.path.exists(fn) and os.path.getsize(fn)>3000:return 'have'
    for a in range(3):
        p=subprocess.run(['curl','-sSL','-A','Mozilla/5.0','-m','45','-o',fn,'-w','%{http_code}','https://web.archive.org/web/2026im_/'+abs_(u)],capture_output=True)
        c=p.stdout.decode()
        if c=='200' and os.path.exists(fn) and os.path.getsize(fn)>3000 and open(fn,'rb').read(2) in (b'\xff\xd8',b'\x89P'):return 'ok'
        if os.path.exists(fn):os.remove(fn)
        if c=='404':return '404'
        time.sleep(90+a*90 if c=='429' else 30+a*30)
    return 'fail'
def local(p): return re.sub(r'[^a-zA-Z0-9]+','-',p['slug'].replace('proekty/',''))
stat={}
def go(u,fn,label):
    r=fetch(u,fn);stat[r]=stat.get(r,0)+1;print(label,r,flush=True)
    if r!='have':time.sleep(12)
# Сначала главный план каждого проекта: на нём держится тумблер, потом остальное
for p in d:
    src=p.get('planSrc') or []
    if src: go(src[0],f"{SITE}/plan/{local(p)}-0.jpg",local(p)+' plan 0')
for p in d:
    for i,src in enumerate((p.get('planSrc') or [])[1:],1): go(src,f"{SITE}/plan/{local(p)}-{i}.jpg",f"{local(p)} plan {i}")
for p in d:
    if p.get('bigSrc'): go(p['bigSrc'],f"{SITE}/big/{local(p)}.jpg",local(p)+' big')
print('done',stat,flush=True)
