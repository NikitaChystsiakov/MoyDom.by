#!/usr/bin/env python3
"""projects.raw.json + страницы проектов -> site/data/projects.json.
Признаки берутся только из разделов старого сайта и таблицы характеристик. Ничего не додумывается."""
import json,os,re,html,glob
BASE=os.path.dirname(os.path.abspath(__file__))
SITE=BASE+'/../../site'
raw=json.load(open(BASE+'/projects.raw.json'))
TAG={'s_mansardnym_etajom':'mansard','s_podvalom':'basement','doma_s_garajom':'garage','proekty_s_avtonavesom':'carport',
 'iz_blokov':'blocks','dereviannie':'wood','proekty_karkasnyh_domov':'frame','s_ploskoy':'flat','proekty_domov_s_odnoskatnoy':'mono',
 'proekty_domov_s_terrasoy':'terrace','proekty_s_navesom_nad_terrasoy':'terrace','doma_s_verandoi':'veranda','proekty_domov_so_vtorym_svetom':'light2',
 'proekty_domov_s_kaminom':'fireplace','proektu_domov_s_sauney':'sauna','proectu_domov_s_bassejnom':'pool','proekty_domov_s_erkerom':'bay',
 's_panoramnymy_oknamy':'panorama','dom_v_sovremennom_stile':'modern','dom_v_klassicheskom_stile':'classic','dom_v_style_minimalizm':'minimal',
 'dom_v_style_hightech':'hitech','barnhouse_proekty':'barn','dom_v_stile_shale':'chalet','proekty_dachnyh_domov':'dacha',
 'proekty_domov_dla_uzkih_uchastkov':'narrow','proekty_dvuhkvartirnyh_domov':'duplex','proekty_blokirovannyh_domov':'duplex',
 'luchshie_proekty':'popular','proekty_elytnyh_domov':'elite'}
def num(s):
    m=re.search(r'\d+(?:[.,]\d+)?',s or '');return float(m.group(0).replace(',','.')) if m else None
def clean(s):
    s=re.sub(r'<[^>]+>',' ',s);s=html.unescape(s).replace('\xa0',' ');return re.sub(r'\s+',' ',s).strip()
def localname(slug): return re.sub(r'[^a-zA-Z0-9]+','-',slug.replace('proekty/',''))
h0=open(BASE+'/cache/proekty_.html',encoding='utf8',errors='ignore').read()
order={}
for m in re.finditer(r'<div class="product-layout.*?href="https?://moydom\.by/([^"]+)"',h0,re.S):
    order.setdefault(m.group(1).strip('/'),len(order))
