@echo off
title MY TASK - Backend Server
set "PATH=c:\Users\amany\OneDrive\Desktop\AMAN-TASKS\.tools\node;%PATH%"
cd /d "%~dp0server"
echo Starting Backend API on http://localhost:5000...
npm run dev
pause
