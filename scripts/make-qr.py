#!/usr/bin/env python3
"""BRACER QR: the whole code reads as a pixel (dot) version of the access emblem.
Square modules only. Modules inside the emblem silhouette are drawn full size, the ones outside are drawn
small, so the emblem appears out of the grid while every module keeps its dark/light value (scanners read
module centres). Error correction H.
  1) node scripts/render-qr.mjs mask      → qr/.emblem-mask.png  (emblem rasterised by Chromium)
  2) python3 scripts/make-qr.py [url]     → qr/bracer-qr-{light,dark}.svg
  3) node scripts/render-qr.mjs           → qr/bracer-qr-{light,dark}.png
"""
import os, sys
import qrcode
from PIL import Image

URL = sys.argv[1] if len(sys.argv) > 1 else 'https://bracer-chi.vercel.app/'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = int(os.environ.get('QR_VERSION', 8))
SMALL = float(os.environ.get('QR_SMALL', 0.6))   # size of modules outside the emblem (share of a module)
FIT = float(os.environ.get('QR_FIT', 0.92))       # emblem width as a share of the code width

qr = qrcode.QRCode(version=VERSION, error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
qr.add_data(URL); qr.make(fit=False)
M = qr.get_matrix(); N = len(M)
U, Q = 20, 4 * 20
S = N * U + 2 * Q

# emblem silhouette sampled at module resolution
mask_img = Image.open(os.path.join(ROOT, 'qr', '.emblem-mask.png')).convert('L')   # white emblem on black, 260×218 aspect
ew = FIT * N; eh = ew * mask_img.height / mask_img.width
ox, oy = (N - ew) / 2, (N - eh) / 2 + N * 0.02
mask_small = mask_img.resize((max(1, round(ew * 8)), max(1, round(eh * 8))), Image.LANCZOS)
def inside(r, c):
    # coverage of the module's central 50% by the emblem
    x0, y0 = (c + 0.25 - ox) * 8, (r + 0.25 - oy) * 8
    if x0 < 0 or y0 < 0 or x0 + 4 > mask_small.width or y0 + 4 > mask_small.height: return False
    box = mask_small.crop((int(x0), int(y0), int(x0) + 4, int(y0) + 4))
    return sum(box.tobytes()) / (16 * 255) > 0.5
from qrcode import util as qru
ALIGN = qru.pattern_position(qr.version)
def finder(r, c):
    # every function pattern stays full size: finders (+separator), timing lines, alignment patterns
    if (r < 8 and c < 8) or (r < 8 and c >= N - 8) or (r >= N - 8 and c < 8): return True
    if r == 6 or c == 6: return True
    for ar in ALIGN:
        for ac in ALIGN:
            if (ar < 9 and ac < 9) or (ar < 9 and ac > N - 10) or (ar > N - 10 and ac < 9): continue
            if abs(r - ar) <= 2 and abs(c - ac) <= 2: return True
    return False

def svg(fg, bg, tint):
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}" shape-rendering="crispEdges">',
           f'<rect width="{S}" height="{S}" fill="{bg}"/>']
    # emblem silhouette: its light modules get a soft tint so the shape reads as a filled pixel emblem
    for r in range(N):
        for c in range(N):
            if tint != bg and not M[r][c] and not finder(r, c) and inside(r, c):
                out.append(f'<rect x="{Q + c * U}" y="{Q + r * U}" width="{U}" height="{U}" fill="{tint}"/>')
    for r in range(N):
        for c in range(N):
            if not M[r][c]: continue
            x, y = Q + c * U, Q + r * U
            if finder(r, c) or inside(r, c):
                out.append(f'<rect x="{x}" y="{y}" width="{U}" height="{U}" fill="{fg}"/>')
            else:
                d = U * SMALL; o = (U - d) / 2
                out.append(f'<rect x="{x + o:.1f}" y="{y + o:.1f}" width="{d:.1f}" height="{d:.1f}" fill="{fg}"/>')
    out.append('</svg>')
    return '\n'.join(out)

# optional silhouette tint (off by default: any tint weakens OpenCV decoding at small sizes)
TINT_L = os.environ.get('QR_TINT_L', '#ffffff'); TINT_D = os.environ.get('QR_TINT_D', '#000000')
for name, fg, bg, tint in [('light', '#000000', '#ffffff', TINT_L), ('dark', '#ffffff', '#000000', TINT_D)]:
    open(os.path.join(ROOT, 'qr', f'bracer-qr-{name}.svg'), 'w').write(svg(fg, bg, tint))
print('version', qr.version, 'modules', N, 'url', URL)