out=[]
for r in raw:
    cats=[c[len('proekty_'):].rstrip('_') for c in r['cats']]
    tags=sorted({TAG[c] for c in cats if c in TAG})
    t=r['name']
    kind='series' if t.startswith('СЕРИЯ') else 'house-banya' if 'дома-бани' in t.lower() or 'с баней' in t.lower() else 'banya' if t.lower().startswith('проект бани') else 'house'
    no=re.sub(r'^(Проект(?:\s+дома-бани|\s+дома с баней|\s+бани|\s+дома)?|СЕРИЯ ПРОЕКТОВ ДОМОВ)\s*','',t).strip()
    a=r.get('areaRaw') or ''
    g=re.search(r'\+\s*([\d.,]+)\s*гараж',a)
    bed=None
    if r.get('bedRaw') and r['bedRaw'].strip().isdigit(): bed=int(r['bedRaw'])
    floors=1 if 'odnoetajnie' in cats else 2 if 'dvuhetajnie' in cats else None
    p=dict(slug=r['slug'],no=no,title=t,kind=kind,area=num(a),areaGarage=num(g.group(1)) if g else None,bedrooms=bed,floors=floors,
           order=order.get(r['slug'],r.get('orderHint',1000)),price=r.get('price'),priceSketch=None,img=None,plans=[],gallery=[],tags=tags,size=None,description=None,specs={},review=None,h1=None)
    if p['areaGarage'] and 'garage' not in tags: p['tags'].append('garage')
    if kind=='house-banya': p['tags'].append('sauna')
    fn=f"{SITE}/public/p/{localname(r['slug'])}.jpg"
    if os.path.exists(fn): p['img']=f"/p/{localname(r['slug'])}.jpg"
    pg=BASE+'/pages/'+re.sub(r'[^a-zA-Z0-9]+','_',r['slug'])+'.html'
    if os.path.exists(pg):
        h=open(pg,encoding='utf8',errors='ignore').read()
        m=re.search(r'<h1[^>]*>(.*?)</h1>',h,re.S); p['h1']=clean(m.group(1)) if m else None
        ti=h.find('id="tab-description"'); tj=h.find('id="tab-',ti+30)
        block=h[ti:tj] if ti>=0 else ''
        desc=block[block.find('Описание проекта'):] if 'Описание проекта' in block else ''
        plan_part=block[:block.find('Описание проекта')] if 'Описание проекта' in block else block
        def isplan(tag,src): return bool(re.search(r'plan',src.rsplit('/',1)[-1],re.I) or re.search(r'alt="\s*план',tag,re.I))
        sm=re.search(r'id="spoiler".*?</div>',plan_part,re.S)
        mirror=[x.group(1) for x in re.finditer(r'<img[^>]+src="([^"]+)"',sm.group(0)) if isplan(x.group(0),x.group(1))] if sm else []
        rest=plan_part.replace(sm.group(0),'') if sm else plan_part
        main=[x.group(1) for x in re.finditer(r'<img[^>]+src="([^"]+)"',rest) if isplan(x.group(0),x.group(1))]
        main=list(dict.fromkeys(main)); mirror=[x for x in dict.fromkeys(mirror) if x not in main]
        p['planSrc']=main[:3]+mirror[:1]
        ps=[clean(x) for x in re.findall(r'<p[^>]*>(.*?)</p>',desc,re.S)]
        ps=[x for x in ps if len(x)>60 and 'других проектами' not in x]
        own=(re.match(r'\d+',p['no']) or [''])[0] if re.match(r'\d+',p['no']) else ''
        def okay(t):
            if re.search(r'стать[еюяи]',t,re.I): return False
            return all(n==own for n in re.findall(r'[Пп]роект\w*\s+(\d{3,4})\b',t))
        keep=[]
        for t in re.split(r'(?<=[.!?…])\s+',' '.join(ps)):
            if not okay(t) or not re.search(r'[.!?…]$',t): continue
            if sum(map(len,keep))+len(t)>700: break
            keep.append(t)
        p['description']=' '.join(keep) or None
        spec={}
        for k,v in re.findall(r'<td[^>]*>\s*([^<]+?)\s*</td>\s*<td[^>]*>\s*(.*?)\s*</td>',h,re.S):
            k=clean(k);v=clean(v)
            if k and v and len(k)<50 and len(v)<160: spec[k]=v
        p['specs']=spec
        for k,v in re.findall(r'(Готовый эскизный проект|Готовый архитектурный раздел)\s*\(([\d\s]+)BYN',h):
            p['priceSketch']=float(v.replace(' ',''));p['sketchLabel']='Эскизный проект' if 'эскиз' in k else 'Архитектурный раздел'
        if p['area'] is None: p['area']=num(spec.get('Общая площадь, м.кв.',''))
        if p['areaGarage'] is None: p['areaGarage']=num(spec.get('Площадь гаража, хоз постройки','')) if 'гараж' in spec.get('Общая площадь, м.кв.','') else None
        fl=spec.get('Количество жилых этажей','')
        if p['floors'] is None and fl:
            p['floors']=2 if fl.startswith('2') else 1 if fl.startswith('1') else None
        if 'мансард' in fl and 'mansard' not in p['tags']: p['tags'].append('mansard')
        if spec.get('Наличие подвала','').lower().startswith('есть') and 'basement' not in p['tags']: p['tags'].append('basement')
        gs=spec.get('Наличие гаража','').lower()
        if (gs.startswith('есть') or (gs=='да' and 'гараж' in (r.get('areaRaw') or '').lower())) and 'garage' not in p['tags']: p['tags'].append('garage')
        if spec.get('Тип кровли','').lower().startswith('плоск') and 'flat' not in p['tags']: p['tags'].append('flat')
        cs=spec.get('Наличие гаража','').lower();ar=(r.get('areaRaw') or '').lower();hh=(p['h1'] or '').lower()
        carport_only=cs.startswith('навес') or (not cs and ('навес' in ar or 'навес' in hh) and 'гараж' not in ar and 'гараж' not in hh)
        if carport_only:
            p['tags']=[t for t in p['tags'] if t!='garage']
            if 'carport' not in p['tags']: p['tags'].append('carport')
        mat=spec.get('Материал стен','').lower()
        if 'каркас' in mat and 'frame' not in p['tags']: p['tags'].append('frame')
        if p['bedrooms'] is None and (spec.get('Количество спален') or '').strip().isdigit(): p['bedrooms']=int(spec['Количество спален'])
        txt=(p['h1'] or '')+' '+(p['description'] or '')
        if re.search(r'саун|бан[ья]\b|с баней',txt,re.I) and 'sauna' not in p['tags']: p['tags'].append('sauna')
        hero=re.search(r'class="thumbnail" href="([^"]+)"',h)
        p['bigSrc']=hero.group(1) if hero else None
        local=re.sub(r'[^a-zA-Z0-9]+','-',r['slug'].replace('proekty/',''))
        big=f"{SITE}/public/big/{local}.jpg"
        if os.path.exists(big): p['imgBig']=f"/big/{local}.jpg"
        got=[]
        for i,src in enumerate(p.get('planSrc') or []):
            pf=f"{SITE}/public/plan/{local}-{i}.jpg"
            if os.path.exists(pf): got.append(f"/plan/{local}-{i}.jpg")
        p['plans']=got
        p['hasMirror']=bool(mirror) and len(got)>1 and len(got)==len(p['planSrc'])
    out.append(p)
out.sort(key=lambda p:(p['order'],-(int(re.match(r'\d+',p['no']).group(0)) if re.match(r'\d+',p['no']) else 0)))
os.makedirs(SITE+'/data',exist_ok=True)
REMOVED={'proekty/rekonstrukcija-doma-851'}  # страница на сайте отдаёт 404, Никита решил убрать 6.11.2026
out=[x for x in out if x['slug'] not in REMOVED]
json.dump(out,open(SITE+'/data/projects.json','w'),ensure_ascii=False,indent=0)
import collections
print(len(out),'img',sum(1 for p in out if p['img']),'floors',collections.Counter(p['floors'] for p in out),'kind',collections.Counter(p['kind'] for p in out))
print(collections.Counter(t for p in out for t in p['tags']))
