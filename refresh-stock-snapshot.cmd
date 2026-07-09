@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0refresh-stock-snapshot.ps1" %*
pause

