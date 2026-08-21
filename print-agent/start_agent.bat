@echo off
title QLex Auto-Print Agent Daemon
echo ========================================================
echo Starting QLex Auto-Print Agent Daemon (Production Mode)...
echo ========================================================
cd /d "%~dp0"
python print_agent.py
pause
