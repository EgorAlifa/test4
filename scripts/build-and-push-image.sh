#!/usr/bin/env bash
# Builds the widgets dev image (needs Nexus access — run this on the
# maintainer/build machine, e.g. the Ubuntu box) and pushes it to the
# registry so clients can just `docker compose up` / "Reopen in Container"
# without ever building anything themselves.
#
# Usage:
#   ./scripts/build-and-push-image.sh [tag]
#
# Env:
#   WIDGETS_IMAGE   Full image ref without tag issues handled automatically.
#                    Defaults to ghcr.io/app-insight/insight-widgets-dev.
#
# Requires: `docker login` already done for the target registry
# (e.g. `echo $GITHUB_TOKEN | docker login ghcr.io -u <user> --password-stdin`,
# token needs the write:packages scope for ghcr.io).

set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE="${WIDGETS_IMAGE:-ghcr.io/app-insight/insight-widgets-dev}"
TAG="${1:-latest}"

echo "[build-and-push] Building $IMAGE:latest ..."
WIDGETS_IMAGE="$IMAGE:latest" docker compose -f docker-compose.yml -f docker-compose.build.yml build

if [ "$TAG" != "latest" ]; then
    docker tag "$IMAGE:latest" "$IMAGE:$TAG"
fi

echo "[build-and-push] Pushing $IMAGE:latest ..."
docker push "$IMAGE:latest"

if [ "$TAG" != "latest" ]; then
    echo "[build-and-push] Pushing $IMAGE:$TAG ..."
    docker push "$IMAGE:$TAG"
fi

echo "[build-and-push] Done. Clients pull with:"
echo "  docker compose up"
echo "or override the image explicitly:"
echo "  WIDGETS_IMAGE=$IMAGE:$TAG docker compose up"
