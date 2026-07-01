"""Add teal light glow around mirror frame on hero-clawfoot.jpg"""
from PIL import Image, ImageDraw, ImageFilter

src = Image.open('images/hero-clawfoot.jpg').convert('RGBA')
w, h = src.size

# Gold-framed mirror — upper-right
mx1, my1 = int(w * 0.74), int(h * 0.08)
mx2, my2 = int(w * 0.98), int(h * 0.40)
pad = int(w * 0.012)

glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
draw = ImageDraw.Draw(glow)

# Outer teal bloom (halo only, no fill)
for expand, alpha in [
    (pad * 5, 40),
    (pad * 3.5, 65),
    (pad * 2.2, 95),
]:
    draw.rounded_rectangle(
        [mx1 - expand, my1 - expand, mx2 + expand, my2 + expand],
        radius=20,
        outline=(45, 212, 191, alpha),
        width=max(8, int(w * 0.006)),
    )

# Bright rim hugging mirror frame
draw.rounded_rectangle(
    [mx1 - pad * 1.2, my1 - pad * 1.2, mx2 + pad * 1.2, my2 + pad * 1.2],
    radius=12,
    outline=(94, 234, 212, 220),
    width=max(5, int(w * 0.0035)),
)
draw.rounded_rectangle(
    [mx1 - pad * 2.5, my1 - pad * 2.5, mx2 + pad * 2.5, my2 + pad * 2.5],
    radius=16,
    outline=(20, 184, 166, 120),
    width=max(10, int(w * 0.007)),
)

glow = glow.filter(ImageFilter.GaussianBlur(radius=10))

# Soft corner spill onto adjacent tiles
spill = Image.new('RGBA', (w, h), (0, 0, 0, 0))
sd = ImageDraw.Draw(spill)
sd.ellipse(
    [mx1 - pad * 6, my1 - pad * 4, mx2 + pad * 8, my2 + pad * 6],
    fill=(32, 201, 181, 32),
)
spill = spill.filter(ImageFilter.GaussianBlur(radius=24))

out = Image.alpha_composite(src, spill)
out = Image.alpha_composite(out, glow)
out.convert('RGB').save('images/hero-clawfoot-glow.jpg', quality=95, optimize=True)
print('Saved images/hero-clawfoot-glow.jpg')