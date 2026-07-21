#!/usr/bin/env bash
# Builds widgets-launcher.exe as a Node.js Single Executable Application (SEA)
# instead of via `pkg`. Unlike `pkg` (which fetches prebuilt Node binaries
# from GitHub Releases and can be blocked by strict egress policies), this
# only needs nodejs.org, which is far less likely to be firewalled off.
#
# How it works: downloads the official Windows Node.js build, generates a
# "SEA blob" from start.js using the local Node's --experimental-sea-config,
# then injects that blob into a copy of the Windows node.exe with `postject`
# (https://nodejs.org/api/single-executable-applications.html). The result
# is a single .exe that runs start.js with no separate Node.js install
# required on the target machine.
#
# Requirements: local Node.js (any recent version) + internet access to
# nodejs.org and the public npm registry (for the one-off `postject` call).
#
# Usage: ./build-sea.sh [node-version]   (defaults to the local `node -v`)

set -euo pipefail
cd "$(dirname "$0")"

NODE_VERSION="${1:-$(node -v | sed 's/^v//')}"
ARCH="win-x64"
WORKDIR="$(mktemp -d)"
OUT_DIR="dist"
OUT_FILE="$OUT_DIR/widgets-launcher-win.exe"

echo "[build-sea] Using Node.js v${NODE_VERSION} (${ARCH})"
echo "[build-sea] NOTE: for best compatibility, NODE_VERSION should match the"
echo "[build-sea] locally installed Node used to generate the SEA blob below."

mkdir -p "$OUT_DIR"

echo "[build-sea] Downloading official Node.js Windows build from nodejs.org..."
curl -fsSL -o "$WORKDIR/node-win.zip" \
    "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${ARCH}.zip"
unzip -q "$WORKDIR/node-win.zip" -d "$WORKDIR"

echo "[build-sea] Generating SEA blob from start.js..."
cat > "$WORKDIR/sea-config.json" <<EOF
{
  "main": "$(pwd)/start.js",
  "output": "$WORKDIR/sea-prep.blob",
  "disableExperimentalSEAWarning": true
}
EOF
node --experimental-sea-config "$WORKDIR/sea-config.json"

echo "[build-sea] Injecting blob into a copy of node.exe..."
cp "$WORKDIR/node-v${NODE_VERSION}-${ARCH}/node.exe" "$OUT_FILE"
npx --yes postject "$OUT_FILE" NODE_SEA_BLOB "$WORKDIR/sea-prep.blob" \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --overwrite

rm -rf "$WORKDIR"

echo "[build-sea] Done: $OUT_FILE"
echo "[build-sea] NOTE: this re-purposes the official signed node.exe, so its"
echo "[build-sea] Authenticode signature is now invalid. Windows SmartScreen"
echo "[build-sea] may warn on first run ('Windows protected your PC' ->"
echo "[build-sea] 'More info' -> 'Run anyway'). Sign the binary yourself with"
echo "[build-sea] signtool if you need to avoid that warning for end users."
