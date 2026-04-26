import mimetypes

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.api.v1.routes import router as api_router
from app.api.v1.auth import router as auth_router
from app.api.v1.students import router as students_router
from app.api.v1.courses import router as courses_router
from app.api.v1.achievements import router as achievements_router
from app.api.v1.files import router as files_router
from app.api.v1.teachers import router as teachers_router
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


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if response.status_code == 404 and FRONTEND_INDEX.is_file():
            return FileResponse(FRONTEND_INDEX)
        return response


app = FastAPI(title="pdp-system API")
app.include_router(api_router, prefix="/api/v1")
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(courses_router)
app.include_router(achievements_router)
app.include_router(files_router)
app.include_router(teachers_router)

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


if FRONTEND_DIR.is_dir():
    app.mount("/", SPAStaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
