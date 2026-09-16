@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Creation installateur OptiDZ (Suivant / Accepter / Installer / Terminer) ===
echo.
where node >nul 2>&1
if errorlevel 1 (
  echo Installez Node.js : https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules\electron-builder (
  echo Installation des dependances...
  call npm install
)
call npm run dist
if errorlevel 1 (
  echo Echec de la creation.
  pause
  exit /b 1
)
echo.
echo ========================================
echo  FICHIER CLIENT PRET
echo  dist\OptiDZ-Setup-1.0.3.exe
echo ========================================
echo.
copy /Y "dist\OptiDZ-Setup-1.0.3.exe" "%USERPROFILE%\Desktop\OptiDZ-Setup.exe" >nul 2>&1
copy /Y "dist\OptiDZ-Setup-1.0.3.exe" "%USERPROFILE%\OneDrive\Desktop\OptiDZ-Setup.exe" >nul 2>&1
copy /Y "dist\OptiDZ-Setup-1.0.3.exe" "%USERPROFILE%\OneDrive\Bureau\OptiDZ-Setup.exe" >nul 2>&1
explorer dist
echo.
echo Envoyez OptiDZ-Setup.exe + une CLE ESSAI au client (Telegram).
echo Votre admin : double-clic sur Lancer-Admin.bat
echo.
pause
