@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  === Installation OptiDZ (raccourcis Bureau + Menu Demarrer) ===
echo.
set "SETUP=%~dp0dist\OptiDZ-1.0.0-x64.exe"
if not exist "%SETUP%" (
  echo Installateur introuvable. Lancez d'abord Creer-Installateur-Windows.bat
  pause
  exit /b 1
)
echo Lancement de l'installateur...
start "" "%SETUP%"
echo.
echo Suivez l'assistant : Suivant → Installer.
echo A la fin, ouvrez OptiDZ depuis le Bureau ou le Menu Demarrer.
echo.
pause
