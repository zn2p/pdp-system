@echo off
REM Portable single-service startup script for pdp-system
setlocal

REM Switch to the directory where this .bat file is located.
pushd "%~dp0" || (
    echo Cannot enter project directory: %~dp0
    pause
    exit /b 1
)

set "ROOT=%CD%\"
set "VENV=%ROOT%.venv311"
set "PY=%VENV%\Scripts\python.exe"

echo ============================================================================
echo  PDP-SYSTEM STARTUP
echo ============================================================================

echo.
echo [1] Checking Python virtual environment...

if not exist "%PY%" (
    echo Virtual environment not found. Creating .venv311 with Python 3.11 ...
    py -3.11 -m venv "%VENV%"
    if errorlevel 1 (
        echo.
        echo Failed to create virtual environment with Python 3.11.
        echo Please install Python 3.11 and make sure it is available via:
        echo   py -3.11 --version
        echo.
        echo Do NOT use Python 3.14 for this project.
        pause
        exit /b 1
    )
)

if not exist "%PY%" (
    echo Python environment still not found.
    echo Please install Python 3.11 first, then run this file again.
    pause
    exit /b 1
)

"%PY%" -c "import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 11) else 1)"
if errorlevel 1 (
    echo.
    echo The current .venv311 is not using Python 3.11.
    echo Please delete the .venv311 folder, install Python 3.11, then run start.bat again.
    echo.
    echo Current Python:
    "%PY%" --version
    echo.
    echo Do NOT use Python 3.14 for this project.
    pause
    exit /b 1
)

echo Python found:
"%PY%" --version

echo.
echo [2] Installing dependencies...
"%PY%" -m pip --version >nul 2>nul || (
    echo pip not found in venv, restoring via ensurepip...
    "%PY%" -m ensurepip --upgrade
)
"%PY%" -m pip install -r "%ROOT%requirements.txt" -i https://pypi.tuna.tsinghua.edu.cn/simple
if errorlevel 1 (
    echo Dependency installation failed. Please check your network or Python installation.
    pause
    exit /b 1
)

echo.
echo [3] Initializing database...
"%PY%" -m app.db.init_db
if errorlevel 1 (
    echo Database initialization failed.
    pause
    exit /b 1
)

echo.
echo [4] Starting server...
echo    App:  http://127.0.0.1:8001
echo    Docs: http://127.0.0.1:8001/docs

echo.
echo Credentials:
echo   Student/Teacher: UIBE / 123
echo.
echo Keep this server window open while using the system.
echo.
echo ============================================================================
echo  SERVER RUNNING
echo ============================================================================
echo.

"%PY%" -m uvicorn app.main:app --host 127.0.0.1 --port 8001

popd
