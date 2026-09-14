#!/usr/bin/env python3
"""Derive the portfolio colour tokens from the profile photo.

Usage: python3 scripts/extract-palette.py <path-to-photo> [--json]

Colour is measured from the actual pixels, not picked by eye. Every token the
site consumes is emitted here, and every foreground/background pair the design
relies on is asserted against WCAG 2.1 AA before the block is printed — so a
photo can never silently ship an inaccessible theme.
"""

import colorsys
import json
import sys

from PIL import Image

# --- thresholds the design depends on (WCAG 2.1 AA) -------------------------
REQ_BODY = 4.5      # normal text
REQ_LARGE = 3.0     # large text / UI components

NEAR_WHITE = 0.94   # drop blown-out background pixels
NEAR_BLACK = 0.08   # drop crushed shadows
CLUSTERS = 6


# --- colour maths -----------------------------------------------------------
def _lin(c: float) -> float:
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb) -> float:
    r, g, b = (_lin(c / 255) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def hex_of(rgb) -> str:
    return "#{:02X}{:02X}{:02X}".format(*[max(0, min(255, round(c))) for c in rgb])


def hls_to_rgb(h: float, l: float, s: float):
    """h in degrees, l/s in 0..1, returns 0..255 RGB."""
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360.0, l, s)
    return (round(r * 255), round(g * 255), round(b * 255))


