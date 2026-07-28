#!/usr/bin/env bash
# Builds the Ollama image (coding-assistant model baked in) and saves it
# to a single .tar.gz for manual transfer -- same approach as
# build-and-save-image.sh, but for the offline AI coding assistant instead
# of the widgets dev environment.
#
# Usage:
#   ./scripts/build-and-save-ollama-image.sh [output-file]
#
# Env:
#   OLLAMA_MODEL   Model tag to bake in. Defaults to qwen2.5-coder:14b.
#                  Bigger models need more client RAM -- see DEVELOPMENT.md
#                  section 6.3 before changing this.
#
# Requires: internet access to Ollama's registry to pull the base image +
# model (no Nexus needed, unlike build-and-save-image.sh).

set -euo pipefail
cd "$(dirname "$0")/.."

IMAGE="${OLLAMA_IMAGE:-ghcr.io/app-insight/insight-ollama:latest}"
OUT="${1:-insight-ollama.tar.gz}"
MODEL="${OLLAMA_MODEL:-qwen2.5-coder:14b}"

echo "[build-and-save-ollama] Building $IMAGE (model: $MODEL) ..."
OLLAMA_IMAGE="$IMAGE" OLLAMA_MODEL="$MODEL" docker compose -f docker-compose.yml -f docker-compose.build.yml build ollama

echo "[build-and-save-ollama] Saving to $OUT ..."
docker save "$IMAGE" | gzip > "$OUT"

echo "[build-and-save-ollama] Done: $OUT ($(du -h "$OUT" | cut -f1))"
echo "[build-and-save-ollama] Send this file to the client, then on their machine:"
echo "  gunzip -c $OUT | docker load"
echo "  docker compose --profile ollama up   # picks up the loaded image by name automatically"
