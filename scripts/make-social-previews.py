#!/usr/bin/env python3
"""Generate social preview thumbnails for all docs apps.

The output images are shared by OpenGraph/Twitter metadata and the docs index
pages. They intentionally use app-local public assets so the cards stay
reproducible after upstream asset syncs.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "apps" / "codex" / "scripts" / "fonts"
W, H = 1280, 640


@dataclass(frozen=True)
class Card:
    app: str
    output: str
    title: str
    kicker: str
    line1: str
    line2: str
    accent: tuple[int, int, int]
    icon: str
    image: str | None = None
    url: str = ""


CARDS = [
    Card(
        app="codex",
        output="omx-social-preview.jpg",
        title="Oh My CodeX",
        kicker="omx.vibetip.help",
        line1="Multi-agent orchestration",
        line2="for OpenAI Codex CLI",
        accent=(66, 153, 225),
        icon="public/logo.png",
        image="public/images/omx-character.jpg",
        url="https://omx.vibetip.help",
    ),
    Card(
        app="claudecode",
        output="omc-social-preview.jpg",
        title="Oh My ClaudeCode",
        kicker="omc.vibetip.help",
        line1="Multi-agent orchestration",
        line2="for Claude Code",
        accent=(217, 119, 87),
        icon="public/logo.png",
        image="public/images/omc-character.jpg",
        url="https://omc.vibetip.help",
    ),
    Card(
        app="openagent",
        output="omo-social-preview.jpg",
        title="Oh My OpenAgent",
        kicker="omo.vibetip.help",
        line1="Multi-model orchestration",
        line2="for OpenCode and Codex Light",
        accent=(115, 98, 255),
        icon="public/images/omo-logo.png",
        url="https://omo.vibetip.help",
    ),
    Card(
        app="gajae-code",
        output="gjc-social-preview.jpg",
        title="Gajae-Code",
        kicker="gjc.vibetip.help",
        line1="Red-claw coding-agent harness",
        line2="for crisp plans and durable verification",
        accent=(229, 72, 77),
        icon="public/images/character.png",
        url="https://gjc.vibetip.help",
    ),
    Card(
        app="lzx",
        output="lzx-social-preview.jpg",
        title="LazyCodex",
        kicker="lzx.vibetip.help",
        line1="OmO Light Edition",
        line2="for Codex planning and verification",
        accent=(34, 197, 94),
        icon="public/logo.png",
        image="public/images/hero.png",
        url="https://lzx.vibetip.help",
    ),
]


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / name), size)


TITLE = font("Inter-Bold.ttf", 72)
KICKER = font("Inter-Regular.ttf", 27)
BODY = font("Inter-Regular.ttf", 34)


def cover_image(path: Path, size: tuple[int, int]) -> Image.Image:
    src = Image.open(path).convert("RGBA")
    return ImageOps.fit(src, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def contain_image(path: Path, max_size: tuple[int, int]) -> Image.Image:
    src = Image.open(path).convert("RGBA")
    scale = min(max_size[0] / src.width, max_size[1] / src.height)
    size = (max(1, int(src.width * scale)), max(1, int(src.height * scale)))
    return src.resize(size, Image.Resampling.LANCZOS)


def add_soft_shadow(canvas: Image.Image, xy: tuple[int, int], img: Image.Image) -> None:
    x, y = xy
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    alpha = img.getchannel("A")
    shadow.putalpha(alpha.point(lambda value: int(value * 0.28)))
    for offset in ((0, 10), (0, 18)):
        canvas.alpha_composite(shadow, (x + offset[0], y + offset[1]))
    canvas.alpha_composite(img, xy)


def make_card(card: Card) -> Path:
    app_root = ROOT / "apps" / card.app
    out = app_root / "public" / "images" / card.output

    canvas = Image.new("RGBA", (W, H), (15, 18, 24, 255))
    draw = ImageDraw.Draw(canvas)

    for y in range(H):
        shade = int(18 + (y / H) * 18)
        draw.line([(0, y), (W, y)], fill=(shade, shade + 2, shade + 9, 255))

    draw.rectangle([0, 0, 22, H], fill=card.accent + (255,))
    draw.rounded_rectangle([760, 54, 1218, 586], radius=38, fill=(31, 35, 45, 255), outline=(73, 81, 96, 255), width=2)

    if card.image:
        image = cover_image(app_root / card.image, (430, 500))
        image.putalpha(190)
        canvas.alpha_composite(image, (774, 70))
        draw.rounded_rectangle([774, 70, 1204, 570], radius=28, outline=(255, 255, 255, 32), width=2)

    icon = contain_image(app_root / card.icon, (300, 300))
    add_soft_shadow(canvas, (835 + (300 - icon.width) // 2, 170 + (300 - icon.height) // 2), icon)

    draw.text((82, 136), card.kicker, font=KICKER, fill=(166, 176, 191, 255))
    draw.text((82, 202), card.title, font=TITLE, fill=(248, 250, 252, 255))
    draw.rounded_rectangle([82, 306, 210, 314], radius=4, fill=card.accent + (255,))
    draw.text((82, 354), card.line1, font=BODY, fill=(216, 222, 233, 255))
    draw.text((82, 401), card.line2, font=BODY, fill=(149, 160, 178, 255))
    draw.text((82, 514), card.url, font=KICKER, fill=(123, 135, 153, 255))

    canvas.convert("RGB").save(out, "JPEG", quality=92, optimize=True)
    return out


def main() -> None:
    for card in CARDS:
        out = make_card(card)
        print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
