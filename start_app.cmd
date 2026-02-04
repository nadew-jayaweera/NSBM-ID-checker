@echo off
title NSBM ID Checker
echo ==========================================
echo      Starting NSBM ID Validator...
echo ==========================================
echo.

echo [1/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo [2/3] Opening Browser...
timeout /t 2 >nul
start http://localhost:3000

echo.
echo [3/3] Starting Server...
echo Press Ctrl+C to stop the server.
node server.js
pause
