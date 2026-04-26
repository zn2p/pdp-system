@echo off
REM Minimal startup script for pdp-system
setlocal enabledelayedexpansion

cd /d D:\github\pdp-system

set VENV=D:\github\pdp-system\.venv311
set PY=%VENV%\Scripts\python.exe
set PYTEST=%VENV%\Scripts\pytest.exe
set UVICORN=%VENV%\Scripts\uvicorn.exe

echo ============================================================================
echo  PDP-SYSTEM STARTUP
echo ============================================================================

echo.
echo [1] Checking venv...
if exist "%PY%" (
    echo ✓ Python found: %PY%
) else (
    echo ✗ Python not found
    pause
    exit /b 1
)

echo.
echo [2] Running tests...
"%PYTEST%" tests/ -q
set TEST_EXIT=%errorlevel%
echo Test result: %TEST_EXIT%

echo.
echo [3] Initializing database...
"%PY%" -m app.db.init_db

echo.
echo [4] Starting servers...
echo    Backend:  127.0.0.1:8001
echo    Frontend: 127.0.0.1:5500

echo.
echo Starting backend...
start "PDP Backend" "%UVICORN%" app.main:app --host 127.0.0.1 --port 8001

echo Starting frontend...
cd /d D:\github\pdp-system\frontend
start "PDP Frontend" "%PY%" -m http.server 5500 --bind 127.0.0.1

cd /d D:\github\pdp-system

echo.
echo ============================================================================
echo  SERVERS STARTED
echo ============================================================================
echo Backend:  http://127.0.0.1:8001
echo Docs:     http://127.0.0.1:8001/docs
echo Frontend: http://127.0.0.1:5500
echo.
echo Credentials: student / 123
echo.
echo Check the opened windows for server logs.
echo.
pause
