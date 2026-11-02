@echo off
title MY TASK - Frontend Client
set "PATH=c:\Users\amany\OneDrive\Desktop\AMAN-TASKS\.tools\node;%PATH%"
cd /d "%~dp0my-task\client"
echo Starting Frontend on http://localhost:5173...
npm run dev
pause
