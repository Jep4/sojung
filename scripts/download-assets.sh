#!/usr/bin/env bash
# Downloads Figma assets listed in scripts/figma-assets.txt into a raw folder (default: .figma-raw/)
set -euo pipefail
LIST="${1:-$(dirname "$0")/figma-assets.txt}"
OUT="${2:-$(dirname "$0")/../.figma-raw}"
mkdir -p "$OUT"
grep -v '^#' "$LIST" | while read -r name url; do
  [ -z "${name:-}" ] && continue
  ext="${url##*.}"; case "$ext" in svg|png|jpg|jpeg|webp|gif) ;; *) ext="bin";; esac
  dest="$OUT/$name.$ext"
  [ -s "$dest" ] && continue
  mkdir -p "$(dirname "$dest")"
  for i in 1 2 3 4; do curl -sfL -o "$dest" "$url" && break; sleep $((i*2)); done
  [ -s "$dest" ] || echo "FAILED $name"
done
echo done
