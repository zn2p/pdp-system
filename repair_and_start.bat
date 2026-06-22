@echo off
REM Repair and start script for PDP-System
REM Use this when login fails, backend crashes, or .venv311 uses the wrong Python version.
setlocal

pushd "%~dp0" || (
    echo Cannot enter project directory: %~dp0
    pause
    exit /b 1
)

set "ROOT=%CD%\"
set "VENV=%ROOT%.venv311"
set "PY=%VENV%\Scripts\python.exe"

echo ============================================================================
echo  PDP-SYSTEM REPAIR AND START
echo ============================================================================
echo.

echo [1] Checking Python 3.11...
py -3.11 --version
if errorlevel 1 (
    echo.
    echo Python 3.11 was not found.
    echo Please install Python 3.11 first:
    echo https://www.python.org/downloads/release/python-3119/
    echo.
    echo During installation, please select: Add python.exe to PATH
    pause
    exit /b 1
)

echo.
echo [2] Checking existing virtual environment...
if exist "%PY%" (
    "%PY%" -c "import sys; raise SystemExit(0 if sys.version_info[:2] == (3, 11) else 1)"
    if errorlevel 1 (
        echo Existing .venv311 is not Python 3.11. Removing it...
        rmdir /s /q "%VENV%"
    ) else (
        echo Existing .venv311 is already Python 3.11.
    )
)

if not exist "%PY%" (
    echo Creating .venv311 with Python 3.11...
    py -3.11 -m venv "%VENV%"
    if errorlevel 1 (
        echo Failed to create .venv311.
        pause
        exit /b 1
    )
)

echo.
echo [3] Installing dependencies...
"%PY%" -m pip --version >nul 2>nul || (
    echo pip not found in venv, restoring via ensurepip...
    "%PY%" -m ensurepip --upgrade
)
"%PY%" -m pip install -r "%ROOT%requirements.txt" -i https://pypi.tuna.tsinghua.edu.cn/simple
if errorlevel 1 (
    echo Dependency installation failed. Please check your network.
    pause
    exit /b 1
)

echo.
echo [4] Initializing database...
"%PY%" -m app.db.init_db
if errorlevel 1 (
    echo Database initialization failed.
    pause
    exit /b 1
)

echo.
echo [5] Starting server...
echo App:  http://127.0.0.1:8001
echo Docs: http://127.0.0.1:8001/docs

echo.
echo Accounts:
echo   UIBE / 123     Student or Teacher
echo.
echo Keep this server window open while using the system.
echo.

"%PY%" -m uvicorn app.main:app --host 127.0.0.1 --port 8001

popd
