@echo off
title MY TASK - Database Setup & Seed
set "PATH=c:\Users\amany\OneDrive\Desktop\AMAN-TASKS\.tools\node;%PATH%"
cd /d "%~dp0server"

echo ===================================================
echo [1/3] Pushing Prisma Schema to PostgreSQL...
echo ===================================================
call npx prisma db push

echo.
echo ===================================================
echo [2/3] Generating Prisma Client...
echo ===================================================
call npx prisma generate

echo.
echo ===================================================
echo [3/3] Seeding Database with Demo Users...
echo ===================================================
call npm run prisma:seed

echo.
echo ===================================================
echo Database setup complete!
echo ===================================================
pause
