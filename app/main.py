from fastapi import FastAPI
from app.api.v1.routes import router as api_router
from app.db import session as db_session

app = FastAPI(title="pdp-system API")

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup():
    db_session.init_db()


@app.get("/")
def read_root():
    return {"message": "pdp-system"}
