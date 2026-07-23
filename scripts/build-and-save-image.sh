#!/usr/bin/env bash
# Builds the widgets dev image locally and saves it to a single .tar.gz
# file for manual transfer to a client (no registry, no `docker login`,
# no internet needed on the client side beyond receiving the file).
#
# Once you're ready to publish to a real registry instead, use
# build-and-push-image.sh — both build the exact same image.
#
# Usage:
#   ./scripts/build-and-save-image.sh [output-file]
#
# Requires: Nexus access on this machine (this builds from source).

set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE="${WIDGETS_IMAGE:-ghcr.io/app-insight/insight-widgets-dev:latest}"
OUT="${1:-insight-widgets-dev.tar.gz}"

echo "[build-and-save] Building $IMAGE ..."
WIDGETS_IMAGE="$IMAGE" docker compose -f docker-compose.yml -f docker-compose.build.yml build

echo "[build-and-save] Saving to $OUT ..."
docker save "$IMAGE" | gzip > "$OUT"

echo "[build-and-save] Done: $OUT ($(du -h "$OUT" | cut -f1))"
echo "[build-and-save] Send this file to the client, then on their machine:"
echo "  gunzip -c $OUT | docker load"
echo "  docker compose up   # picks up the loaded image by name automatically, no registry involved"
