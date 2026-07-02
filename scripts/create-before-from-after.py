"""Create worn 'before' images from pristine 'after' images — same frame, perfect slider alignment."""
from __future__ import annotations

import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
TARGET_SIZE = (1920, 1080)


def normalize(img: Image.Image) -> Image.Image:
    if img.size != TARGET_SIZE:
        return img.resize(TARGET_SIZE, Image.LANCZOS)
    return img


def make_before(after: Image.Image, seed: int) -> Image.Image:
    random.seed(seed)
    img = after.convert("RGB")
    w, h = img.size

    r, g, b = img.split()
    r = r.point(lambda i: min(255, int(i * 1.08)))
    g = g.point(lambda i: int(i * 0.92))
    b = b.point(lambda i: int(i * 0.82))
    img = Image.merge("RGB", (r, g, b))

    img = ImageEnhance.Brightness(img).enhance(0.78)
    img = ImageEnhance.Contrast(img).enhance(0.86)
    img = ImageEnhance.Color(img).enhance(0.68)
    img = ImageEnhance.Sharpness(img).enhance(0.75)

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Grime and water stains on lower/center surfaces (tub, shower, counter)
    for _ in range(55):
        x = random.randint(int(w * 0.12), int(w * 0.88))
        y = random.randint(int(h * 0.32), int(h * 0.92))
        radius = random.randint(6, 28)
        tone = random.choice(
            [(72, 62, 48), (58, 52, 44), (95, 82, 68), (48, 55, 52)]
        )
        alpha = random.randint(35, 95)
        draw.ellipse(
            [x - radius, y - radius, x + radius, y + radius],
            fill=(*tone, alpha),
        )

    # Soap scum streaks
    for _ in range(12):
        x1 = random.randint(int(w * 0.2), int(w * 0.75))
        y1 = random.randint(int(h * 0.4), int(h * 0.85))
        x2 = x1 + random.randint(40, 140)
        y2 = y1 + random.randint(-18, 18)
        draw.line([x1, y1, x2, y2], fill=(210, 205, 190, 45), width=random.randint(2, 5))

    # Dull haze
    haze = Image.new("RGBA", (w, h), (40, 38, 32, 28))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    img = Image.alpha_composite(img, haze)
    img = img.convert("RGB")
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    return img


def process_pair(index: int) -> None:
    after_path = IMAGES / f"after-{index}.jpg"
    before_path = IMAGES / f"before-{index}.jpg"
    if not after_path.exists():
        print(f"SKIP missing {after_path.name}")
        return

    after = normalize(Image.open(after_path))
    after.save(after_path, quality=92, optimize=True)
    before = make_before(after, seed=index * 97 + 13)
    before.save(before_path, quality=92, optimize=True)
    print(f"OK {before_path.name} + {after_path.name} ({after.size[0]}x{after.size[1]})")


def main() -> int:
    indices = [int(a) for a in sys.argv[1:]] if len(sys.argv) > 1 else list(range(1, 7))
    for i in indices:
        process_pair(i)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())