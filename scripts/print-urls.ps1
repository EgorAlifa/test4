# Prints ready-to-open links for whichever services `docker compose` has
# running right now -- run this after `docker compose up -d` /
# `docker compose --profile ollama up -d` (detached mode doesn't print
# anything on its own, unlike foreground `docker compose up`).
#
# Usage:
#   docker compose --profile ollama up -d; .\scripts\print-urls.ps1
#
# Saved with a UTF-8 BOM on purpose: Windows PowerShell 5.1 (the default
# on most Windows machines, as opposed to PowerShell 7 / pwsh) reads .ps1
# files using the system codepage unless a BOM says otherwise -- without
# it, Cyrillic text below renders as mojibake. Keep the BOM if you edit
# this file (most editors preserve it automatically once present).

try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} catch {
    # Best-effort -- some hosts (e.g. ISE) don't allow changing this.
}

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
