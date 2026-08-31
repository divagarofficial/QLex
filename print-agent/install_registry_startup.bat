@echo off
title Install QLex Print Agent - Registry Autostart
echo Registering QLex Print Agent in User Registry (HKCU Run)...
cd /d "%~dp0"
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "QLexPrintAgent" /t REG_SZ /d "wscript.exe \"%~dp0start_silent.vbs\"" /f
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] QLex Print Agent auto-start registry entry added successfully!
) else (
    echo [ERROR] Failed to add registry key.
)
pause
