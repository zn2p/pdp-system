from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.schemas import Token
from app.core.security import verify_password, create_access_token
from app.schemas.schemas import UserOut

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(form: dict, db: Session = Depends(get_db)):
    username = form.get("username")
    password = form.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password required")
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer", "expires_in": 3600}
