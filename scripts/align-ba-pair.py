"""Find optimal pixel shift to align before/after BA pair on structural features."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


def drain_center(path: Path) -> tuple[int, int]:
    im = Image.open(path).convert("L")
    w, h = im.size
    x0, x1 = int(w * 0.28), int(w * 0.72)
    y0, y1 = int(h * 0.62), int(h * 0.9)
    best: tuple[float, int, int] | None = None
    for y in range(y0, y1, 3):
        for x in range(x0, x1, 3):
            patch = im.crop((x - 6, y - 6, x + 7, y + 7))
            vals = list(patch.getdata())
            mean = sum(vals) / len(vals)
            if mean < 135:
                score = 135 - mean
                if best is None or score > best[0]:
                    best = (score, x, y)
    if best is None:
        raise RuntimeError(f"Could not find drain in {path}")
    return best[1], best[2]


def region_diff(b: Image.Image, a: Image.Image, dx: int, dy: int) -> float:
    """Mean diff in shower floor region when after is shifted by (dx, dy)."""
    w, h = b.size
    x0, y0 = int(w * 0.1), int(h * 0.45)
    x1, y1 = int(w * 0.9), int(h * 0.98)
    br = b.crop((x0, y0, x1, y1))
    ar = a.crop((x0, y0, x1, y1))
    rw, rh = ar.size
    shifted = Image.new("RGB", (rw, rh), (128, 128, 128))
    shifted.paste(ar, (dx, dy))
    ox0, oy0 = max(0, dx), max(0, dy)
    ox1, oy1 = min(rw, rw + dx), min(rh, rh + dy)
    bx0, by0 = max(0, -dx), max(0, -dy)
    cb = br.crop((bx0, by0, bx0 + (ox1 - ox0), by0 + (oy1 - oy0)))
    ca = shifted.crop((ox0, oy0, ox1, oy1))
    hist = ImageChops.difference(cb, ca).histogram()
    total = sum(hist)
    return sum(i * c for i, c in enumerate(hist)) / (total * 3)


def search_shift(before: Image.Image, after: Image.Image, radius: int = 50) -> tuple[int, int, float]:
    small_b = before.resize((724, 543), Image.LANCZOS)
    small_a = after.resize((724, 543), Image.LANCZOS)
    base = region_diff(small_b, small_a, 0, 0)
    best = (0, 0, base)
    for dy in range(-radius, radius + 1, 1):
        for dx in range(-radius, radius + 1, 1):
            d = region_diff(small_b, small_a, dx, dy)
            if d < best[2]:
                best = (dx, dy, d)
    sx = before.size[0] / 724
    return int(round(best[0] * sx)), int(round(best[1] * sx)), best[2]


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: align-ba-pair.py <before> <after>")
        return 1
    bp, ap = Path(sys.argv[1]), Path(sys.argv[2])
    b = Image.open(bp).convert("RGB")
    a = Image.open(ap).convert("RGB")
    if a.size != b.size:
        a = a.resize(b.size, Image.LANCZOS)
    db, da = drain_center(bp), drain_center(ap)
    dx_d, dy_d = da[0] - db[0], da[1] - db[1]
    dx, dy, score = search_shift(b, a)
    print(f"drain_before={db} drain_after={da} drain_delta={dx_d},{dy_d}")
    print(f"best_shift_after_by dx={dx} dy={dy} floor_diff={score:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())