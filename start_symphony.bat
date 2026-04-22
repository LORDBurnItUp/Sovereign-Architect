@echo off
REM Sovereign Symphony — launches 9 Discord generals + FastAPI on :5055
REM The Next.js dashboard proxies to this at /api/symphony/* — default port in SymphonyPanel.tsx assumes 5055.

cd /d "%~dp0"
set SOVEREIGN_SYMPHONY_PORT=5055
set SOVEREIGN_SYMPHONY_HOST=127.0.0.1
set SOVEREIGN_SYMPHONY_LOG=INFO

echo [sovereign-symphony] starting on %SOVEREIGN_SYMPHONY_HOST%:%SOVEREIGN_SYMPHONY_PORT%
python -m sovereign_symphony.main
