#!/usr/bin/env bash
# Builds the single deliverable for a client: one .zip containing the
# project (tracked files only, via `git archive` -- no node_modules,
# dist, .git) with the built Docker image tar.gz sitting right inside it
# at the project root.
#
# Client experience: unzip -> open the folder in Cursor -> "Reopen in
# Container". .devcontainer/devcontainer.json's initializeCommand runs
# `docker load -i insight-widgets.tar.gz` automatically at that point --
# no docker commands, no separate launcher script, nothing to run by hand.
#
# Usage: ./scripts/build-client-package.sh [output.zip]
# Requires: Nexus access (builds the image if insight-widgets.tar.gz
# isn't already present next to this script's repo root).

set -euo pipefail
cd "$(dirname "$0")/.."

OUT="${1:-insight-widgets-client-package.zip}"
IMAGE_TAR="insight-widgets.tar.gz"

if [ ! -f "$IMAGE_TAR" ]; then
    echo "[build-client-package] $IMAGE_TAR not found, building it first..."
    ./scripts/build-and-save-image.sh "$IMAGE_TAR"
fi

WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

echo "[build-client-package] Exporting project (git-tracked files only)..."
git archive --format=tar HEAD | (cd "$WORKDIR" && tar -xf -)

echo "[build-client-package] Adding $IMAGE_TAR..."
cp "$IMAGE_TAR" "$WORKDIR/$IMAGE_TAR"

echo "[build-client-package] Zipping..."
rm -f "$OUT"
(cd "$WORKDIR" && zip -qr - .) > "$OUT"

echo "[build-client-package] Done: $OUT ($(du -h "$OUT" | cut -f1))"
echo "[build-client-package] Client steps: unzip -> open the folder in Cursor -> 'Reopen in Container'."
