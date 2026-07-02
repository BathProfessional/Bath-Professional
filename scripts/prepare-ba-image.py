"""Prepare before/after slider image pairs with identical crop for pixel alignment."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

TARGET = (1920, 1080)


def pair_cover_crop(before_src: Path, after_src: Path, before_out: Path, after_out: Path) -> None:
    before = Image.open(before_src).convert("RGB")
    after = Image.open(after_src).convert("RGB")

    if after.size != before.size:
        after = after.resize(before.size, Image.LANCZOS)

    tw, th = TARGET
    sw, sh = before.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    left = (nw - tw) // 2
    top = (nh - th) // 2

    for img, out in ((before, before_out), (after, after_out)):
        scaled = img.resize((nw, nh), Image.LANCZOS)
        cropped = scaled.crop((left, top, left + tw, top + th))
        cropped.save(out, quality=92, optimize=True)
        print(f"OK {out.name} <- {before_src.name if img is before else after_src.name}")


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