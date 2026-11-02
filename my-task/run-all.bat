@echo off
title MY TASK - Start All Services
echo ===================================================
echo           MY TASK - FULL-STACK PLATFORM
echo ===================================================
echo.

set "PATH=c:\Users\amany\OneDrive\Desktop\AMAN-TASKS\.tools\node;%PATH%"

echo [1/2] Starting Backend Server (Port 5000)...
start "MY TASK Backend (Port 5000)" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Client (Port 5173)...
start "MY TASK Frontend (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ===================================================
echo Both Backend and Frontend are starting!
echo Frontend URL: http://localhost:5173
echo Backend API:  http://localhost:5000/api/health
echo ===================================================
echo.
pause
