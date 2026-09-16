@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === OptiDZ ADMIN (toi seule — ne pas envoyer au client) ===
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo Installez Node.js : https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules\electron (
  echo Installation...
  call npm install
)
echo Mot de passe par defaut : OptiAdmin#2026
echo.
call npx electron electron/admin-main.js
