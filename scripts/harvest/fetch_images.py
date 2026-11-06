#!/usr/bin/env python3
"""Качает обложки проектов 500x350 из веб-архива."""
import json,os,re,subprocess,time,urllib.parse
BASE=os.path.dirname(os.path.abspath(__file__))
OUT=BASE+'/../../site/public/p'
os.makedirs(OUT,exist_ok=True)
items=json.load(open(BASE+'/projects.raw.json'))
ok=0;miss=[]
for i,it in enumerate(items):
    if not it.get('img'): miss.append(it['slug']);continue
    name=re.sub(r'[^a-zA-Z0-9]+','-',it['slug'].replace('proekty/',''))+'.jpg'
    fn=OUT+'/'+name
    if os.path.exists(fn) and os.path.getsize(fn)>3000: ok+=1;continue
    got=False
    for a in range(4):
        u='https://web.archive.org/web/2026im_/'+it['img']
        p=subprocess.run(['curl','-sSL','-A','Mozilla/5.0','-m','40','-o',fn,'-w','%{http_code}',u],capture_output=True)
        c=p.stdout.decode()
        if c=='200' and os.path.getsize(fn)>3000 and open(fn,'rb').read(2)==b'\xff\xd8': got=True;ok+=1;break
        if os.path.exists(fn): os.remove(fn)
        if c=='404': break
        time.sleep(20+a*25)
    if not got: miss.append(it['slug'])
    print(i,name,'ok' if got else 'MISS',flush=True)
    time.sleep(3)
print('done',ok,'miss',len(miss),miss[:30],flush=True)
