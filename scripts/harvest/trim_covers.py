#!/usr/bin/env python3
"""Срезает белые поля по краям обложек (в оригиналах 500x350 рендер вписан в белую рамку)."""
import glob,os
from PIL import Image
import numpy as np
SRC=os.path.dirname(os.path.abspath(__file__))+'/../../site/public/p'
n=0
for f in glob.glob(SRC+'/*.jpg'):
    im=Image.open(f).convert('RGB');a=np.asarray(im).astype(int)
    white=(a.min(axis=2)>=243)
    rows=white.mean(axis=1)>.96;cols=white.mean(axis=0)>.96
    H,W=rows.size,cols.size
    t=0
    while t<H//2 and rows[t]:t+=1
    b=H
    while b>H//2 and rows[b-1]:b-=1
    l=0
    while l<W//2 and cols[l]:l+=1
    r=W
    while r>W//2 and cols[r-1]:r-=1
    if t+H-b+l+W-r>=6:
        im.crop((l,t,r,b)).save(f,quality=88);n+=1
print('trimmed',n)
