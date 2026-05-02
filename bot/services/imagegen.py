"""
Image generation for bot messages.

Two products:
  1. `get_brand_card_path()` — static welcome card with logo. Generated once on
     first call into bot/assets/, then cached.
  2. `make_signal_chart(signal)` — per-signal candle chart with direction
     overlay and brand frame, returned as bytes (BufferedInputFile-ready).

Both use matte-gold palette to match the web platform.
Designed so bot/data and bot/assets never need to be checked into git.
"""
from __future__ import annotations

import hashlib
import io
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from database.models import Signal


# ── palette (must mirror web/globals.css) ────────────────────────────────────
GOLD = "#d4a017"
GOLD_SOFT = "#b88c14"
BG_0 = "#08060a"
BG_1 = "#100c10"
BG_2 = "#181218"
TEXT_1 = "#f5ecd9"
TEXT_2 = "#b6a586"
GREEN = "#8ee06b"
RED = "#ff6b3d"

ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

LOGO_CARD = ASSETS_DIR / "brand_card.png"


# ── fonts ────────────────────────────────────────────────────────────────────

# We don't hard-fail when bundled fonts are missing — fall back to PIL default.
def _try_font(*candidates: str, size: int) -> ImageFont.ImageFont:
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def _font_bold(size: int) -> ImageFont.ImageFont:
    return _try_font(
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        size=size,
    )


def _font_regular(size: int) -> ImageFont.ImageFont:
    return _try_font(
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial.ttf",
        "C:/Windows/Fonts/arial.ttf",
        size=size,
    )


def _hex(c: str) -> tuple[int, int, int]:
    c = c.lstrip("#")
    return int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)


# ── brand card ────────────────────────────────────────────────────────────────


def _gradient_bg(w: int, h: int) -> Image.Image:
    """Vertical warm-dark gradient with two gold orbs."""
    img = Image.new("RGB", (w, h), _hex(BG_0))
    px = img.load()
    top = _hex(BG_2)
    bot = _hex(BG_0)
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] * (1 - t) + bot[0] * t)
        g = int(top[1] * (1 - t) + bot[1] * t)
        b = int(top[2] * (1 - t) + bot[2] * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    # add gold orb glow
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    cx, cy, rr = w // 4, h // 2, h // 2
    for i in range(rr, 0, -8):
        alpha = max(0, int(60 * (1 - i / rr)))
        od.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(*_hex(GOLD), alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=24))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    return img.convert("RGB")


