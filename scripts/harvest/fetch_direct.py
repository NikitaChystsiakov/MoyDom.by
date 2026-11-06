#!/usr/bin/env python3
"""Докачивает с самого moydom.by то, чего нет в веб-архиве: планы и большие фото. Пауза 1 с, чтобы не грузить сайт."""
import json,os,re,subprocess,time
BASE=os.path.dirname(os.path.abspath(__file__));SITE=BASE+'/../../site/public'
d=json.load(open(BASE+'/../../site/data/projects.json'))
def url(u):
    u=u.strip()
    if u.startswith('//'):u='https:'+u
    if u.startswith('/'):u='https://moydom.by'+u
    if not u.startswith('http'):u='https://moydom.by/'+u
    return u.replace(' ','%20')
def local(p):return re.sub(r'[^a-zA-Z0-9]+','-',p['slug'].replace('proekty/',''))
stat={}
def get(u,fn,label):
    if os.path.exists(fn) and os.path.getsize(fn)>3000:return
    r=subprocess.run(['curl','-sSL','-A','Mozilla/5.0','-m','40','-o',fn,'-w','%{http_code}',url(u)],capture_output=True).stdout.decode()
    ok=r=='200' and os.path.exists(fn) and os.path.getsize(fn)>3000 and open(fn,'rb').read(2) in (b'\xff\xd8',b'\x89P')
    if not ok and os.path.exists(fn):os.remove(fn)
    k='ok' if ok else r;stat[k]=stat.get(k,0)+1;print(label,k,flush=True);time.sleep(1)
for p in d:
    for i,s in enumerate(p.get('planSrc') or []):get(s,f"{SITE}/plan/{local(p)}-{i}.jpg",f"{local(p)} plan {i}")
for p in d:
    if p.get('bigSrc'):get(p['bigSrc'],f"{SITE}/big/{local(p)}.jpg",local(p)+' big')
print('done',stat,flush=True)
