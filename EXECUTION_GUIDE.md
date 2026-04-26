# EXECUTION GUIDE - PDP-SYSTEM LOCAL STARTUP

## STATUS: ✓ FULLY PREPARED

All infrastructure is ready. Three execution methods available:

---

## QUICK START (Recommended)

### Option 1: Simple Python Runner (5 seconds setup)
```cmd
cd D:\github\pdp-system
python quick_start.py
```

**What happens:**
1. ✓ Runs pytest (2 tests)
2. ✓ Initializes database
3. ✓ Starts backend on 127.0.0.1:8001
4. ✓ Starts frontend on 127.0.0.1:5500
5. ✓ Verifies endpoints
6. Press Ctrl+C to stop both servers

---

### Option 2: Batch Script (Windows Native)
```cmd
cd D:\github\pdp-system
start.bat
```

**What happens:**
1. ✓ Checks Python environment
2. ✓ Runs pytest
3. ✓ Initializes database
4. ✓ Opens new window for backend server
5. ✓ Opens new window for frontend server
6. ✓ Displays summary with URLs

---

### Option 3: Manual Step-by-Step

**Terminal 1: Activate environment & start backend**
```cmd
cd D:\github\pdp-system
.venv311\Scripts\activate.bat
pytest tests/ -v
python -m app.db.init_db
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

**Terminal 2: Start frontend**
```cmd
cd D:\github\pdp-system\frontend
D:\github\pdp-system\.venv311\Scripts\python.exe -m http.server 5500 --bind 127.0.0.1
```

---

## SERVICES & URLs

### Backend API
- **URL**: http://127.0.0.1:8001
- **Status**: Port 8001
- **API Docs**: http://127.0.0.1:8001/docs
- **Health Check**: http://127.0.0.1:8001/api/v1/health

### Frontend
- **URL**: http://127.0.0.1:5500
- **Index**: http://127.0.0.1:5500/index.html
- **Status**: Port 5500

### Login Credentials
- **Username**: `student`
- **Password**: `123`

---

## VERIFICATION

Test endpoints after startup:

```cmd
REM Test backend
curl http://127.0.0.1:8001/

REM Test API docs
curl http://127.0.0.1:8001/docs

REM Test frontend
curl http://127.0.0.1:5500/index.html

REM Test health
curl http://127.0.0.1:8001/api/v1/health
```

Or open in browser:
- Backend: http://127.0.0.1:8001
- API Docs: http://127.0.0.1:8001/docs
- Frontend: http://127.0.0.1:5500

---

## FILE REFERENCE

### Startup Scripts (Choose one)
| File | Method | Ease | Speed |
|------|--------|------|-------|
| `quick_start.py` | Python | Easy | Fast (5s) |
| `start.bat` | Batch | Very Easy | Fast (5s) |
| `run_system.py` | Python (advanced) | Medium | Normal (10s) |

### Documentation
| File | Purpose |
|------|---------|
| `STARTUP_SUMMARY.md` | Complete startup guide |
| `INSPECTION_REPORT.md` | Detailed inspection report |
| `EXECUTION_GUIDE.md` | This file |

### Project Files
| File | Purpose |
|------|---------|
| `requirements.txt` | Python dependencies (all installed) |
| `app/main.py` | FastAPI application entry point |
| `frontend/` | Static web files (HTML/CSS/JS) |
| `tests/test_root.py` | Unit tests (2 tests ready) |
| `.venv311/` | Virtual environment with all tools |

---

## TROUBLESHOOTING

### Port Already In Use
```cmd
REM Find what's using port 8001
netstat -ano | findstr :8001

REM Find what's using port 5500
netstat -ano | findstr :5500

REM Kill process (if PID is 12345)
taskkill /PID 12345 /F
```

### Python Not Found
```cmd
REM Check Python is installed
python --version

REM Check venv exists
dir D:\github\pdp-system\.venv311

REM Recreate if needed
python -m venv .venv311
.venv311\Scripts\activate.bat
pip install -r requirements.txt
```

### Database Errors
```cmd
REM Reset database
del dev.db
python -m app.db.init_db
```

### Servers Won't Start
```cmd
REM Activate venv and verify dependencies
.venv311\Scripts\activate.bat
pip install -r requirements.txt --upgrade

REM Try manual start
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

---

## ENVIRONMENT DETAILS

### Virtual Environment
- **Location**: `D:\github\pdp-system\.venv311`
- **Python**: 3.11+
- **Size**: ~400MB
- **Status**: ✓ Pre-configured

