@echo off
setlocal
cd /d "%~dp0"
if not exist logs mkdir logs
echo ============================================
echo   Suffah - installing (this takes 1-3 minutes)
echo ============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. > logs\setup-status.txt
  echo Node.js is not installed. Download the LTS version from https://nodejs.org , install it, then run this file again.
  pause
  exit /b 1
)
node -v > logs\node-version.txt 2>&1
call npm -v >> logs\node-version.txt 2>&1
echo Installing packages...
call npm install > logs\install.log 2>&1
if errorlevel 1 (
  echo INSTALL FAILED > logs\setup-status.txt
  echo Install failed. Tell Claude "setup finished" so it can read the log.
  pause
  exit /b 1
)
echo Checking the code...
call npx tsc --noEmit > logs\typecheck.log 2>&1
if errorlevel 1 (
  echo TYPECHECK ERRORS > logs\setup-status.txt
) else (
  echo OK > logs\setup-status.txt
)
echo.
echo Done. Tell Claude "setup finished".
pause
