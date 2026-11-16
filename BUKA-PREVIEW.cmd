@echo off
cd /d "%~dp0"
if not exist node_modules (
  call npm ci
  if errorlevel 1 exit /b 1
)
call npm run db:local
if errorlevel 1 exit /b 1
node scripts/seed-kitab.js
if errorlevel 1 exit /b 1
node node_modules/wrangler/bin/wrangler.js d1 execute pilih-db --local --file scripts/kitab-seed.sql
if errorlevel 1 exit /b 1
echo Preview lokal: http://127.0.0.1:8787
call npm run dev
