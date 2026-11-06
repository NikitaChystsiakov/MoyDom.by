#!/usr/bin/env python3
"""Качает страницы проектов из веб-архива по одной, с паузой: архив режет частые запросы."""
import json,os,re,subprocess,time,sys
BASE=os.path.dirname(os.path.abspath(__file__))
items=json.load(open(BASE+'/projects.raw.json'))
order={p['slug']:p.get('order',9999) for p in json.load(open(BASE+'/../../site/data/projects.json'))}
items.sort(key=lambda it:order.get(it['slug'],9999))  # сначала то, что видно в каталоге первым
snap=json.load(open(BASE+'/snapshots.json'))
def get(url,t=50):
    p=subprocess.run(['curl','-sSL','--compressed','-A','Mozilla/5.0','-m',str(t),'-w','\n%{http_code}',url],capture_output=True)
    body,_,code=p.stdout.rpartition(b'\n')
    return code.decode(),body
ok=0;fail=[]
for i,it in enumerate(items):
    fn=BASE+'/pages/'+re.sub(r'[^a-zA-Z0-9]+','_',it['slug'])+'.html'
    if os.path.exists(fn) and os.path.getsize(fn)>5000: ok+=1;continue
    done=False
    for a in range(4):
        c,b=get(f"https://web.archive.org/web/{snap.get(it['slug'],'2026')}id_/https://moydom.by/{it['slug']}")
        if c=='200' and len(b)>5000:
            open(fn,'wb').write(b);ok+=1;done=True;break
        if c=='404': break
        time.sleep(60+a*60)
    if not done: fail.append((it['slug'],c))
    print(i,it['slug'],'ok' if done else 'FAIL '+c,flush=True)
    time.sleep(20)
print('done',ok,'fail',len(fail),fail[:20],flush=True)
