from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.student import Student
from app.schemas.schemas import Token, UserCreate, UserOut
from app.core.security import verify_password, create_access_token, get_password_hash

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: UserCreate, db: Session = Depends(get_db)):
    if not body.username or not body.password:
        raise HTTPException(status_code=400, detail="username and password required")
    role = body.role if body.role in ("student", "staff") else "student"
    if db.query(User).filter(User.username == body.username, User.role == role).first():
        raise HTTPException(status_code=409, detail="用户名已存在")
    user = User(
        username=body.username,
        password_hash=get_password_hash(body.password),
        display_name=body.display_name or body.username,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    if role == "student":
        s = Student(user_id=user.id, student_id=body.student_id or body.username)
        db.add(s)
        db.commit()
    return user


@router.post("/login", response_model=Token)
def login(form: dict, db: Session = Depends(get_db)):
    username = form.get("username")
    password = form.get("password")
    role = form.get("role")
    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password required")
    query = db.query(User).filter(User.username == username)
    if role:
        query = query.filter(User.role == role)
    user = query.first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer", "expires_in": 3600}
