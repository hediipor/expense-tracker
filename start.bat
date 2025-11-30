@echo off
:: Get the directory of this script
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

:: Check for Admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c cd /d """%SCRIPT_DIR%""" && start.bat' -Verb RunAs"
    exit /b
)

:: Open Firewall Port
echo Opening Firewall Port 5500...
netsh advfirewall firewall delete rule name="ExpenseTrackerPWA" >nul
netsh advfirewall firewall add rule name="ExpenseTrackerPWA" dir=in action=allow protocol=TCP localport=5500 >nul

:: Run the server
echo Running as Administrator.
echo.
echo Opening browser in 2 seconds...
timeout /t 2 /nobreak >nul
start http://localhost:5500
powershell -ExecutionPolicy Bypass -File "server.ps1"
pause
