#!/usr/bin/env bash
# The dev image has the whole project baked in (Dockerfile does `COPY . .`),
# so a client only needs the single image file (insight-widgets.tar.gz)
# -- this pulls the project source back out of an already-`docker load`ed
# image, no separate project zip needed.
#
# Usage (after `docker load -i insight-widgets.tar.gz`):
#   ./extract-project-from-image.sh [target-dir]
#
# This is just docker create + docker cp + docker rm; the client-facing
# doc gives the same commands inline so it works even before they have
# this script (they only have the image file at that point).

set -euo pipefail

IMAGE="${WIDGETS_IMAGE:-ghcr.io/app-insight/insight-widgets:latest}"
TARGET="${1:-./insight-widgets-project}"

if [ -e "$TARGET" ]; then
    echo "Error: $TARGET already exists." >&2
    exit 1
fi

echo "Extracting project from $IMAGE into $TARGET ..."
CID=$(docker create "$IMAGE")
docker cp "$CID:/app" "$TARGET"
docker rm "$CID" >/dev/null

echo "Done: $TARGET"
echo "  cd $TARGET && docker compose up"
