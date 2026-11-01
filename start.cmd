@echo off
cd /d "%~dp0"
if not exist logs mkdir logs
echo Starting Suffah at http://localhost:3000  (keep this window open; close it to stop)
call npm run dev 2>&1 | powershell -NoProfile -Command "$input | Tee-Object -FilePath logs\dev.log"
pause
