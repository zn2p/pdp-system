@echo off
REM Minimal startup script for pdp-system
setlocal enabledelayedexpansion

set ROOT=%~dp0
cd /d "%ROOT%"

set VENV=%ROOT%.venv311
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
echo [3] Initializing database...
"%PY%" -m app.db.init_db

echo.
echo [4] Starting servers...
echo    Backend:  127.0.0.1:8001
echo    Frontend: 127.0.0.1:5500

echo.
echo Starting backend...
start "PDP Backend" "%UVICORN%" app.main:app --host 127.0.0.1 --port 8001 --reload

echo Starting frontend...
start "PDP Frontend" "%PY%" "%ROOT%frontend\serve.py"

cd /d "%ROOT%"

echo.
echo ============================================================================
echo  SERVERS STARTED
echo ============================================================================
echo Backend:  http://127.0.0.1:8001
echo Docs:     http://127.0.0.1:8001/docs
echo Frontend: http://127.0.0.1:5500
echo.
echo Credentials: UIBE / 123  (student or staff)
echo.
echo Check the opened windows for server logs.
echo.
pause
