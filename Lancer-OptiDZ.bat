@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Lancement d'OptiDZ (mode developpement)...
where node >nul 2>&1
if errorlevel 1 (
  echo Installez Node.js : https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules\electron (
  echo Installation d'Electron...
  call npm install
)
call npm run desktop
