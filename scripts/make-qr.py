#!/usr/bin/env python3
"""BRACER QR — square pixels only, the access emblem set as a solid pixel badge in the middle.
Data modules are crisp squares, the emblem is cut out of the grid (with a one-module clearance that follows
its outline) and redrawn at half-module resolution, so it reads with full contrast. Error correction H
recovers the covered modules. Framed with HUD corner brackets and a pixel-font caption.
  1) node scripts/render-qr.mjs mask      → qr/.emblem-mask.png  (emblem rasterised by Chromium)
  2) python3 scripts/make-qr.py [url]     → qr/bracer-qr-{light,dark}.svg
  3) node scripts/render-qr.mjs           → qr/bracer-qr-{light,dark}.png
"""
import os, sys
import qrcode
from qrcode import util as qru
from PIL import Image, ImageFilter

URL = sys.argv[1] if len(sys.argv) > 1 else 'https://bracer-chi.vercel.app/'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = int(os.environ.get('QR_VERSION', 6))
EMBLEM = float(os.environ.get('QR_EMBLEM', 0.38))   # emblem width as a share of the code width
DOT = float(os.environ.get('QR_DOT', 0.84))         # data module size (share of a cell)
CLEAR = float(os.environ.get('QR_CLEAR', 0.9))      # clearance around the emblem, in modules

