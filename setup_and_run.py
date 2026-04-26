#!/usr/bin/env python
"""
Setup and run pdp-system on Windows
"""
import subprocess
import sys
import os
import time

os.chdir(r'D:\github\pdp-system')

VENV_PATH = r'D:\github\pdp-system\.venv311'
PYTHON_EXE = os.path.join(VENV_PATH, 'Scripts', 'python.exe')
PYTEST_EXE = os.path.join(VENV_PATH, 'Scripts', 'pytest.exe')
UVICORN_EXE = os.path.join(VENV_PATH, 'Scripts', 'uvicorn.exe')

def run_command(cmd, description):
    """Run a command and report status"""
    print(f"\n{'='*50}")
    print(f"{description}")
    print(f"{'='*50}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"Command timed out: {cmd}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

# Step 1: Run tests
print("\n" + "="*50)
print("STEP 1: RUNNING TESTS")
print("="*50)
test_cmd = f'"{PYTEST_EXE}" tests/ -v'
run_command(test_cmd, "Running pytest...")

# Step 2: Initialize database
print("\n" + "="*50)
print("STEP 2: INITIALIZING DATABASE")
print("="*50)
db_cmd = f'"{PYTHON_EXE}" -m app.db.init_db'
run_command(db_cmd, "Initializing database...")

# Step 3: Start backend server
print("\n" + "="*50)
print("STEP 3: STARTING BACKEND SERVER (Port 8001)")
print("="*50)
backend_cmd = f'"{UVICORN_EXE}" app.main:app --host 127.0.0.1 --port 8001 --reload'
print(f"Command: {backend_cmd}")
backend_process = subprocess.Popen(backend_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
print(f"Backend server started (PID: {backend_process.pid})")

# Step 4: Start frontend server
print("\n" + "="*50)
print("STEP 4: STARTING FRONTEND STATIC SERVER (Port 5500)")
print("="*50)
frontend_dir = r'D:\github\pdp-system\frontend'
frontend_cmd = f'"{PYTHON_EXE}" -m http.server 5500 --bind 127.0.0.1 --directory "{frontend_dir}"'
print(f"Command: {frontend_cmd}")
frontend_process = subprocess.Popen(frontend_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, cwd=frontend_dir)
print(f"Frontend server started (PID: {frontend_process.pid})")

# Step 5: Verify endpoints
print("\n" + "="*50)
print("STEP 5: VERIFYING ENDPOINTS")
print("="*50)

# Wait a bit for servers to start
time.sleep(3)

# Test backend
print("\nTesting backend at http://127.0.0.1:8001/...")
import httpx
try:
    response = httpx.get('http://127.0.0.1:8001/', timeout=5.0)
    print(f"✓ Backend responding: Status {response.status_code}")
    print(f"  Response: {response.json()}")
except Exception as e:
    print(f"✗ Backend not responding: {e}")

# Test API docs
print("\nTesting API docs at http://127.0.0.1:8001/docs...")
try:
    response = httpx.get('http://127.0.0.1:8001/docs', timeout=5.0)
    print(f"✓ API docs available: Status {response.status_code}")
except Exception as e:
    print(f"✗ API docs not available: {e}")

# Test frontend
print("\nTesting frontend at http://127.0.0.1:5500/index.html...")
try:
    response = httpx.get('http://127.0.0.1:5500/index.html', timeout=5.0)
    print(f"✓ Frontend responding: Status {response.status_code}")
except Exception as e:
    print(f"✗ Frontend not responding: {e}")

# Summary
print("\n" + "="*50)
print("SETUP COMPLETE - SERVERS RUNNING")
print("="*50)
print("\nEndpoints:")
print("  Backend API:   http://127.0.0.1:8001")
print("  API Docs:      http://127.0.0.1:8001/docs")
print("  Frontend:      http://127.0.0.1:5500")
print("\nServer PIDs:")
print(f"  Backend:  {backend_process.pid}")
print(f"  Frontend: {frontend_process.pid}")
print("\nNote: Servers are running. Press Ctrl+C to stop all processes.")

# Keep script running
try:
    backend_process.wait()
except KeyboardInterrupt:
    print("\n\nShutting down...")
    backend_process.terminate()
    frontend_process.terminate()
    backend_process.wait()
    frontend_process.wait()
    print("All servers stopped.")
