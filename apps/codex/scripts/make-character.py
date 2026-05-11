#!/usr/bin/env python3
"""Generate /public/images/omx-character.jpg from /public/images/image.png.

- Detects character bbox by color-distance from the source's flat background
- Keys that background to transparent
- Places the character centered on a 1408x3040 canvas (matches omc-character.jpg)
- Uses NEAREST resize to preserve pixel-art edges
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "images" / "image.png"
OUT = ROOT / "public" / "images" / "omx-character.jpg"

OW, OH = 1408, 3040
FILL_W = 0.98
FILL_H_CAP = 0.92
BBOX_THRESHOLD = 15
KEY_THRESHOLD = 12


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    w, h = src.size
    bg = src.getpixel((0, 0))
    br, bgc, bb = bg[0], bg[1], bg[2]

    px = src.load()
    min_x, min_y, max_x, max_y = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            if (abs(r - br) > BBOX_THRESHOLD
                    or abs(g - bgc) > BBOX_THRESHOLD
                    or abs(b - bb) > BBOX_THRESHOLD):
                if x < min_x: min_x = x
                if y < min_y: min_y = y
                if x > max_x: max_x = x
                if y > max_y: max_y = y

    char = src.crop((min_x, min_y, max_x + 1, max_y + 1))
    cw, ch = char.size
    cpx = char.load()
    for y in range(ch):
        for x in range(cw):
            r, g, b, _ = cpx[x, y]
            if (abs(r - br) < KEY_THRESHOLD
                    and abs(g - bgc) < KEY_THRESHOLD
                    and abs(b - bb) < KEY_THRESHOLD):
                cpx[x, y] = (0, 0, 0, 0)

    canvas = Image.new("RGB", (OW, OH), (br, bgc, bb))
    target_w = int(OW * FILL_W)
    target_h = int(ch * (target_w / cw))
    if target_h > int(OH * FILL_H_CAP):
        target_h = int(OH * FILL_H_CAP)
        target_w = int(cw * (target_h / ch))

    scaled = char.resize((target_w, target_h), Image.NEAREST)
    cx = (OW - target_w) // 2
    cy = (OH - target_h) // 2
    canvas.paste(scaled, (cx, cy), scaled)

    canvas.save(OUT, "JPEG", quality=92, optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
    print(f"src={w}x{h} bg=rgb({br},{bgc},{bb})")
    print(f"char bbox=({min_x},{min_y})-({max_x},{max_y})={cw}x{ch}")
    print(f"placed={target_w}x{target_h} at ({cx},{cy}) on {OW}x{OH}")


if __name__ == "__main__":
    main()
