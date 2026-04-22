@echo off
title B.L.A.S.T. Zero-Touch Auto-Startup

:: 1. Automatic Pathing
set "BASE_DIR=C:\Users\user\make me a 10dll site"
cd /d "%BASE_DIR%"

:: 2. Handle Python Virtual Environment if it exists
set "PYTHON_CMD=python"
if exist ".venv\Scripts\activate.bat" (
    call ".venv\Scripts\activate.bat"
) else if exist "venv\Scripts\activate.bat" (
    call "venv\Scripts\activate.bat"
)

:: 3. The Ollama Guard: Start in background and wait 10 seconds
echo [SYSTEM] Starting Ollama Server...
start /B "" ollama serve
echo [SYSTEM] Waiting 10 seconds for Ollama LLM to avoid Connection Refused...
timeout /t 10 /nobreak >nul

:: 4. Separate Windows: Launch Python Backend Scripts
:: Dashboard API is launched minimized so it doesn't clutter the screen
start "Dashboard API" /min cmd /k "%PYTHON_CMD% dashboard_api.py"

:: agent_loop.py and discord_main_bot.py run in their own command prompt windows for logs
start "Agent Loop" cmd /k "%PYTHON_CMD% agent_loop.py"
start "Discord Command Hub" cmd /k "%PYTHON_CMD% tools\discord_main_bot.py"

:: 5. Frontend Auto-Launch: Navigate to kings-swag-landing and start minimized
echo [SYSTEM] Launching Next.js Dashboard Frontend...
if exist "kings-swag-landing" (
    cd kings-swag-landing
    start "Next.js Frontend" /min cmd /k "npm run dev"
) else (
    echo [WARNING] kings-swag-landing directory not found.
)

echo [SYSTEM] Boot Sequence Complete.
exit
