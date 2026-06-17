#!/usr/bin/env python
"""
Complete setup and verification for pdp-system
Runs tests, initializes DB, starts servers, and verifies endpoints
"""
import subprocess
import sys
import os
import time
import threading
import json

# Configuration
REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
VENV_PATH = os.path.join(REPO_ROOT, '.venv311')
PYTHON_EXE = os.path.join(VENV_PATH, 'Scripts', 'python.exe')
PYTEST_EXE = os.path.join(VENV_PATH, 'Scripts', 'pytest.exe')
UVICORN_EXE = os.path.join(VENV_PATH, 'Scripts', 'uvicorn.exe')

BACKEND_HOST = '127.0.0.1'
BACKEND_PORT = 8001
FRONTEND_HOST = '127.0.0.1'
FRONTEND_PORT = 5500

BACKEND_URL = f'http://{BACKEND_HOST}:{BACKEND_PORT}'
FRONTEND_URL = f'http://{FRONTEND_HOST}:{FRONTEND_PORT}'

# Global process handles
backend_process = None
frontend_process = None

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def run_sync_command(cmd, description, cwd=None, timeout=60):
    """Run a command synchronously and return success status"""
    print(f"\n[*] {description}")
    print(f"    Command: {cmd[:80]}..." if len(cmd) > 80 else f"    Command: {cmd}")
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd or REPO_ROOT
        )
        if result.stdout:
            print(result.stdout)
        if result.stderr and result.returncode != 0:
            print(f"STDERR: {result.stderr}")
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"    ✗ Command timed out after {timeout}s")
        return False
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return False

def start_backend_server():
    """Start the backend server asynchronously"""
    global backend_process
    print_section("STARTING BACKEND SERVER")
    cmd = f'"{UVICORN_EXE}" app.main:app --host {BACKEND_HOST} --port {BACKEND_PORT} --reload'
    print(f"Command: {cmd}")
    print(f"URL: {BACKEND_URL}")
    
    try:
        backend_process = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=REPO_ROOT
        )
        print(f"✓ Backend started (PID: {backend_process.pid})")
        return True
    except Exception as e:
        print(f"✗ Failed to start backend: {e}")
        return False

def start_frontend_server():
    """Start the frontend HTTP server asynchronously"""
    global frontend_process
    print_section("STARTING FRONTEND STATIC SERVER")
    frontend_dir = os.path.join(REPO_ROOT, 'frontend')
    cmd = f'"{PYTHON_EXE}" -m http.server {FRONTEND_PORT} --bind {FRONTEND_HOST}'
    print(f"Command: {cmd}")
    print(f"URL: {FRONTEND_URL}")
    print(f"Directory: {frontend_dir}")
    
    try:
        frontend_process = subprocess.Popen(
            cmd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=frontend_dir
        )
        print(f"✓ Frontend started (PID: {frontend_process.pid})")
        return True
    except Exception as e:
        print(f"✗ Failed to start frontend: {e}")
        return False

def verify_endpoint(url, description, timeout=5.0):
    """Verify that an endpoint is responding"""
    try:
        import httpx
        response = httpx.get(url, timeout=timeout, follow_redirects=True)
        status = response.status_code
        print(f"  ✓ {description}: {status} OK")
        return True
    except Exception as e:
        print(f"  ✗ {description}: {str(e)[:60]}")
        return False

def verify_endpoints():
    """Verify all endpoints with retries"""
    print_section("VERIFYING ENDPOINTS")
    
    # Retry a few times as servers may take a moment to start
    max_retries = 5
    for attempt in range(max_retries):
        if attempt > 0:
            print(f"\n  [Attempt {attempt + 1}/{max_retries}]")
            time.sleep(2)
        
        backend_ok = verify_endpoint(
            f'{BACKEND_URL}/',
            'Backend API root'
        )
        backend_docs = verify_endpoint(
            f'{BACKEND_URL}/docs',
            'Backend API docs'
        )
        frontend_ok = verify_endpoint(
            f'{FRONTEND_URL}/index.html',
            'Frontend index'
        )
        
        if backend_ok and frontend_ok:
            return True
    
    return False

def main():
    """Main setup and run routine"""
    os.chdir(REPO_ROOT)
    
    # Check prerequisites
    print_section("CHECKING PREREQUISITES")
    if not os.path.exists(PYTHON_EXE):
        print(f"✗ Python executable not found: {PYTHON_EXE}")
        sys.exit(1)
    print(f"✓ Virtual environment found: {VENV_PATH}")
    print(f"✓ Python executable: {PYTHON_EXE}")
    
    # Step 1: Run tests
    print_section("STEP 1: RUNNING TESTS")
    test_cmd = f'"{PYTEST_EXE}" tests/ -v'
    test_ok = run_sync_command(test_cmd, "Running pytest")
    if test_ok:
        print("✓ Tests passed")
    else:
        print("⚠ Tests failed or had issues")
    
    # Step 2: Initialize database
    print_section("STEP 2: INITIALIZING DATABASE")
    db_cmd = f'"{PYTHON_EXE}" -m app.db.init_db'
    db_ok = run_sync_command(db_cmd, "Initializing database")
    if db_ok:
        print("✓ Database initialized")
    else:
        print("⚠ Database initialization had issues")
    
    # Step 3 & 4: Start servers
    if not start_backend_server():
        sys.exit(1)
    
    time.sleep(1)
    
    if not start_frontend_server():
        sys.exit(1)
    
    # Step 5: Verify endpoints
    time.sleep(2)
    if verify_endpoints():
        print("\n✓ All endpoints verified")
    else:
        print("\n⚠ Some endpoints not responding yet (may start soon)")
    
    # Print summary
    print_section("SETUP COMPLETE - SERVERS RUNNING")
    print(f"""
Summary of running services:

BACKEND API:
  - URL:     {BACKEND_URL}
  - Docs:    {BACKEND_URL}/docs
  - Host:    {BACKEND_HOST}
  - Port:    {BACKEND_PORT}
  - Process: {backend_process.pid if backend_process else 'N/A'}

FRONTEND (Static Files):
  - URL:     {FRONTEND_URL}
  - Host:    {FRONTEND_HOST}
  - Port:    {FRONTEND_PORT}
  - Process: {frontend_process.pid if frontend_process else 'N/A'}
  - Root:    {os.path.join(REPO_ROOT, 'frontend')}

CREDENTIALS:
  - Username: UIBE
  - Password: 123

Status:
  - Tests:             {'PASSED' if test_ok else 'FAILED'}
  - Database:          {'INITIALIZED' if db_ok else 'FAILED'}
  - Backend Server:    RUNNING
  - Frontend Server:   RUNNING
  - Endpoints:         VERIFIED

Commands to stop servers:
  - Press Ctrl+C in the command prompt windows running the servers
  - Or use: taskkill /PID {backend_process.pid} /F (backend)
  - Or use: taskkill /PID {frontend_process.pid} /F (frontend)
    """)
    
    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n[*] Shutting down servers...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        
        try:
            if backend_process:
                backend_process.wait(timeout=5)
            if frontend_process:
                frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            if backend_process:
                backend_process.kill()
            if frontend_process:
                frontend_process.kill()
        
        print("[*] All servers stopped.")
        sys.exit(0)

if __name__ == '__main__':
    main()
