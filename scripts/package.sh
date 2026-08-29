#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/dist"
NAME="site-nuke"

mkdir -p "$OUT"
ZIP="$OUT/$NAME-webstore.zip"
SOURCE="extension"

if [[ -n "$(git -C "$ROOT" status --porcelain --untracked-files=normal -- "$SOURCE")" ]]; then
  echo "extension sources have uncommitted files; commit them before packaging" >&2
  exit 1
fi

# Archive only the committed extension subtree and place manifest.json at the
# ZIP root, as required by Chrome Web Store. Ignored local credentials and
# data are excluded by construction rather than by a fragile zip denylist.
git -C "$ROOT" archive --format=zip --output="$ZIP" "HEAD:$SOURCE"
echo "Wrote $ZIP"
