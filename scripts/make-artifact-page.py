#!/usr/bin/env python3
"""After `npm --prefix client run build:static`: inline the JS/CSS bundle into client/dist-static/bracer.html
(a single page that can be hosted together with client/dist-static/assets/)."""
import os, re
d = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'client', 'dist-static')
html = open(os.path.join(d, 'index.html')).read()
js = open(os.path.join(d, re.search(r'src="\./(assets/index-[^"]+\.js)"', html).group(1))).read().replace('</script', '<\\/script')
css = open(os.path.join(d, re.search(r'href="\./(assets/index-[^"]+\.css)"', html).group(1))).read()
page = f'''<title>BRACER Monitoring System</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;600&display=swap">
<style>
:root {{ color-scheme: dark; }}
{css}
</style>
<div id="root"></div>
<script type="module">
{js}
</script>
'''
open(os.path.join(d, 'bracer.html'), 'w').write(page)
print('wrote', os.path.join(d, 'bracer.html'))
