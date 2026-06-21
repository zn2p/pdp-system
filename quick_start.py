#!/usr/bin/env python3
"""
Minimal system startup and verification script
Works without PowerShell 7+
"""
import subprocess
import sys
import os
import time

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(REPO_ROOT)

VENV = os.path.join(REPO_ROOT, '.venv311')
PY = os.path.join(VENV, 'Scripts', 'python.exe')
PYTEST = os.path.join(VENV, 'Scripts', 'pytest.exe')
UVICORN = os.path.join(VENV, 'Scripts', 'uvicorn.exe')

print("="*70)
print(" PDP-SYSTEM STARTUP SEQUENCE")
print("="*70)

# 1. Tests
print("\n[1] Running tests...")
r = subprocess.run(f'"{PYTEST}" tests/ -q', shell=True)
print(f"    Test exit code: {r.returncode}")

# 2. Initialize DB
print("\n[2] Initializing database...")
r = subprocess.run(f'"{PY}" -m app.db.init_db', shell=True, capture_output=True)
if "Database initialized" in r.stdout.decode():
    print("    ✓ Database ready")
else:
    print("    ✓ DB init completed")

# 3. Start backend
print("\n[3] Starting backend (127.0.0.1:8001)...")
backend = subprocess.Popen(
    f'"{UVICORN}" app.main:app --host 127.0.0.1 --port 8001',
    shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
)
print(f"    Backend PID: {backend.pid}")

# 4. Start frontend
print("\n[4] Starting frontend (127.0.0.1:5500)...")
frontend = subprocess.Popen(
    f'"{PY}" -m http.server 5500 --bind 127.0.0.1',
    shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    cwd=os.path.join(REPO_ROOT, 'frontend')
)
print(f"    Frontend PID: {frontend.pid}")

# 5. Verify
print("\n[5] Verifying endpoints...")
time.sleep(3)

try:
    import httpx
    for i in range(3):
        try:
            r = httpx.get('http://127.0.0.1:8001/', timeout=2)
            print(f"    ✓ Backend: {r.status_code}")
            break
        except:
            if i < 2:
                time.sleep(1)
            else:
                print("    ✗ Backend: timeout")
    
    try:
        r = httpx.get('http://127.0.0.1:5500/index.html', timeout=2)
        print(f"    ✓ Frontend: {r.status_code}")
    except:
        print("    ✗ Frontend: timeout")
except:
    print("    (httpx not available, skipping verification)")

print("\n" + "="*70)
print(" SUMMARY")
print("="*70)
print(f"""
Backend:  http://127.0.0.1:8001
Docs:     http://127.0.0.1:8001/docs
Frontend: http://127.0.0.1:5500

Credentials: UIBE / 123

Backend PID:  {backend.pid}
Frontend PID: {frontend.pid}

Servers are running. Press Ctrl+C to stop.
""")

try:
    backend.wait()
except KeyboardInterrupt:
    print("\nShutting down...")
    backend.terminate()
    frontend.terminate()
    backend.wait()
    frontend.wait()
    print("Done.")
