@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Creation installateur OptiDZ Admin (pour le binome) ===
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
call npm run dist:admin
if errorlevel 1 (
  echo Echec de la creation.
  pause
  exit /b 1
)
if not exist "A-ENVOYER-AU-BINOME" mkdir "A-ENVOYER-AU-BINOME"
copy /Y "dist-admin\OptiDZ-Admin-Setup-1.0.3.exe" "A-ENVOYER-AU-BINOME\OptiDZ-Admin-Setup.exe" >nul
copy /Y "dist-admin\OptiDZ-Admin-Setup-1.0.3.exe" "%USERPROFILE%\Desktop\OptiDZ-Admin-Setup.exe" >nul 2>&1
copy /Y "dist-admin\OptiDZ-Admin-Setup-1.0.3.exe" "%USERPROFILE%\OneDrive\Desktop\OptiDZ-Admin-Setup.exe" >nul 2>&1
copy /Y "dist-admin\OptiDZ-Admin-Setup-1.0.3.exe" "%USERPROFILE%\OneDrive\Bureau\OptiDZ-Admin-Setup.exe" >nul 2>&1
echo.
echo ========================================
echo  FICHIER BINOME PRET
echo  A-ENVOYER-AU-BINOME\OptiDZ-Admin-Setup.exe
echo ========================================
echo.
explorer A-ENVOYER-AU-BINOME
echo Mot de passe admin : OptiAdmin#2026
echo Ne pas envoyer ce fichier au client opticien.
echo.
pause