def _generate_brand_card() -> Path:
    """Render the welcome card to LOGO_CARD."""
    w, h = 1280, 720
    img = _gradient_bg(w, h)
    draw = ImageDraw.Draw(img)

    # Candle mark (simplified): 3 bars + 2 wicks, gold.
    cx, cy = w // 2, h // 2 - 60
    bw = 18
    gap = 32
    candles = [
        # (offset_x, top, bottom, color)
        (-gap - bw, cy - 80, cy + 30, GOLD),
        (0, cy - 110, cy + 60, GOLD),
        (gap + bw, cy - 50, cy + 90, GOLD_SOFT),
    ]
    for ox, top, bot, color in candles:
        x = cx + ox
        # wick
        draw.line([(x + bw // 2, top - 30), (x + bw // 2, bot + 30)], fill=color, width=2)
        # body
        draw.rectangle([x, top, x + bw, bot], fill=color)

    # Brand wordmark
    title_font = _font_bold(96)
    sub_font = _font_regular(28)
    title = "SIGNAL · TRADE · GPT"
    tw = draw.textlength(title, font=title_font)
    draw.text(
        ((w - tw) // 2, cy + 130),
        title,
        font=title_font,
        fill=GOLD,
        stroke_width=0,
    )
    # tagline
    tag = "AI · POCKETOPTION · REVSHARE"
    tw2 = draw.textlength(tag, font=sub_font)
    draw.text(
        ((w - tw2) // 2, cy + 240),
        tag,
        font=sub_font,
        fill=TEXT_2,
    )

    # bottom corner badge
    badge = "PRO TRADERS · LIVE SIGNALS"
    bf = _font_bold(20)
    bw2 = draw.textlength(badge, font=bf)
    draw.text((w - bw2 - 40, h - 50), badge, font=bf, fill=GOLD_SOFT)

    img.save(LOGO_CARD, format="PNG", optimize=True)
    return LOGO_CARD


def get_brand_card_path() -> Path:
    if not LOGO_CARD.exists():
        _generate_brand_card()
    return LOGO_CARD


# ── signal chart ──────────────────────────────────────────────────────────────


def _seeded_walk(seed: str, n: int = 60, vol: float = 0.0008) -> np.ndarray:
    """Deterministic synthetic OHLC for a pair so chart looks realistic but stable."""
    h = hashlib.sha256(seed.encode()).digest()
    rnd = random.Random(int.from_bytes(h[:8], "big"))
    base = 1.0 + (h[8] % 50) / 100
    closes = [base]
    for _ in range(n - 1):
        closes.append(closes[-1] + rnd.gauss(0, vol))
    closes_arr = np.array(closes)
    # OHLC around closes
    opens = np.concatenate([[closes_arr[0]], closes_arr[:-1]])
    spread = vol * 1.5
    highs = np.maximum(opens, closes_arr) + np.array(
        [abs(rnd.gauss(0, spread)) for _ in range(n)]
    )
    lows = np.minimum(opens, closes_arr) - np.array(
        [abs(rnd.gauss(0, spread)) for _ in range(n)]
    )
    return np.column_stack([opens, highs, lows, closes_arr])


def make_signal_chart(signal: Signal) -> bytes:
    """
    Render a 1280x720 candle chart for a signal with direction badge.

    Returns PNG bytes ready for BufferedInputFile.
    """
    pair = signal.pair
    direction = signal.direction
    is_call = direction == "CALL"

    ohlc = _seeded_walk(pair + str(signal.confidence), n=60)
    n = ohlc.shape[0]

    fig, ax = plt.subplots(figsize=(12.8, 7.2), dpi=100)
    fig.patch.set_facecolor(BG_0)
    ax.set_facecolor(BG_0)

    # Candles
    width = 0.7
    for i, (o, hi, lo, c) in enumerate(ohlc):
        color = GREEN if c >= o else RED
        # wick
        ax.plot([i, i], [lo, hi], color=color, lw=1.0, zorder=2)
        # body
        body_low, body_high = sorted([o, c])
        ax.add_patch(
            plt.Rectangle(
                (i - width / 2, body_low),
                width,
                body_high - body_low,
                color=color,
                zorder=3,
            )
        )

    # Subtle gold trendline through closes
    closes = ohlc[:, 3]
    ax.plot(np.arange(n), closes, color=GOLD, lw=1.2, alpha=0.55, zorder=4)

    # Direction arrow at right edge
    last_close = closes[-1]
    span = closes.max() - closes.min()
    arrow_y = last_close + span * 0.18 * (1 if is_call else -1)
    arrow_color = GREEN if is_call else RED
    ax.annotate(
        f"{direction}",
        xy=(n - 1, last_close),
        xytext=(n - 6, arrow_y),
        color=arrow_color,
        fontsize=22,
        fontweight="bold",
        arrowprops=dict(
            arrowstyle="-|>",
            color=arrow_color,
            lw=2.2,
            mutation_scale=22,
        ),
        zorder=5,
    )

    # Last price line
    ax.axhline(
        last_close,
        color=GOLD,
        lw=0.8,
        ls="--",
        alpha=0.4,
        zorder=1,
    )

    # Header bar
    title = f"  {pair}   ·   {direction}   ·   conf {signal.confidence}%   ·   exp {signal.expiration}"
    ax.set_title(title, color=GOLD, fontsize=18, fontweight="bold", loc="left", pad=18)

    # Brand watermark bottom-right
    fig.text(
        0.985,
        0.025,
        "SIGNAL · TRADE · GPT",
        color=GOLD_SOFT,
        fontsize=10,
        ha="right",
        va="bottom",
        alpha=0.6,
    )

    # Hide x-axis ticks but show price ticks
    ax.tick_params(axis="x", colors=BG_0)
    ax.tick_params(axis="y", colors=TEXT_2, labelsize=9)
    for spine in ax.spines.values():
        spine.set_color(BG_2)
    ax.grid(color=BG_2, lw=0.4, alpha=0.6, axis="y")
    ax.set_xlim(-1, n)
    pad = span * 0.25
    ax.set_ylim(closes.min() - pad, closes.max() + pad)

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", facecolor=fig.get_facecolor())
    plt.close(fig)
    return buf.getvalue()


def make_tier_card(tier: int, deposit: float, next_threshold: int | None) -> bytes:
    """A small horizontal progress card image for /tier responses."""
    w, h = 1100, 380
    img = _gradient_bg(w, h)
    draw = ImageDraw.Draw(img)

    tier_names = {0: "DEMO", 1: "STARTER", 2: "ACTIVE", 3: "PRO", 4: "VIP"}
    name = tier_names.get(tier, "—")

    # Big tier label
    title_f = _font_bold(140)
    sub_f = _font_bold(44)
    txt_f = _font_regular(28)
    draw.text((60, 60), f"T{tier}", font=title_f, fill=GOLD)
    draw.text((60, 220), name, font=sub_f, fill=TEXT_1)

    # Progress
    if next_threshold:
        ratio = max(0.0, min(1.0, deposit / next_threshold))
    else:
        ratio = 1.0

    bar_x, bar_y, bar_w, bar_h = 360, 160, w - 360 - 60, 16
    draw.rounded_rectangle(
        [bar_x, bar_y, bar_x + bar_w, bar_y + bar_h],
        radius=8,
        fill=(40, 30, 26),
    )
    draw.rounded_rectangle(
        [bar_x, bar_y, bar_x + int(bar_w * ratio), bar_y + bar_h],
        radius=8,
        fill=GOLD,
    )

    # Stats
    draw.text((bar_x, bar_y - 50), f"Депозит: ${deposit:,.0f}", font=txt_f, fill=TEXT_1)
    if next_threshold:
        remaining = max(0, next_threshold - int(deposit))
        draw.text(
            (bar_x, bar_y + 30),
            f"До T{tier + 1}: ещё ${remaining:,}",
            font=txt_f,
            fill=TEXT_2,
        )
    else:
        draw.text((bar_x, bar_y + 30), "Максимальный уровень", font=txt_f, fill=GOLD_SOFT)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


# ── per-screen branded cards (Phase O) ───────────────────────────────────────


def _frame(w: int, h: int, accent_x: int | None = None) -> Image.Image:
    """Branded card backdrop with subtle gold orb + thin gold border."""
    img = _gradient_bg(w, h)
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    cx = accent_x if accent_x is not None else w - 220
    cy = 120
    rr = 260
    for i in range(rr, 0, -10):
        alpha = max(0, int(36 * (1 - i / rr)))
        od.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(*_hex(GOLD), alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=18))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w - 1, h - 1], outline=(*_hex(GOLD_SOFT), 90), width=2)
    return img


def _watermark(draw: ImageDraw.ImageDraw, w: int, h: int) -> None:
    f = _font_bold(18)
    draw.text((w - 280, h - 32), "SIGNAL · TRADE · GPT", font=f, fill=GOLD_SOFT)


def make_stats_card(
    *,
    name: str,
    tier: int,
    deposit: float,
    signals_received: int,
    wins: int,
    losses: int,
) -> bytes:
    """Personal stats dashboard card."""
    w, h = 1100, 620
    img = _frame(w, h)
    d = ImageDraw.Draw(img)

    f_title = _font_bold(56)
    f_sub = _font_regular(24)
    f_label = _font_regular(20)
    f_val = _font_bold(58)

    d.text((60, 50), "Личный кабинет", font=f_sub, fill=TEXT_2)
    d.text((60, 80), name, font=f_title, fill=GOLD)

    total = wins + losses
    winrate = (wins / total * 100) if total else 0.0

    cards = [
        (f"T{tier}", "ТИР", GOLD),
        (f"${deposit:,.0f}", "ДЕПОЗИТ", TEXT_1),
        (f"{winrate:.1f}%", "ВИНРЕЙТ", GREEN if winrate >= 55 else RED if winrate < 45 else GOLD),
        (str(signals_received), "СИГНАЛОВ", TEXT_1),
    ]
    card_w = (w - 60 * 2 - 30 * 3) // 4
    card_h = 180
    y = 200
    for i, (val, label, color) in enumerate(cards):
        x = 60 + i * (card_w + 30)
        d.rounded_rectangle([x, y, x + card_w, y + card_h], radius=18, fill=_hex(BG_2))
        d.rounded_rectangle(
            [x, y, x + card_w, y + card_h], radius=18, outline=_hex(GOLD_SOFT), width=1
        )
        vw = d.textlength(val, font=f_val)
        d.text((x + (card_w - vw) // 2, y + 36), val, font=f_val, fill=color)
        lw = d.textlength(label, font=f_label)
        d.text((x + (card_w - lw) // 2, y + 120), label, font=f_label, fill=TEXT_2)

    # Win/Loss bar
    bar_y = 460
    bar_h = 28
    bar_x = 60
    bar_w = w - 120
    d.rounded_rectangle(
        [bar_x, bar_y, bar_x + bar_w, bar_y + bar_h], radius=14, fill=_hex(BG_2)
    )
    if total:
        wpx = int(bar_w * (wins / total))
        d.rounded_rectangle(
            [bar_x, bar_y, bar_x + wpx, bar_y + bar_h], radius=14, fill=_hex(GREEN)
        )
        d.rounded_rectangle(
            [bar_x + wpx, bar_y, bar_x + bar_w, bar_y + bar_h], radius=14, fill=_hex(RED)
        )
    d.text((bar_x, bar_y - 36), f"Wins: {wins}", font=f_label, fill=GREEN)
    losses_label = f"Losses: {losses}"
    lw = d.textlength(losses_label, font=f_label)
    d.text((bar_x + bar_w - lw, bar_y - 36), losses_label, font=f_label, fill=RED)

    _watermark(d, w, h)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def _draw_qr(img: Image.Image, payload: str, x: int, y: int, size: int) -> None:
    """Render a QR code into img at (x, y) sized to `size` pixels."""
    try:
        import qrcode

        qr = qrcode.QRCode(box_size=10, border=1)
        qr.add_data(payload)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="white", back_color="black").convert("RGB")
        qr_img = qr_img.resize((size, size), Image.NEAREST)
        # invert so dark module on dark bg becomes gold on dark
        gold_qr = Image.new("RGB", (size, size), _hex(BG_2))
        gpx = gold_qr.load()
        qpx = qr_img.load()
        for j in range(size):
            for i in range(size):
                if qpx[i, j][0] < 128:
                    gpx[i, j] = _hex(GOLD)
        img.paste(gold_qr, (x, y))
    except Exception:  # noqa: BLE001
        # graceful: draw a placeholder rectangle
        d = ImageDraw.Draw(img)
        d.rectangle([x, y, x + size, y + size], outline=_hex(GOLD_SOFT), width=2)
        f = _font_regular(16)
        d.text((x + 10, y + size // 2 - 10), "QR", font=f, fill=GOLD_SOFT)


def make_referral_card(
    *,
    name: str,
    referral_code: str,
    deep_link: str,
    invited_count: int,
) -> bytes:
    """Card with QR + ref link + headline reward."""
    w, h = 1100, 620
    img = _frame(w, h)
    d = ImageDraw.Draw(img)

    f_eyebrow = _font_regular(22)
    f_title = _font_bold(64)
    f_body = _font_regular(26)
    f_code = _font_bold(36)
    f_stat = _font_bold(56)
    f_label = _font_regular(20)

    d.text((60, 60), "РЕФ-ПРОГРАММА", font=f_eyebrow, fill=GOLD_SOFT)
    d.text((60, 92), "5% sub-affiliate", font=f_title, fill=GOLD)
    d.text((60, 180), "От FTD каждого приглашённого. Без потолка.", font=f_body, fill=TEXT_1)

    # QR right side
    qr_size = 280
    qr_x = w - qr_size - 70
    qr_y = 90
    _draw_qr(img, deep_link, qr_x, qr_y, qr_size)

    # Code box
    box_y = 280
    d.text((60, box_y), "Твой реф-код", font=f_label, fill=TEXT_2)
    d.text((60, box_y + 24), referral_code.upper(), font=f_code, fill=GOLD)

    # invited stat
    d.text((60, 410), str(invited_count), font=f_stat, fill=TEXT_1)
    d.text((60, 480), "приглашено всего", font=f_label, fill=TEXT_2)

    # name footer
    name_label = f"для {name}"
    nw = d.textlength(name_label, font=f_label)
    d.text((qr_x + qr_size - nw, qr_y + qr_size + 16), name_label, font=f_label, fill=TEXT_2)

    _watermark(d, w, h)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def make_achievements_grid(items: list[tuple[str, str, bool]]) -> bytes:
    """
    items = [(emoji, title, unlocked), ...]
    Renders 3-column grid. Up to 9 items shown.
    """
    items = items[:9]
    w, h = 1100, 920
    img = _frame(w, h)
    d = ImageDraw.Draw(img)

    f_title = _font_bold(56)
    f_sub = _font_regular(22)
    f_emoji = _try_font(
        "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",
        size=109,
    )
    f_emoji_fallback = _font_bold(36)
    f_name = _font_bold(20)
    f_count = _font_bold(36)

    earned = sum(1 for _, _, ok in items if ok)
    d.text((60, 50), "ДОСТИЖЕНИЯ", font=f_sub, fill=GOLD_SOFT)
    d.text((60, 80), "КОЛЛЕКЦИЯ ТРОФЕЕВ", font=f_title, fill=GOLD)
    cnt_str = f"{earned} / {len(items)}"
    cw = d.textlength(cnt_str, font=f_count)
    d.text((w - 60 - cw, 100), cnt_str, font=f_count, fill=TEXT_1)

    cols = 3
    cell_w = (w - 60 * 2 - 30 * (cols - 1)) // cols
    cell_h = 200
    grid_top = 220

    for i, (emoji, title, ok) in enumerate(items):
        col = i % cols
        row = i // cols
        x = 60 + col * (cell_w + 30)
        y = grid_top + row * (cell_h + 20)
        outline = _hex(GOLD) if ok else _hex(BG_2)
        bg_fill = _hex(BG_1) if ok else _hex(BG_0)
        d.rounded_rectangle([x, y, x + cell_w, y + cell_h], radius=18, fill=bg_fill)
        d.rounded_rectangle(
            [x, y, x + cell_w, y + cell_h], radius=18, outline=outline, width=2
        )
        text_color = TEXT_1 if ok else "#5a5050"
        # try color emoji rendering with downscale; fall back to ASCII placeholder
        emoji_drawn = False
        try:
            ic = Image.new("RGBA", (109, 109), (0, 0, 0, 0))
            id_ = ImageDraw.Draw(ic)
            id_.text((0, 0), emoji, font=f_emoji, embedded_color=True)
            ic_small = ic.resize((84, 84), Image.LANCZOS)
            if not ok:
                # desaturate locked
                from PIL import ImageEnhance
                ic_small = ImageEnhance.Color(ic_small).enhance(0.0)
                ic_small = ImageEnhance.Brightness(ic_small).enhance(0.4)
            img.paste(ic_small, (x + (cell_w - 84) // 2, y + 24), ic_small)
            emoji_drawn = True
        except Exception:  # noqa: BLE001
            pass
        if not emoji_drawn:
            d.text(
                (x + cell_w // 2 - 18, y + 30),
                "★" if ok else "☆",
                font=f_emoji_fallback,
                fill=text_color,
            )
        # truncate title
        if len(title) > 22:
            title = title[:21] + "…"
        tw = d.textlength(title, font=f_name)
        d.text((x + (cell_w - tw) // 2, y + cell_h - 38), title, font=f_name, fill=text_color)
        if not ok:
            d.text((x + cell_w - 30, y + 12), "✖", font=f_name, fill="#3a3030")

    _watermark(d, w, h)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def make_leaderboard_table(
    rows: list[tuple[int, str, float, int, int, int]],
    *,
    highlight_rank: int | None = None,
) -> bytes:
    """
    rows = [(rank, name, winrate_pct, wins, losses, tier), ...]
    """
    w, h = 1100, 720
    img = _frame(w, h)
    d = ImageDraw.Draw(img)

    f_title = _font_bold(48)
    f_sub = _font_regular(22)
    f_head = _font_bold(18)
    f_row = _font_regular(22)
    f_rank = _font_bold(28)

    d.text((60, 50), "ЛИДЕРБОРД", font=f_sub, fill=GOLD_SOFT)
    d.text((60, 80), "ТОП ТРЕЙДЕРОВ", font=f_title, fill=GOLD)

    # Header
    cols = [
        ("#", 60, 70),
        ("ТРЕЙДЕР", 130, 380),
        ("ВИНРЕЙТ", 510, 160),
        ("СДЕЛКИ", 670, 160),
        ("ТИР", 830, 100),
    ]
    head_y = 200
    for label, x, _w in cols:
        d.text((x, head_y), label, font=f_head, fill=TEXT_2)
    d.line([(60, head_y + 30), (w - 60, head_y + 30)], fill=_hex(GOLD_SOFT), width=1)

    rank_marks = {1: "Ⅰ", 2: "Ⅱ", 3: "Ⅲ"}  # roman numerals as medal stand-in
    row_y = head_y + 50
    row_h = 44
    # alpha-capable layer for highlight
    hl = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl)
    for rank, name, wr, wins, losses, tier in rows[:10]:
        is_me = highlight_rank is not None and rank == highlight_rank
        if is_me:
            hd.rounded_rectangle(
                [50, row_y - 6, w - 50, row_y + row_h - 10],
                radius=8,
                fill=(*_hex(GOLD), 50),
                outline=(*_hex(GOLD), 200),
                width=2,
            )
        rank_lbl = rank_marks.get(rank, f"{rank}")
        d.text((cols[0][1], row_y), rank_lbl, font=f_rank, fill=GOLD if rank <= 3 else TEXT_1)
        if len(name) > 22:
            name = name[:21] + "…"
        d.text((cols[1][1], row_y + 4), name, font=f_row, fill=TEXT_1)
        wr_color = GREEN if wr >= 55 else RED if wr < 45 else GOLD
        d.text((cols[2][1], row_y + 4), f"{wr:.1f}%", font=f_row, fill=wr_color)
        d.text((cols[3][1], row_y + 4), f"{wins}/{wins + losses}", font=f_row, fill=TEXT_2)
        d.text((cols[4][1], row_y + 4), f"T{tier}", font=f_row, fill=GOLD)
        row_y += row_h

    img = Image.alpha_composite(img.convert("RGBA"), hl).convert("RGB")
    d = ImageDraw.Draw(img)
    _watermark(d, w, h)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def make_settings_card(
    *,
    name: str,
    tier: int,
    po_trader_id: str | None,
    notifications_enabled: bool,
) -> bytes:
    w, h = 1100, 520
    img = _frame(w, h)
    d = ImageDraw.Draw(img)

    f_title = _font_bold(56)
    f_sub = _font_regular(22)
    f_label = _font_regular(22)
    f_val = _font_bold(28)

    d.text((60, 50), "НАСТРОЙКИ", font=f_sub, fill=GOLD_SOFT)
    d.text((60, 80), "ПРОФИЛЬ", font=f_title, fill=GOLD)
    d.text((60, 160), name, font=f_val, fill=TEXT_1)

    # Rows
    rows = [
        ("Текущий тир", f"T{tier}", GOLD),
        (
            "PocketOption ID",
            po_trader_id if po_trader_id else "не привязан",
            TEXT_1 if po_trader_id else GOLD_SOFT,
        ),
        (
            "Уведомления",
            "включены" if notifications_enabled else "отключены",
            GREEN if notifications_enabled else RED,
        ),
    ]
    y = 240
    for label, val, color in rows:
        d.rounded_rectangle([60, y, w - 60, y + 64], radius=12, fill=_hex(BG_2))
        d.text((80, y + 20), label, font=f_label, fill=TEXT_2)
        vw = d.textlength(val, font=f_val)
        d.text((w - 80 - vw, y + 16), val, font=f_val, fill=color)
        y += 80

    _watermark(d, w, h)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def make_help_sheet(commands: list[tuple[str, str]]) -> bytes:
    """commands = [(/cmd, description), ...]"""
    w, h = 1100, max(520, 200 + 50 * len(commands))
    img = _frame(w, h)
    d = ImageDraw.Draw(img)

    f_title = _font_bold(56)
    f_sub = _font_regular(22)
    f_cmd = _font_bold(24)
    f_desc = _font_regular(22)

    d.text((60, 50), "СПРАВКА", font=f_sub, fill=GOLD_SOFT)
    d.text((60, 80), "КОМАНДЫ БОТА", font=f_title, fill=GOLD)

    y = 180
    for cmd, desc in commands:
        cw = d.textlength(cmd, font=f_cmd)
        d.text((60, y), cmd, font=f_cmd, fill=GOLD)
        d.text((60 + max(int(cw), 220) + 30, y + 2), desc, font=f_desc, fill=TEXT_1)
        y += 46

    _watermark(d, w, h)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()
