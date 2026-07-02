"""Prepare before/after slider image pairs with matched alignment."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageChops

TARGET = (1920, 1080)
MAX_ALIGN_SHIFT = 50


def mean_diff(a: Image.Image, b: Image.Image) -> float:
    hist = ImageChops.difference(a, b).histogram()
    total = sum(hist)
    return sum(i * c for i, c in enumerate(hist)) / (total * 3)


def drain_center(img: Image.Image) -> tuple[int, int]:
    gray = img.convert("L")
    w, h = gray.size
    x0, x1 = int(w * 0.35), int(w * 0.65)
    y0, y1 = int(h * 0.72), int(h * 0.92)
    best: tuple[float, int, int] | None = None
    for y in range(y0, y1, 2):
        for x in range(x0, x1, 2):
            patch = [gray.getpixel((x + dx, y + dy)) for dx in range(-5, 6) for dy in range(-5, 6)]
            mean = sum(patch) / len(patch)
            if mean < 145:
                score = 145 - mean
                if best is None or score > best[0]:
                    best = (score, x, y)
    if best is None:
        return w // 2, int(h * 0.82)
    return best[1], best[2]


def fill_color(img: Image.Image) -> tuple[int, int, int]:
    return img.convert("RGB").getpixel((img.size[0] // 2, img.size[1] // 2))


def shift_pair(before: Image.Image, after: Image.Image, ox: int, oy: int) -> tuple[Image.Image, Image.Image]:
    w, h = before.size
    pad_left, pad_top = max(0, ox), max(0, oy)
    pad_right, pad_bottom = max(0, -ox), max(0, -oy)
    cw, ch = w + pad_left + pad_right, h + pad_top + pad_bottom

    canvas_b = Image.new("RGB", (cw, ch), fill_color(before))
    canvas_a = Image.new("RGB", (cw, ch), fill_color(after))
    canvas_b.paste(before, (pad_left, pad_top))
    canvas_a.paste(after, (pad_left - ox, pad_top - oy))
    crop = (pad_left, pad_top, pad_left + w, pad_top + h)
    return canvas_b.crop(crop), canvas_a.crop(crop)


def structural_shift(before: Image.Image, after: Image.Image, radius: int = 20) -> tuple[int, int]:
    w, h = before.size
    region_b = before.crop((int(w * 0.1), int(h * 0.1), int(w * 0.9), int(h * 0.9)))
    region_a = after.crop((int(w * 0.1), int(h * 0.1), int(w * 0.9), int(h * 0.9)))
    small_b = region_b.resize((362, 271), Image.LANCZOS)
    small_a = region_a.resize((362, 271), Image.LANCZOS)
    best = (0, 0, mean_diff(small_b, small_a))
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            shifted = ImageChops.offset(small_a, dx, dy)
            score = mean_diff(small_b, shifted)
            if score < best[2]:
                best = (dx, dy, score)
    sx, sy = before.size[0] / 362, before.size[1] / 271
    return int(round(best[0] * sx)), int(round(best[1] * sy))


def align_pair(before: Image.Image, after: Image.Image) -> tuple[Image.Image, Image.Image, str]:
    w, h = before.size
    if after.size != (w, h):
        after = after.resize((w, h), Image.LANCZOS)

    db = drain_center(before)
    da = drain_center(after)
    ox, oy = da[0] - db[0], da[1] - db[1]

    if abs(ox) <= MAX_ALIGN_SHIFT and abs(oy) <= MAX_ALIGN_SHIFT:
        aligned = shift_pair(before, after, ox, oy)
        return *aligned, "drain"

    sx, sy = structural_shift(before, after)
    if abs(sx) <= MAX_ALIGN_SHIFT and abs(sy) <= MAX_ALIGN_SHIFT and (sx, sy) != (0, 0):
        aligned = shift_pair(before, after, sx, sy)
        return *aligned, "structural"

    return before, after, "none"


def finalize_pair(
    before: Image.Image,
    after: Image.Image,
    mode: str,
) -> tuple[Image.Image, Image.Image]:
    out_b = before.resize(TARGET, Image.LANCZOS)
    out_a = after.resize(TARGET, Image.LANCZOS)

    if mode != "drain":
        print("final alignment: identical resize")
        return out_b, out_a

    db = drain_center(out_b)
    da = drain_center(out_a)
    ox, oy = da[0] - db[0], da[1] - db[1]
    if abs(ox) <= 30 and abs(oy) <= 30 and (ox, oy) != (0, 0):
        canvas = Image.new("RGB", TARGET, fill_color(out_a))
        canvas.paste(out_a, (-ox, -oy))
        out_a = canvas
        da = drain_center(out_a)
        print(f"fine-tune shift applied: ({-ox}, {-oy})")
    print(f"final drain delta: ({da[0] - db[0]}, {da[1] - db[1]})")
    return out_b, out_a


def pair_cover_crop(before_src: Path, after_src: Path, before_out: Path, after_out: Path) -> None:
    before = Image.open(before_src).convert("RGB")
    after = Image.open(after_src).convert("RGB")

    aligned_b, aligned_a, mode = align_pair(before, after)
    print(f"alignment mode: {mode}")

    final_b, final_a = finalize_pair(aligned_b, aligned_a, mode)

    for img, out in ((final_b, before_out), (final_a, after_out)):
        img.save(out, quality=92, optimize=True)
        print(f"OK {out.name} <- {before_src.name if img is final_b else after_src.name}")


def main() -> int:
    if len(sys.argv) != 5:
        print("Usage: prepare-ba-image.py <before_src> <after_src> <before_out> <after_out>")
        return 1
    pair_cover_crop(
        Path(sys.argv[1]),
        Path(sys.argv[2]),
        Path(sys.argv[3]),
        Path(sys.argv[4]),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())