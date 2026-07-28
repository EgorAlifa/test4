#!/usr/bin/env bash
# Prints ready-to-open links for whichever services `docker compose` has
# running right now -- run this after `docker compose up -d` /
# `docker compose --profile ollama up -d` (detached mode doesn't print
# anything on its own, unlike foreground `docker compose up`).
#
# Usage:
#   docker compose --profile ollama up -d && ./scripts/print-urls.sh

set -euo pipefail
cd "$(dirname "$0")/.."

RUNNING="$(docker compose ps --status running --services 2>/dev/null || true)"

echo
if echo "$RUNNING" | grep -qx widgets-dev; then
    echo "Виджеты:      http://localhost:3001"
fi
if echo "$RUNNING" | grep -qx ollama; then
    echo "ИИ-ассистент: http://localhost:11434"
fi
if [ -z "$RUNNING" ]; then
    echo "Ничего не запущено. Сначала: docker compose up -d (и/или --profile ollama up -d)."
fi
echo
