"""Prepare before/after slider images — identical letterbox framing for alignment."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

TARGET = (1920, 1080)
BG = (20, 24, 32)


def letterbox(src: Path, out: Path) -> None:
    img = Image.open(src).convert("RGB")
    tw, th = TARGET
    sw, sh = img.size
    scale = min(tw / sw, th / sh)
    nw, nh = int(sw * scale), int(sh * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGB", TARGET, BG)
    ox = (TARGET[0] - img.width) // 2
    oy = (TARGET[1] - img.height) // 2
    canvas.paste(img, (ox, oy))
    canvas.save(out, quality=92, optimize=True)
    print(f"OK {out.name} <- {src.name} ({img.width}x{img.height} in {TARGET[0]}x{TARGET[1]})")


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: prepare-ba-image.py <source> <dest.jpg>")
        return 1
    letterbox(Path(sys.argv[1]), Path(sys.argv[2]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())