#!/usr/bin/env python3
"""Copy/convert the raw Figma downloads (.figma-raw/) into client/public/assets/.

Raster images are the original image fills from Figma, re-encoded as WebP (q=92, alpha kept)
to keep the repository small. SVGs are copied byte-for-byte. Nothing is redrawn.
Run `bash scripts/download-assets.sh` first (URLs come from the Figma MCP and expire after 7 days).
"""
import os, shutil, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, '.figma-raw')
OUT = os.path.join(ROOT, 'client', 'public', 'assets')

RASTER = {
    # popup
    'popup/noise': 'hi/popup-noise.bin',
    # main
    'main/cctv1': 'main/cctv1.png', 'main/cctv2': 'main/cctv2.png',
    'main/cctv3': 'main/cctv3.png', 'main/cctv4': 'main/cctv4.png',
    'main/building': 'main/imgImage2.png', 'main/waveform': 'main/imgImage3.png',
    'main/face': 'main/imgImage4.png', 'main/emblem': 'main/emblem.png',
    # culture
    'culture/skeletons': 'culture1/imgImage6.png',
    # equipment list (default + hover)
    'equip/spine': 'hi/equip-spine.bin', 'equip/line': 'hi/equip-line.bin',
    'equip/flow': 'hi/equip-flow.bin', 'equip/stretch': 'hi/equip-stretch.bin',
    'equip/spine-hover': 'equipHover/spine.png', 'equip/line-hover': 'equipHover/line.png',
    'equip/flow-hover': 'equipHover/flow.png', 'equip/stretch-hover': 'equipHover/stretch.png',
    # equipment detail heroes (also used, cropped, as thumbnails)
    'detail/posture': 'detail/hero-posture.png', 'detail/tape': 'detail/hero-tape.png',
    'detail/belt': 'detailX/belt-a.bin', 'detail/innerwear': 'detailX/innerwear-a.bin',
    'detail/calf': 'detailX/calf-a.bin', 'detail/gua': 'detailX/gua-a.bin',
    'detail/wrist': 'detail3/hero-wrist.png', 'detail/foot': 'detail3/hero-foot.png',
    'detail/hand': 'detail3/hero-hand.png',
    # targets
    'target/t1': 'hi/persona1.bin', 'target/t2': 'persona2/image13.bin',
    'target/t3': 'persona3/image13.bin', 'target/t4': 'persona4/image13.bin',
    'report/t1-1': 'report1/shot1.png', 'report/t1-2': 'report1/shot2.bin', 'report/t1-3': 'report1/shot3.bin',
    'report/t2-1': 'report2/shot1.bin', 'report/t2-2': 'report2/shot2.bin', 'report/t2-3': 'report2/shot3.bin',
    'report/t3-1': 'report3/shot1.bin', 'report/t3-2': 'report3/shot2.bin', 'report/t3-3': 'report3/shot3.bin',
    'report/t4-1': 'report4/shot1.bin', 'report/t4-2': 'report4/shot2.bin', 'report/t4-3': 'report4/shot3.bin',
    # org chart
    'org/silhouettes': 'hi/org-silhouettes.bin', 'org/ethan': 'hi/org-ethan-render.png',  # Figma render: crop + contrast/highlight/shadow adjustments baked in
    'ethan/photo': 'hi/ethan-photo.bin',
}

SVG = {
    'common/logo': 'culture1/imgGroup8.svg',
    'common/logo-dark': 'persona1/imgGroup8.svg',
    'common/crosshair': 'culture1/imgGroup6.svg',
    'common/arrow': 'detail/arrowRight.svg',
    'common/dot-gray': 'main/imgEllipse11.svg',
    'password/emblem': 'password/emblem.svg',
    'popup/dot': 'popup/imgEllipse11.svg',
    'main/circle-477': 'main/imgEllipse3.svg',
    'main/circle-1242': 'main/imgEllipse15.svg',
    'main/ellipse-dashed': 'main/imgEllipse2.svg',
    'main/node-13x14': 'main/imgEllipse7.svg',
    'main/node-14x13': 'main/imgEllipse9.svg',
    'main/leader-1': 'main/imgVector1.svg',
    'main/leader-2': 'main/imgVector2.svg',
    'main/leader-3': 'main/imgVector3.svg',
    'culture/circle-1212': 'culture1/imgEllipse3.svg',
    'culture/ellipse-dashed': 'culture1/imgEllipse2.svg',
    'culture/node-15x14': 'culture1/imgEllipse7.svg',
    'org/emblem': 'org/emblem.svg',
}

def main():
    missing = []
    for dest, src in SVG.items():
        s = os.path.join(RAW, src)
        if not os.path.exists(s): missing.append(src); continue
        d = os.path.join(OUT, dest + '.svg'); os.makedirs(os.path.dirname(d), exist_ok=True)
        shutil.copyfile(s, d)
    for dest, src in RASTER.items():
        s = os.path.join(RAW, src)
        if not os.path.exists(s): missing.append(src); continue
        d = os.path.join(OUT, dest + '.webp'); os.makedirs(os.path.dirname(d), exist_ok=True)
        im = Image.open(s)
        im = im.convert('RGBA') if (im.mode in ('RGBA', 'LA', 'P') and 'A' in im.getbands() or im.mode == 'P') else im.convert('RGB')
        if im.mode == 'RGBA' and im.getextrema()[3][0] == 255: im = im.convert('RGB')
        im.save(d, 'WEBP', quality=92, method=6)
    if missing:
        print('missing raw files:', missing); sys.exit(1)
    print('assets written to', OUT)

if __name__ == '__main__':
    main()
