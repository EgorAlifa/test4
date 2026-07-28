#!/usr/bin/env bash
# Builds the Ollama image (coding-assistant model baked in) and pushes it
# to the registry -- mirrors build-and-push-image.sh, for the offline AI
# coding assistant instead of the widgets dev environment.
#
# Usage:
#   ./scripts/build-and-push-ollama-image.sh [tag]
#
# Env:
#   OLLAMA_IMAGE   Full image ref without tag. Defaults to
#                  ghcr.io/app-insight/insight-ollama.
#   OLLAMA_MODEL   Model tag to bake in. Defaults to qwen2.5-coder:14b.
#
# Requires: `docker login` already done for the target registry (same
# login as build-and-push-image.sh, if using the same registry).

set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE="${OLLAMA_IMAGE:-ghcr.io/app-insight/insight-ollama}"
TAG="${1:-latest}"
MODEL="${OLLAMA_MODEL:-qwen2.5-coder:14b}"

echo "[build-and-push-ollama] Building $IMAGE:latest (model: $MODEL) ..."
OLLAMA_IMAGE="$IMAGE:latest" OLLAMA_MODEL="$MODEL" docker compose -f docker-compose.yml -f docker-compose.build.yml build ollama

if [ "$TAG" != "latest" ]; then
    docker tag "$IMAGE:latest" "$IMAGE:$TAG"
fi

echo "[build-and-push-ollama] Pushing $IMAGE:latest ..."
docker push "$IMAGE:latest"

if [ "$TAG" != "latest" ]; then
    echo "[build-and-push-ollama] Pushing $IMAGE:$TAG ..."
    docker push "$IMAGE:$TAG"
fi

echo "[build-and-push-ollama] Done. Clients pull with:"
echo "  docker compose --profile ollama up"
echo "or override the image explicitly:"
echo "  OLLAMA_IMAGE=$IMAGE:$TAG docker compose --profile ollama up"
