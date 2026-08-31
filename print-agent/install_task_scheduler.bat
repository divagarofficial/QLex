@echo off
title Install QLex Print Agent - Task Scheduler
echo Registering QLex Print Agent Task in Windows Task Scheduler...
cd /d "%~dp0"
schtasks /Create /TN "QLexPrintAgent" /TR "wscript.exe \"%~dp0start_silent.vbs\"" /SC ONLOGON /RL HIGHEST /F
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] QLex Print Agent auto-start task created successfully!
) else (
    echo [ERROR] Failed to create Task Scheduler entry. Please run as Administrator.
)
pause
