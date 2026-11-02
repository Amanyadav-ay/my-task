@echo off
title MY TASK - Starting Application...
echo ===================================================
echo           MY TASK - FULL-STACK PRODUCTIVITY
echo ===================================================
echo.

set "NODE_PATH=c:\Users\amany\OneDrive\Desktop\AMAN-TASKS\.tools\node"
set "PATH=%NODE_PATH%;%PATH%"

echo [1/3] Starting Backend Server (Port 5000)...
start "MY TASK Backend Server" cmd /k "set "PATH=c:\Users\amany\OneDrive\Desktop\AMAN-TASKS\.tools\node;%%PATH%%" && cd /d "%~dp0server" && npm run dev"

echo Waiting 3 seconds for Backend to initialize...
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Client (Port 5173)...
start "MY TASK Frontend Client" cmd /k "set "PATH=c:\Users\amany\OneDrive\Desktop\AMAN-TASKS\.tools\node;%%PATH%%" && cd /d "%~dp0client" && npm run dev"

echo Waiting 3 seconds for Frontend to start...
timeout /t 3 /nobreak >nul

echo [3/3] Opening Browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ===================================================
echo SUCCESS! MY TASK is now running.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000/api/health
echo ===================================================
echo.
pause
