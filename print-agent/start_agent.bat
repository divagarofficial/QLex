@echo off
title QLex Auto-Print Agent Daemon
cd /d "%~dp0"

echo ========================================================
echo Starting QLex Auto-Print Agent Daemon (Production Mode)...
echo ========================================================

:: Check for virtual environment python or default system python
set PYTHON_BIN=python
if exist "%~dp0venv\Scripts\python.exe" set PYTHON_BIN="%~dp0venv\Scripts\python.exe"
if exist "%~dp0..\venv\Scripts\python.exe" set PYTHON_BIN="%~dp0..\venv\Scripts\python.exe"

%PYTHON_BIN% print_agent.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Print Agent exited with error code %ERRORLEVEL%. Check print_agent.log for details.
    pause
)