qr = qrcode.QRCode(version=VERSION, error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
qr.add_data(URL); qr.make(fit=False)
M = qr.get_matrix(); N = len(M)
U = 20                       # cell size (svg units)
Q = 4 * U                    # quiet zone
CODE = N * U

# ---- emblem silhouette at half-module resolution ------------------------------------------------------
mask_img = Image.open(os.path.join(ROOT, 'qr', '.emblem-mask.png')).convert('L')
P = int(os.environ.get('QR_P', 4))                # emblem pixels per module
ew = round(EMBLEM * N * P); eh = round(ew * mask_img.height / mask_img.width)
ew += (N * P - ew) % 2; eh += (N * P - eh) % 2   # keep it centred on the pixel grid
pix = mask_img.resize((ew, eh), Image.BOX).point(lambda v: 255 if v > 118 else 0)
ex0, ey0 = (N * P - ew) // 2, (N * P - eh) // 2 + P // 2   # optical centre: a touch low
# clearance: dilate the silhouette, then every module touching it is dropped
pad = int(CLEAR * P) + 2
big = Image.new('L', (ew + 2 * pad, eh + 2 * pad), 0); big.paste(pix, (pad, pad))
k = 2 * int(round(CLEAR * P)) + 1
clear = big.filter(ImageFilter.MaxFilter(k))
def cleared(r, c):
    for dy in range(P):
        for dx in range(P):
            x, y = c * P + dx - ex0 + pad, r * P + dy - ey0 + pad
            if 0 <= x < clear.width and 0 <= y < clear.height and clear.getpixel((x, y)): return True
    return False

ALIGN = qru.pattern_position(qr.version)
def func(r, c):
    if (r < 8 and c < 8) or (r < 8 and c >= N - 8) or (r >= N - 8 and c < 8): return True
    if r == 6 or c == 6: return True
    for ar in ALIGN:
        for ac in ALIGN:
            if (ar < 9 and ac < 9) or (ar < 9 and ac > N - 10) or (ar > N - 10 and ac < 9): continue
            if abs(r - ar) <= 2 and abs(c - ac) <= 2: return True
    return False

lost = sum(1 for r in range(N) for c in range(N) if cleared(r, c) and not func(r, c))
assert not any(cleared(r, c) and func(r, c) for r in range(N) for c in range(N)), 'emblem covers a function pattern'

# ---- 5×7 pixel font ------------------------------------------------------------------------------------
FONT = {
 'A': ['01110','10001','10001','11111','10001','10001','10001'],
 'B': ['11110','10001','10001','11110','10001','10001','11110'],
 'C': ['01111','10000','10000','10000','10000','10000','01111'],
 'E': ['11111','10000','10000','11110','10000','10000','11111'],
 'N': ['10001','11001','10101','10011','10001','10001','10001'],
 'O': ['01110','10001','10001','10001','10001','10001','01110'],
 'R': ['11110','10001','10001','11110','10100','10010','10001'],
 'S': ['01111','10000','10000','01110','00001','00001','11110'],
 'T': ['11111','00100','00100','00100','00100','00100','00100'],
 '/': ['00001','00010','00010','00100','01000','01000','10000'],
 ' ': ['00000'] * 7,
}
def text(s, x, y, px, fill, track=1):
    out, cx = [], x
    for ch in s:
        for j, row in enumerate(FONT[ch]):
            for i, b in enumerate(row):
                if b == '1': out.append(f'<rect x="{cx + i * px:g}" y="{y + j * px:g}" width="{px:g}" height="{px:g}" fill="{fill}"/>')
        cx += (5 + track) * px
    return out
def text_w(s, px, track=1): return len(s) * (5 + track) * px - track * px

# ---- layout ---------------------------------------------------------------------------------------------
F = 2 * U                                         # frame margin outside the quiet zone
W = CODE + 2 * Q + 2 * F
cx0 = cy0 = F + Q                                 # code origin
px = U / 4                                        # caption pixel
ty = cy0 + CODE + Q                               # caption top: keeps the full quiet zone clear
H = round(ty + 7 * px + 2 * U)

def svg(fg, bg, dim):
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" shape-rendering="crispEdges">',
         f'<rect width="{W}" height="{H}" fill="{bg}"/>']
    # HUD corner brackets
    t, L, m = U // 2, 3 * U, U
    x0, y0, x1, y1 = m, m, W - m, H - m
    for (x, y, sx, sy) in [(x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)]:
        o.append(f'<rect x="{min(x, x + sx * L)}" y="{min(y, y + sy * t)}" width="{L}" height="{t}" fill="{fg}"/>')
        o.append(f'<rect x="{min(x, x + sx * t)}" y="{min(y, y + sy * L)}" width="{t}" height="{L}" fill="{fg}"/>')
    # modules
    d = U * DOT; e = (U - d) / 2
    for r in range(N):
        for c in range(N):
            if not M[r][c] or cleared(r, c): continue
            x, y = cx0 + c * U, cy0 + r * U
            if func(r, c): o.append(f'<rect x="{x}" y="{y}" width="{U}" height="{U}" fill="{fg}"/>')
            else: o.append(f'<rect x="{x + e:g}" y="{y + e:g}" width="{d:g}" height="{d:g}" fill="{fg}"/>')
    # emblem pixels, merged into horizontal runs
    s = U / P
    for j in range(eh):
        i = 0
        while i < ew:
            if pix.getpixel((i, j)):
                k = i
                while k < ew and pix.getpixel((k, j)): k += 1
                o.append(f'<rect x="{cx0 + (ex0 + i) * s:g}" y="{cy0 + (ey0 + j) * s:g}" width="{(k - i) * s:g}" height="{s:g}" fill="{fg}"/>')
                i = k
            else: i += 1
    # caption: BRACER ............ SCAN TO ACCESS
    o += text('BRACER', cx0, ty, px, fg)
    cap = 'SCAN TO ACCESS'
    o += text(cap, cx0 + CODE - text_w(cap, px), ty, px, dim)
    o.append('</svg>')
    return '\n'.join(o)

for name, fg, bg, dim in [('light', '#000000', '#ffffff', '#7a7a7a'), ('dark', '#ffffff', '#000000', '#8a8a8a')]:
    open(os.path.join(ROOT, 'qr', f'bracer-qr-{name}.svg'), 'w').write(svg(fg, bg, dim))
data_modules = sum(1 for r in range(N) for c in range(N) if not func(r, c))
print(f'version {qr.version} modules {N} mask {qr.mask_pattern} covered {lost}/{data_modules} ({100 * lost / data_modules:.1f}%) size {W}x{H} url {URL}')
