# Prints ready-to-open links for whichever services `docker compose` has
# running right now -- run this after `docker compose up -d` /
# `docker compose --profile ollama up -d` (detached mode doesn't print
# anything on its own, unlike foreground `docker compose up`).
#
# Usage:
#   docker compose --profile ollama up -d; .\scripts\print-urls.ps1

Set-Location (Join-Path $PSScriptRoot "..")

$running = docker compose ps --status running --services 2>$null

Write-Host ""
if ($running -contains "widgets-dev") {
    Write-Host "Виджеты:      http://localhost:3001"
}
if ($running -contains "ollama") {
    Write-Host "ИИ-ассистент: http://localhost:11434"
}
if (-not $running) {
    Write-Host "Ничего не запущено. Сначала: docker compose up -d (и/или --profile ollama up -d)."
}
Write-Host ""