def rgb_to_hls(rgb):
    r, g, b = (c / 255 for c in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360.0, l, s


def saturation_of(rgb) -> float:
    return rgb_to_hls(rgb)[2]


def lightness_of(rgb) -> float:
    return rgb_to_hls(rgb)[1]


# --- image analysis --------------------------------------------------------
def regional_map(im):
    """3x3 mean-lightness map — tells us whether the backdrop is dark or bright."""
    w, h = im.size
    small = im.resize((30, 30))
    px = small.load()
    rows = []
    for ry in range(3):
        row = []
        for rx in range(3):
            vals = [
                luminance(px[x, y])
                for y in range(ry * 10, ry * 10 + 10)
                for x in range(rx * 10, rx * 10 + 10)
            ]
            row.append(sum(vals) / len(vals))
        rows.append(row)
    return rows


def clusters_from(im):
    """Quantise the downscaled photo, then share out only the surviving pixels."""
    tile = im.copy()
    tile.thumbnail((200, 200))
    q = tile.quantize(colors=CLUSTERS, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()

    reps = []
    for i in range(CLUSTERS):
        rgb = tuple(pal[i * 3:i * 3 + 3])
        if len(rgb) == 3 and rgb not in reps:
            reps.append(rgb)

    counts = {r: 0 for r in reps}
    kept = dropped = 0
    for pr, pg, pb in tile.convert("RGB").getdata():
        r, g, b = pr / 255, pg / 255, pb / 255
        if min(r, g, b) > NEAR_WHITE or max(r, g, b) < NEAR_BLACK:
            dropped += 1
            continue
        kept += 1
        nearest = min(reps, key=lambda c: (c[0] - pr) ** 2 + (c[1] - pg) ** 2 + (c[2] - pb) ** 2)
        counts[nearest] += 1

    total = kept or 1
    out = [
        {"rgb": c, "share": n / total}
        for c, n in sorted(counts.items(), key=lambda kv: -kv[1])
        if n
    ]
    return out, kept, dropped


def pick_accent(clusters):
    """Most characteristic colour, not the biggest blob.

    Scores saturation against a mid-lightness preference so a washed-out wall or
    a muddy shadow can't win just by covering the most pixels.
    """
    def score(c):
        _, l, s = rgb_to_hls(c["rgb"])
        lightness_weight = max(0.05, 1.0 - abs(l - 0.55) / 0.55)
        return s * lightness_weight * (0.55 + 0.45 * min(1.0, c["share"] * 4))

    ranked = sorted(clusters, key=score, reverse=True)
    for c in ranked:
        _, l, s = rgb_to_hls(c["rgb"])
        if s >= 0.30 and 0.38 <= l <= 0.78:
            return c, ranked
    return ranked[0], ranked


def fit_lightness(h, s, target, against, want, minimum):
    """Walk lightness until `want` clears `minimum` against `against`.

    Falls back to the nearest lightness to `target` that maximises contrast, so
    this never returns None and callers never index into nothing.
    """
    best = None
    fallback = None
    for i in range(0, 101):
        l = i / 100.0
        rgb = hls_to_rgb(h, l, s)
        if want == "light" and l < 0.30:
            continue
        if want == "dark" and l > 0.35:
            continue
        ratio = contrast(rgb, against)
        if fallback is None or ratio > fallback[0]:
            fallback = (ratio, rgb, l)
        if ratio >= minimum:
            best = (ratio, rgb, l)
            if want == "light" and l >= target:
                return best
            if want == "dark" and l <= target:
                return best
    # nothing cleared the bar: hand back the highest-contrast candidate so the
    # caller still gets a colour, and the assertion table will report the FAIL
    return best or fallback


def build_tokens(im):
    clusters, kept, dropped = clusters_from(im)
    if not clusters:
        raise SystemExit("No usable colour survived filtering — is the photo blank?")

    accent_cluster, ranked = pick_accent(clusters)
    h, l, s = rgb_to_hls(accent_cluster["rgb"])

    # neutrals: keep the accent's hue, collapse saturation, step lightness
    bg = hls_to_rgb(h, 0.070, min(s * 0.18, 0.10))
    surface = hls_to_rgb(h, 0.110, min(s * 0.20, 0.12))
    surface2 = hls_to_rgb(h, 0.150, min(s * 0.22, 0.14))
    border = hls_to_rgb(h, 0.235, min(s * 0.25, 0.16))
    text = hls_to_rgb(h, 0.970, 0.08)

    muted = fit_lightness(h, 0.13, 0.68, bg, "light", REQ_BODY)[1]
    accent = fit_lightness(h, max(s, 0.55), 0.62, bg, "light", REQ_BODY)[1]
    accent2 = hls_to_rgb(h + 18, lightness_of(accent) * 0.88, max(s * 0.95, 0.50))
    accent_ink = fit_lightness(h, min(s, 0.45), 0.12, accent, "dark", REQ_BODY)[1]

    return {
        "photo": {"size": im.size, "aspect": round(im.size[0] / im.size[1], 3)},
        "regions": regional_map(im),
        "clusters": [
            {"hex": hex_of(c["rgb"]), "share": round(c["share"], 4),
             "h": round(rgb_to_hls(c["rgb"])[0]), "l": round(rgb_to_hls(c["rgb"])[1], 2),
             "s": round(rgb_to_hls(c["rgb"])[2], 2)}
            for c in ranked
        ],
        "kept": kept, "dropped": dropped,
        "accent_source": {"hex": hex_of(accent_cluster["rgb"]),
                          "share": round(accent_cluster["share"], 4)},
        "tokens": {
            "bg": bg, "surface": surface, "surface2": surface2, "border": border,
            "text": text, "muted": muted, "accent": accent,
            "accent2": accent2, "accentInk": accent_ink,
        },
    }


def main():
    src = next((a for a in sys.argv[1:] if not a.startswith("-")), "public/me/profile.jpg")
    im = Image.open(src).convert("RGB")
    data = build_tokens(im)
    t = data["tokens"]

    print(f"\nSOURCE  {src}")
    print(f"        {data['photo']['size'][0]}x{data['photo']['size'][1]}px  "
          f"aspect {data['photo']['aspect']}"
          f"  ({'portrait' if data['photo']['aspect'] < 0.95 else 'landscape' if data['photo']['aspect'] > 1.05 else 'square'})")
    print(f"        clamped {data['kept']} px, discarded {data['dropped']} px as blown-out/crushed")

    print("\n3x3 LIGHTNESS MAP (0=black 1=white)")
    for row in data["regions"]:
        print("   " + "  ".join(f"{v:.2f}" for v in row))

    print("\nCLUSTERS (by score)")
    for c in data["clusters"]:
        print(f"   {c['hex']}  {c['share']*100:5.1f}%  hue {c['h']:3d}  L {c['l']:.2f}  S {c['s']:.2f}")

    print(f"\nACCENT CHOSEN  {data['accent_source']['hex']} "
          f"({data['accent_source']['share']*100:.1f}% of usable pixels)\n")

    hx = {k: hex_of(v) for k, v in t.items()}
    print("MEASURED CONTRAST")
    pairs = [
        ("text on bg", t["text"], t["bg"], REQ_BODY),
        ("muted on bg", t["muted"], t["bg"], REQ_BODY),
        ("muted on surface", t["muted"], t["surface"], REQ_BODY),
        ("accent on bg", t["accent"], t["bg"], REQ_BODY),
        ("accent2 on bg", t["accent2"], t["bg"], REQ_LARGE),
        ("accentInk on accent", t["accentInk"], t["accent"], REQ_BODY),
        ("border on bg", t["border"], t["bg"], 1.3),
    ]
    ok = True
    for name, fg, bg_, need in pairs:
        ratio = contrast(fg, bg_)
        good = ratio >= need
        ok &= good
        print(f"   {name:<22} {ratio:5.2f}:1  need {need}   {'PASS' if good else 'FAIL'}")

    print("\n@theme BLOCK — paste into src/index.css\n")
    print("@theme {")
    for key, var in [("bg", "--color-bg"), ("surface", "--color-surface"),
                     ("surface2", "--color-surface-2"), ("border", "--color-border"),
                     ("text", "--color-text"), ("muted", "--color-muted"),
                     ("accent", "--color-accent"), ("accent2", "--color-accent-2"),
                     ("accentInk", "--color-accent-ink")]:
        print(f"    {var}: {hx[key]};")
    print("}")

    if "--json" in sys.argv:
        print("\n" + json.dumps({**data, "tokens": hx}, indent=2, default=str))

    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
