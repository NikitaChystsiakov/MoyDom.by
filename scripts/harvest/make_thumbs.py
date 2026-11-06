"""Готовит лёгкие картинки для каталога: карточки 720 px из больших фото с лёгкой цветокоррекцией,
все планы 640 px, первый экран и портрет в webp. Исходники не меняет."""
import json, pathlib
from PIL import Image, ImageEnhance

ROOT = pathlib.Path(__file__).resolve().parents[2] / "site"
PUB = ROOT / "public"
(PUB / "c").mkdir(exist_ok=True); (PUB / "cp").mkdir(exist_ok=True)

def grade(im):
    """То, что раньше делал CSS-фильтр saturate(.9) sepia(.05) на каждой карточке."""
    im = ImageEnhance.Color(im).enhance(0.9)
    r, g, b = im.split()
    sep = Image.merge("RGB", (
        Image.eval(r, lambda v: min(255, int(v * 1.1))), g, Image.eval(b, lambda v: int(v * 0.86))))
    return Image.blend(im, sep, 0.05)

def fit(im, w):
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)

cards = plans = 0
for p in json.load(open(ROOT / "data/projects.json", encoding="utf8")):
    if p.get("img"):
        src = PUB / (p.get("imgBig") or p["img"]).lstrip("/")
        if not src.exists(): src = PUB / p["img"].lstrip("/")
        grade(fit(Image.open(src).convert("RGB"), 720)).save(PUB / "c" / (pathlib.Path(p["img"]).stem + ".webp"), quality=72, method=6)
        cards += 1
    for rel in p.get("plans") or []:  # в админке главным можно сделать любой план
        src = PUB / rel.lstrip("/"); out = PUB / "cp" / (src.stem + ".webp")
        if not src.exists() or out.exists(): continue
        fit(Image.open(src).convert("RGB"), 640).save(out, quality=78, method=6)
        plans += 1

Image.open(PUB / "hero.jpg").convert("RGB").save(PUB / "hero.webp", quality=68, method=6)
fit(Image.open(PUB / "big/proect-doma-1244.jpg").convert("RGB"), 1400).save(PUB / "ask.webp", quality=66, method=6)
por = Image.open(PUB / "koleskov.png").convert("RGBA")
fit(por, 192).save(PUB / "koleskov.webp", quality=82, method=6)
print(cards, "карточек,", plans, "планов")
