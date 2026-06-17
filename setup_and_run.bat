@echo off
REM Setup and run pdp-system
set ROOT=%~dp0
cd /d "%ROOT%"

echo.
echo ============================================
echo 1. RUNNING TESTS
echo ============================================
call .venv311\Scripts\pytest.exe tests/ -v

echo.
echo ============================================
echo 2. INITIALIZING DATABASE
echo ============================================
call .venv311\Scripts\python.exe -m app.db.init_db

echo.
echo ============================================
echo 3. STARTING BACKEND SERVER (Port 8001)
echo ============================================
REM Start backend in new window
start "Backend Server" /D "%ROOT%" cmd /k ".venv311\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8001"

echo.
echo ============================================
echo 4. STARTING FRONTEND STATIC SERVER (Port 5500)
echo ============================================
REM Start frontend in new window
start "Frontend Server" /D "%ROOT%frontend" cmd /k "..\.venv311\Scripts\python.exe serve.py"

echo.
echo ============================================
echo 5. VERIFYING ENDPOINTS
echo ============================================
timeout /t 3 /nobreak

REM Test backend
echo Testing backend at 127.0.0.1:8001...
.venv311\Scripts\python.exe -c "import httpx; r = httpx.get('http://127.0.0.1:8001/', timeout=5.0); print(f'Backend: {r.status_code} - {r.json()}')" 2>nul || echo Backend not yet ready, retrying in 2 seconds...
timeout /t 2 /nobreak
.venv311\Scripts\python.exe -c "import httpx; r = httpx.get('http://127.0.0.1:8001/', timeout=5.0); print(f'Backend: {r.status_code} - {r.json()}')" 2>nul || echo Backend verification failed

REM Test frontend
echo Testing frontend at 127.0.0.1:5500...
.venv311\Scripts\python.exe -c "import httpx; r = httpx.get('http://127.0.0.1:5500/index.html', timeout=5.0); print(f'Frontend: {r.status_code} - OK')" 2>nul || echo Frontend not yet ready

echo.
echo ============================================
echo SETUP COMPLETE
echo ============================================
echo Backend URL:  http://127.0.0.1:8001
echo API Docs:     http://127.0.0.1:8001/docs
echo Frontend URL: http://127.0.0.1:5500
echo.
echo Servers are running in separate windows. Press Ctrl+C in each window to stop.
echo.
pause
