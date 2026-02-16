#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/dist"
NAME="site-nuke"

mkdir -p "$OUT"
ZIP="$OUT/$NAME-webstore.zip"
rm -f "$ZIP"

if command -v zip >/dev/null 2>&1; then
  (cd "$ROOT" && zip -r "$ZIP" . \
    -x "./.git/*" \
    -x "./dist/*" \
    -x "./node_modules/*" \
    -x "./scripts/*")
  echo "Wrote $ZIP"
else
  echo "zip not found. Install zip or package manually." >&2
  exit 1
fi
