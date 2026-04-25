@echo off
title Wata Study - Launcher
cls

echo ========================================
echo   Wata Study - Starting...
echo ========================================
echo.

:: 1. Check Node.js
echo [1/3] Checking Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed!
    echo Please install it from https://nodejs.org/
    pause
    exit /b
)

:: 2. Check files
if not exist package.json (
    echo Error: project files not found! 
    echo Make sure you unzipped the archive.
    pause
    exit /b
)

:: 3. Install modules
if not exist node_modules (
    echo [2/3] Installing modules...
    call npm install
) else (
    echo [2/3] Modules ok.
)

:: 4. Start
echo [3/3] Launching app at http://localhost:3000...
echo.
start http://localhost:3000
npm run dev

pause
