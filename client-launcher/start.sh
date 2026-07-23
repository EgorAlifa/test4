#!/usr/bin/env bash
# One-click client launcher: load the image, pull the project out of it,
# open the result in Cursor. Ship this file next to insight-widgets.tar.gz
# — that's the whole client-facing package (2 files).
#
# Usage: ./start.sh   (double-click also works on most systems once
# marked executable; otherwise run from a terminal in this folder)

set -euo pipefail
cd "$(dirname "$0")"

IMAGE="ghcr.io/app-insight/insight-widgets:latest"
ARCHIVE="insight-widgets.tar.gz"
TARGET="insight-widgets-project"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker не найден. Установите Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if [ ! -f "$ARCHIVE" ]; then
    echo "Не найден $ARCHIVE рядом со скриптом. Положите его в эту же папку."
    exit 1
fi

echo "[1/3] Загружаю образ..."
docker load -i "$ARCHIVE"

if [ ! -d "$TARGET" ]; then
    echo "[2/3] Достаю проект из образа..."
    CID=$(docker create "$IMAGE")
    docker cp "$CID:/app" "$TARGET"
    docker rm "$CID" >/dev/null
else
    echo "[2/3] Проект уже распакован ($TARGET), пропускаю."
fi

echo "[3/3] Открываю в Cursor..."
if command -v cursor >/dev/null 2>&1; then
    cursor "$TARGET"
    echo "Готово. В Cursor нажмите «Reopen in Container», когда появится уведомление."
else
    echo "Команда 'cursor' не найдена в PATH."
    echo "Откройте папку '$TARGET' в Cursor вручную (File -> Open Folder),"
    echo "затем нажмите «Reopen in Container»."
fi
