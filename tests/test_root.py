from fastapi.testclient import TestClient
from app.main import app
from app.db.session import init_db

client = TestClient(app)


def setup_module():
    init_db()


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json().get("message") == "pdp-system"


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
