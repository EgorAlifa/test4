@echo off
REM One-click client launcher: load the image, pull the project out of it,
REM open the result in Cursor. Ship this file next to insight-widgets.tar.gz
REM -- that's the whole client-facing package (2 files). Double-click to run.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set IMAGE=ghcr.io/app-insight/insight-widgets:latest
set ARCHIVE=insight-widgets.tar.gz
set TARGET=insight-widgets-project

where docker >nul 2>nul
if errorlevel 1 (
    echo Docker ne najden. Ustanovite Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

if not exist "%ARCHIVE%" (
    echo Ne najden %ARCHIVE% rjadom so skriptom. Polozhite ego v etu zhe papku.
    pause
    exit /b 1
)

echo [1/3] Zagruzhaju obraz...
docker load -i "%ARCHIVE%"

if not exist "%TARGET%" (
    echo [2/3] Dostaju proekt iz obraza...
    for /f "delims=" %%i in ('docker create %IMAGE%') do set CID=%%i
    docker cp !CID!:/app "%TARGET%"
    docker rm !CID! >nul
) else (
    echo [2/3] Proekt uzhe raspakovan ^(%TARGET%^), propuskaju.
)

echo [3/3] Otkryvaju v Cursor...
where cursor >nul 2>nul
if errorlevel 1 (
    echo Komanda 'cursor' ne najdena v PATH.
    echo Otkrojte papku '%TARGET%' v Cursor vruchnuju ^(File -^> Open Folder^),
    echo zatem nazhmite "Reopen in Container".
    pause
) else (
    start "" cursor "%TARGET%"
    echo Gotovo. V Cursor nazhmite "Reopen in Container", kogda pojavitsja uvedomlenie.
    pause
)
