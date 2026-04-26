# PDP-System Startup Guide

## Project Overview
- **Name**: Personal Development Planning System (大学生成长规划系统)
- **Framework**: FastAPI + SQLModel
- **Backend Port**: 8001 (configured for local development)
- **Frontend Port**: 5500 (static file server)
- **Python Version**: 3.11+
- **Virtual Environment**: `.venv311` (already created and pre-configured)

## Environment Status
- ✓ Virtual environment exists: `D:\github\pdp-system\.venv311`
- ✓ Dependencies installed (pip, pytest, uvicorn, httpx, etc.)
- ✓ Python executable ready: `D:\github\pdp-system\.venv311\Scripts\python.exe`
- ✓ Database files present: `dev.db`, `pdp.db`
- ✓ Frontend files ready: `frontend/app.js`, `frontend/index.html`, `frontend/styles.css`
- ✓ Tests available: `tests/test_root.py` (2 tests)

## Quick Start Methods

### Method 1: Using Batch Script (Windows Native)
```cmd
cd D:\github\pdp-system
start.bat
```
This will:
1. Verify Python environment
2. Run tests (pytest)
3. Initialize database
4. Start backend server in a new command window
5. Start frontend server in a new command window
6. Display summary with URLs and credentials

### Method 2: Using Python Script
```cmd
cd D:\github\pdp-system
python quick_start.py
```
Runs all steps in a single process window.

### Method 3: Manual Steps (One-by-one)

#### Step 1: Activate virtual environment
```cmd
cd D:\github\pdp-system
.venv311\Scripts\activate.bat
```

#### Step 2: Run tests
```cmd
pytest tests/ -v
```
Expected: 2 tests pass (`test_root`, `test_health`)

#### Step 3: Initialize database
```cmd
python -m app.db.init_db
```

#### Step 4: Start backend (in one terminal/window)
```cmd
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
Expected output: "Uvicorn running on http://127.0.0.1:8001"

#### Step 5: Start frontend (in another terminal/window)
```cmd
cd frontend
python -m http.server 5500 --bind 127.0.0.1
```
Expected output: "Serving HTTP on 127.0.0.1 port 5500"

## Endpoints & Verification

### Backend API (Port 8001)
- **Root**: `http://127.0.0.1:8001/`
  - Response: `{"message": "pdp-system"}`
  - Method: GET
  - Status: 200

- **API Documentation**: `http://127.0.0.1:8001/docs`
  - Interactive Swagger UI
  - Full API endpoint reference

- **Alternative Docs**: `http://127.0.0.1:8001/redoc`
  - ReDoc format documentation

### Frontend (Port 5500)
- **Main Page**: `http://127.0.0.1:5500/`
- **Index**: `http://127.0.0.1:5500/index.html`
- Files served: `app.js`, `styles.css`, `index.html`

## Test Credentials
- **Username**: `student`
- **Password**: `123`

## Backend Routes Configured
Based on `app/main.py`:
- `/api/v1/` - Main API router
- `/` - Authentication routes
- `/` - Student routes
- `/` - Course routes
- `/` - Achievement routes
- `/` - File upload routes

CORS enabled for:
- `http://127.0.0.1:5500`
- `http://localhost:5500`

## Database
- **Type**: SQLite
- **Files**: 
  - `dev.db` - Development database
  - `pdp.db` - Production database
- **Initialization**: Automatic on first backend request
- **Migrations**: Using Alembic (if needed)

## Dependencies
All installed in `.venv311`:
- fastapi==0.95.2
- uvicorn[standard]==0.22.0
- SQLAlchemy==1.4.49
- SQLModel>=0.0.8
- python-jose==3.3.0
- passlib[bcrypt]==1.7.4
- python-multipart==0.0.6
- pydantic==1.10.12
- alembic>=1.11.0
- pytest>=7.0.0
- httpx>=0.24.0

## Stopping Servers

### From batch script
- Close the command windows or press Ctrl+C

### From Python script
- Press Ctrl+C in the main window

### Manual kill
```cmd
taskkill /PID <backend_pid> /F
taskkill /PID <frontend_pid> /F
```

## Troubleshooting

### Port already in use
- Backend port 8001: `netstat -ano | findstr :8001`
- Frontend port 5500: `netstat -ano | findstr :5500`
- Kill process: `taskkill /PID <PID> /F`

### Database errors
```cmd
rm dev.db
python -m app.db.init_db
```

### Import errors
```cmd
.venv311\Scripts\activate.bat
pip install -r requirements.txt --upgrade
```

### Virtual environment issues
```cmd
rmdir /s /q .venv311
python -m venv .venv311
.venv311\Scripts\activate.bat
pip install -r requirements.txt
```

## Project Structure
```
pdp-system/
├── app/
│   ├── main.py           # FastAPI app entry point
│   ├── api/              # Route handlers
│   ├── models/           # SQLModel database models
│   ├── schemas/          # Pydantic schemas
│   ├── db/               # Database setup
│   ├── core/             # Core config
│   └── crud/             # CRUD operations
├── frontend/
│   ├── index.html        # Main page
│   ├── app.js            # JavaScript logic
│   └── styles.css        # Styling
├── tests/
│   └── test_root.py      # Unit tests
├── .venv311/             # Virtual environment
├── requirements.txt      # Python dependencies
├── dev.db                # Development database
└── README.md             # Original Chinese documentation
```

## Additional Notes
- Backend runs with `--reload` for development (auto-restarts on code changes)
- Frontend is served as static files (no backend required to serve HTML/CSS/JS)
- CORS middleware configured for development
- Database initialization happens automatically on startup
- All ports use localhost (127.0.0.1) for security

## Windows Considerations
- Batch scripts use `setlocal enabledelayedexpansion` for environment variables
- Paths use backslashes and full drive letters
- Commands assume Python 3.11+ is installed and in PATH
- Virtual environment activation uses `.bat` files on Windows

## Next Steps After Startup
1. Open `http://127.0.0.1:8001/docs` to explore API
2. Open `http://127.0.0.1:5500` in browser for frontend
3. Login with `student` / `123`
4. Review API routes in swagger documentation
5. Check server logs for any errors

---
Generated: 2024
For questions, refer to README.md (Chinese documentation included)