### Installed Packages
```
fastapi==0.95.2
uvicorn[standard]==0.22.0
SQLAlchemy==1.4.49
SQLModel>=0.0.8
python-jose==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==1.10.12
alembic>=1.11.0
pytest>=7.0.0
httpx>=0.24.0
```

### Database
- **Type**: SQLite
- **Files**: `dev.db`, `pdp.db`
- **Location**: `D:\github\pdp-system\`
- **Auto-init**: Yes (on first request)

---

## WORKFLOW

### For Development
1. Run `python quick_start.py` or `start.bat`
2. Open http://127.0.0.1:8001/docs to see API
3. Backend has `--reload` enabled (auto-restarts on code changes)
4. Edit frontend files in `frontend/` folder
5. Refresh browser to see frontend changes
6. Login with `student` / `123`

### For Testing
1. Activate venv: `.venv311\Scripts\activate.bat`
2. Run tests: `pytest tests/ -v`
3. Tests verify basic endpoints work

### For Production
1. Change backend host from `127.0.0.1` to `0.0.0.0`
2. Change port from `8001` to `80` or use reverse proxy
3. Disable `--reload` option
4. Use environment variables for secrets
5. Set up proper database

---

## PROJECT STRUCTURE

```
D:\github\pdp-system\
├── app/                        # FastAPI backend
│   ├── main.py                # Entry point (CORS configured)
│   ├── api/v1/routes/        # API endpoints
│   ├── models/               # SQLModel database models
│   ├── schemas/              # Pydantic data schemas
│   ├── db/                   # Database setup & init
│   ├── core/                 # Configuration
│   └── crud/                 # CRUD operations
├── frontend/                  # Static website
│   ├── index.html            # Main HTML page
│   ├── app.js                # JavaScript application
│   └── styles.css            # CSS styling
├── tests/                     # Unit tests
│   └── test_root.py          # Basic API tests
├── .venv311/                 # Python 3.11 virtual environment
├── requirements.txt          # Dependency list
├── dev.db                    # Development database
├── pdp.db                    # Backup database
├── quick_start.py            # Quick startup script (Recommended)
├── start.bat                 # Batch startup script
└── [Documentation files]     # README, guides, etc.
```

---

## EXPECTED OUTPUTS

### After Running `python quick_start.py`:
```
======================================================================
 PDP-SYSTEM STARTUP SEQUENCE
======================================================================

[1] Running tests...
    Test exit code: 0

[2] Initializing database...
    ✓ Database ready

[3] Starting backend (127.0.0.1:8001)...
    Backend PID: 12345

[4] Starting frontend (127.0.0.1:5500)...
    Frontend PID: 12346

[5] Verifying endpoints...
    ✓ Backend: 200
    ✓ Frontend: 200

======================================================================
 SUMMARY
======================================================================

Backend:  http://127.0.0.1:8001
Docs:     http://127.0.0.1:8001/docs
Frontend: http://127.0.0.1:5500

Credentials: student / 123

Backend PID:  12345
Frontend PID: 12346

Servers are running. Press Ctrl+C to stop.
```

---

## QUICK REFERENCE

| Action | Command |
|--------|---------|
| Quick start | `python quick_start.py` |
| Windows native | `start.bat` |
| Manual backend | `uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload` |
| Manual frontend | `cd frontend && python -m http.server 5500 --bind 127.0.0.1` |
| Run tests | `pytest tests/ -v` |
| Activate venv | `.venv311\Scripts\activate.bat` |
| Install deps | `pip install -r requirements.txt` |
| Init database | `python -m app.db.init_db` |
| Check port 8001 | `netstat -ano \| findstr :8001` |
| Kill process | `taskkill /PID <PID> /F` |

---

## SUMMARY

✓ **System Status**: READY TO START  
✓ **Environment**: Configured and verified  
✓ **Dependencies**: All installed  
✓ **Database**: Ready to initialize  
✓ **Tests**: Ready to run  
✓ **Servers**: Ready to start  

**Minimum Steps to Run**:
1. Open Command Prompt
2. Run: `cd D:\github\pdp-system && python quick_start.py`
3. Open: `http://127.0.0.1:8001` in browser
4. Open: `http://127.0.0.1:5500` in another tab

**Total Time**: ~5-10 seconds ⏱️

---

**Ready to start? Run:** `python quick_start.py`
