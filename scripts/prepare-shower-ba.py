"""Align shower before/after pair for BA slider using drain + niche anchors."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

TARGET = (1920, 1080)


def drain_center(img: Image.Image) -> tuple[int, int]:
    gray = img.convert("L")
    w, h = gray.size
    x0, x1 = int(w * 0.35), int(w * 0.65)
    y0, y1 = int(h * 0.72), int(h * 0.92)
    best: tuple[float, int, int] | None = None
    for y in range(y0, y1, 2):
        for x in range(x0, x1, 2):
            patch = [gray.getpixel((x + dx, y + dy)) for dx in range(-6, 7) for dy in range(-6, 7)]
            mean = sum(patch) / len(patch)
            if mean < 140:
                score = 140 - mean
                if best is None or score > best[0]:
                    best = (score, x, y)
    return (w // 2, int(h * 0.82)) if best is None else (best[1], best[2])


def niche_center(img: Image.Image) -> tuple[int, int]:
    gray = img.convert("L")
    w, h = gray.size
    x0, x1 = int(w * 0.38), int(w * 0.62)
    y0, y1 = int(h * 0.28), int(h * 0.55)
    best: tuple[float, int, int] | None = None
    for y in range(y0, y1, 2):
        for x in range(x0, x1, 2):
            patch = [gray.getpixel((x + dx, y + dy)) for dx in range(-8, 9) for dy in range(-4, 5)]
            mean = sum(patch) / len(patch)
            if mean > 175:
                score = mean - 175
                if best is None or score > best[0]:
                    best = (score, x, y)
    return (w // 2, int(h * 0.4)) if best is None else (best[1], best[2])


def fill_color(img: Image.Image) -> tuple[int, int, int]:
    return img.convert("RGB").getpixel((img.size[0] // 2, img.size[1] // 2))


def scale_to_height(img: Image.Image, height: int) -> Image.Image:
    w, h = img.size
    return img.resize((int(w * height / h), height), Image.LANCZOS)


def shift_after(before: Image.Image, after: Image.Image, dx: int, dy: int) -> Image.Image:
    canvas = Image.new("RGB", before.size, fill_color(after))
    canvas.paste(after, (dx, dy))
    return canvas


def matched_cover_crop(before: Image.Image, after: Image.Image) -> tuple[Image.Image, Image.Image]:
    tw, th = TARGET
    sw, sh = before.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    box = (left, top, left + tw, top + th)
    return (
        before.resize((nw, nh), Image.LANCZOS).crop(box),
        after.resize((nw, nh), Image.LANCZOS).crop(box),
    )


def anchor_shift(before: Image.Image, after: Image.Image) -> tuple[int, int]:
    db, dn = drain_center(before), niche_center(before)
    da, an = drain_center(after), niche_center(after)
    dx = int(round((da[0] - db[0] + an[0] - dn[0]) / 2))
    dy = int(round((da[1] - db[1] + an[1] - dn[1]) / 2))
    print(f"before drain={db} niche={dn}")
    print(f"after  drain={da} niche={an}")
    print(f"anchor shift dx={dx} dy={dy}")
    # Fine-tune on final crop so niche/tile lines meet at the slider seam.
    dx, dy = dx - 49, dy - 40
    print(f"final shift dx={dx} dy={dy}")
    return dx, dy


def prepare_shower_pair(before_src: Path, after_src: Path, before_out: Path, after_out: Path) -> None:
    before = Image.open(before_src).convert("RGB")
    after = Image.open(after_src).convert("RGB")
    print(f"before={before.size} after={after.size}")

    after_scaled = scale_to_height(after, before.size[1])
    dx, dy = anchor_shift(before, after_scaled)
    after_aligned = shift_after(before, after_scaled, dx, dy)

    final_b, final_a = matched_cover_crop(before, after_aligned)
    final_b.save(before_out, quality=92, optimize=True)
    final_a.save(after_out, quality=92, optimize=True)
    print(f"OK {before_out.name} {final_b.size}")
    print(f"OK {after_out.name} {final_a.size}")


def main() -> int:
    if len(sys.argv) != 5:
        print("Usage: prepare-shower-ba.py <before_src> <after_src> <before_out> <after_out>")
        return 1
    prepare_shower_pair(*(Path(a) for a in sys.argv[1:5]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())