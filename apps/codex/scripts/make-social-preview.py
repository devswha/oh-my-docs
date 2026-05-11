#!/usr/bin/env python3
"""Compose /images/omx-social-preview.jpg matching the OMC social card layout.

Left side (bg #191919): "Codex-On-Steroids" red title, "oh-my-codex" tagline,
"Multi-agent orchestration / for OpenAI Codex CLI" description.
Right panel (bg #28282A): OMX character cropped from omx-character.jpg.
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images" / "omx-social-preview.jpg"
SRC = ROOT / "public" / "images" / "omx-character.jpg"

W, H = 1280, 640
BG = (25, 25, 25)
PANEL = (40, 40, 42)
TITLE_COLOR = (240, 240, 240)
TAG = (170, 170, 170)
MUTED = (136, 136, 136)

# Right-side grey panel — matches OMC's omc-social-preview.jpg proportions (x=944..1240)
PANEL_X = 944
PANEL_X_END = 1240
PANEL_W = PANEL_X_END - PANEL_X

FONT_DIR = Path(__file__).resolve().parent / "fonts"
TITLE_FONT = str(FONT_DIR / "Inter-Bold.ttf")
TAG_FONT = str(FONT_DIR / "Inter-Regular.ttf")
BODY_FONT = str(FONT_DIR / "Inter-Regular.ttf")

canvas = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(canvas)

# Right-side panel stripe
draw.rectangle([PANEL_X, 0, PANEL_X_END, H], fill=PANEL)

# Character source — tightly bbox the pixel art and drop its flat bg
src = Image.open(SRC).convert("RGBA")
sw, sh = src.size
spx = src.load()
src_bg = src.convert("RGB").getpixel((0, 0))
sr, sg, sb = src_bg

min_x, min_y, max_x, max_y = sw, sh, 0, 0
for y in range(sh):
    for x in range(sw):
        r, g, b, _ = spx[x, y]
        if abs(r - sr) > 15 or abs(g - sg) > 15 or abs(b - sb) > 15:
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
        if abs(r - sr) < 14 and abs(g - sg) < 14 and abs(b - sb) < 14:
            cpx[x, y] = (0, 0, 0, 0)

# Scale character 1.5x panel width; clip to panel bounds, right-biased
target_w = int(PANEL_W * 1.5)
target_h = int(ch * (target_w / cw))
char_scaled = char.resize((target_w, target_h), Image.NEAREST)

panel_img = Image.new("RGBA", (PANEL_W, H), PANEL + (255,))
# Right-biased anchor: character bleeds further off the right panel edge
cx_local = PANEL_W - target_w + 125
cy_local = (H - target_h) // 2
panel_img.paste(char_scaled, (cx_local, cy_local), char_scaled)
canvas.paste(panel_img, (PANEL_X, 0), panel_img)

title = ImageFont.truetype(TITLE_FONT, 60)
tag = ImageFont.truetype(TAG_FONT, 28)
body = ImageFont.truetype(BODY_FONT, 28)

x = 80
draw.text((x, 206), "Your Codex Is Not Alone", font=title, fill=TITLE_COLOR)
draw.text((x, 298), "oh-my-codex", font=tag, fill=TAG)
draw.text((x, 344), "Multi-agent orchestration", font=body, fill=MUTED)
draw.text((x, 382), "for OpenAI Codex CLI", font=body, fill=MUTED)

canvas.save(OUT, "JPEG", quality=92, optimize=True)
print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
print(f"char bbox: ({min_x},{min_y})-({max_x},{max_y}) = {cw}x{ch}")
print(f"placed: {target_w}x{target_h} (panel-local x={cx_local},y={cy_local})")
