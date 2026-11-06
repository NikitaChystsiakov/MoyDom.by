#!/usr/bin/env python3
"""Большие фото: кэш с размером на сайте устарел, поэтому берём оригинал и ужимаем до 1600 px."""
import json,os,re,subprocess,time,io
from PIL import Image
BASE=os.path.dirname(os.path.abspath(__file__));SITE=BASE+'/../../site/public'
d=json.load(open(BASE+'/../../site/data/projects.json'))
stat={}
for p in d:
    src=p.get('bigSrc')
    if not src:continue
    fn=f"{SITE}/big/{re.sub(r'[^a-zA-Z0-9]+','-',p['slug'].replace('proekty/',''))}.jpg"
    if os.path.exists(fn):continue
    u=re.sub(r'-\d+x\d+(\.\w+)$',r'\1',src.replace('/image/cache/','/image/'))
    if u.startswith('//'):u='https:'+u
    b=subprocess.run(['curl','-sSL','-A','Mozilla/5.0','-m','60','-w','\n%{http_code}',u.replace(' ','%20')],capture_output=True).stdout
    body,_,code=b.rpartition(b'\n')
    k=code.decode()
    if code==b'200' and len(body)>3000:
        try:
            im=Image.open(io.BytesIO(body)).convert('RGB');im.thumbnail((1600,1600));im.save(fn,quality=82,optimize=True);k='ok'
        except Exception:k='bad'
    stat[k]=stat.get(k,0)+1;print(p['no'],k,flush=True);time.sleep(1)
print('done',stat,flush=True)
