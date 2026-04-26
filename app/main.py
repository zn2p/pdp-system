from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
import uvicorn

from app.api.v1.routes import router as api_router
from app.api.v1.auth import router as auth_router
from app.api.v1.students import router as students_router
from app.api.v1.courses import router as courses_router
from app.api.v1.achievements import router as achievements_router
from app.api.v1.files import router as files_router
from app.db.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware


def _find_repo_root() -> Path:
    current = Path(__file__).resolve()
    for parent in current.parents:
        frontend_index = parent / "frontend" / "index.html"
        if frontend_index.is_file():
            return parent
    return current.parent.parent


BASE_DIR = _find_repo_root()
FRONTEND_DIR = BASE_DIR / "frontend"
FRONTEND_INDEX = FRONTEND_DIR / "index.html"


app = FastAPI(title="pdp-system API")
app.include_router(api_router, prefix="/api/v1")
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(courses_router)
app.include_router(achievements_router)
app.include_router(files_router)

# Allow local frontend development origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/", include_in_schema=False)
def read_root():
    if FRONTEND_INDEX.is_file():
        return FileResponse(FRONTEND_INDEX)
    return {"message": "pdp-system"}


@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str):
    if not FRONTEND_DIR.is_dir():
        return {"message": "pdp-system"}

    asset_path = (FRONTEND_DIR / full_path).resolve()
    try:
        asset_path.relative_to(FRONTEND_DIR.resolve())
    except ValueError:
        return FileResponse(FRONTEND_INDEX)

    if asset_path.is_file():
        return FileResponse(asset_path)

    return FileResponse(FRONTEND_INDEX)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
