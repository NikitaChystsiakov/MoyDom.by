#!/usr/bin/env python3
"""Собирает из веб-архива страницы разделов moydom.by и строит таблицу: проект -> разделы.
Прямого доступа к сайту из этой сети нет (соединение отклоняется), поэтому источник — Wayback Machine."""
import re, json, time, sys, urllib.parse, os
BASE='/Users/nikita/Desktop/Фриланс/Строительство/moydom.by/scripts/harvest'
CACHE=BASE+'/cache'
home=open(BASE+'/../../.art-director/old-site/home.dec.html',encoding='utf8',errors='ignore').read()
cats=set(re.findall(r'href="https?://moydom\.by/(proekty/[a-z0-9\-]+/)"',home))|set(re.findall(r'href="/(proekty/[a-z0-9\-]+/)"',home))
cats|={'proekty/','proekty-domov-s-odnoskatnoy/','proekty/luchshie-proekty/','proekty/?page=2','proekty/?limit=100&page=2'}
import subprocess
def get(u,t=45):
    # curl, а не urllib: так используется системное хранилище сертификатов
    p=subprocess.run(['curl','-sSL','--compressed','-A','Mozilla/5.0','-m',str(t),'--fail',u],capture_output=True)
    if p.returncode: raise RuntimeError(p.stderr.decode()[:120])
    return p.stdout
def latest(path):
    q=urllib.parse.quote('moydom.by/'+path,safe='')
    u=f'https://web.archive.org/cdx/search/cdx?url={q}&fl=timestamp,original&filter=statuscode:200&limit=-1'
    s=get(u).decode().strip()
    return s.split()[0:2] if s else None
def fetch(path):
    fn=CACHE+'/'+re.sub(r'[^a-z0-9]+','_',path)+'.html'
    if os.path.exists(fn) and os.path.getsize(fn)>2000: return path,'cached'
    for a in range(3):
        try:
            l=latest(path)
            if not l: return path,'no-snapshot'
            h=get(f'https://web.archive.org/web/{l[0]}id_/{l[1]}',60)
            open(fn,'wb').write(h)
            return path,'ok '+l[0]
        except Exception as e:
            err=str(e); time.sleep(2+a*3)
    return path,'fail '+err
for c in sorted(cats):
    print(*fetch(c),flush=True); time.sleep(7)  # архив ограничивает частоту запросов
