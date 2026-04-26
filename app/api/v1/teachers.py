from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.db.session import get_db
from app.models.user import User
from app.models.student import Student
from app.models.teacher_student import TeacherStudent
from app.core.config import settings

router = APIRouter(prefix="/api/v1/teachers", tags=["teachers"])

security = HTTPBearer()


def get_current_teacher(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "staff":
        raise HTTPException(status_code=403, detail="Teacher access required")
    return user


@router.get("/available-students", response_model=List[dict])
def get_available_students(db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    """Return all users with student role and their student profile info."""
    students = (
        db.query(Student)
        .join(User, Student.user_id == User.id)
        .filter(User.role == "student")
        .all()
    )
    result = []
    for s in students:
        result.append({
            "student_record_id": s.id,
            "user_id": s.user_id,
            "student_id": s.student_id,
            "name": s.user.display_name if s.user else s.student_id,
            "school": s.school,
            "major": s.major,
        })
    return result


@router.get("/my-students", response_model=List[dict])
def get_my_students(db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    """Return the student list for the current teacher."""
    rows = (
        db.query(TeacherStudent)
        .filter(TeacherStudent.teacher_id == teacher.id)
        .all()
    )
    result = []
    for row in rows:
        s = row.student
        result.append({
            "id": s.id,
            "student_id": s.student_id,
            "name": s.user.display_name if s.user else s.student_id,
            "school": s.school,
            "major": s.major,
        })
    return result


@router.post("/my-students", response_model=dict, status_code=201)
def add_my_student(payload: dict, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    """Add a student (by student record id) to the current teacher's list."""
    student_record_id = payload.get("student_record_id")
    if not student_record_id:
        raise HTTPException(status_code=400, detail="student_record_id required")
    student = db.query(Student).filter(Student.id == student_record_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    existing = db.query(TeacherStudent).filter(
        TeacherStudent.teacher_id == teacher.id,
        TeacherStudent.student_id == student_record_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Student already in your list")
    rel = TeacherStudent(teacher_id=teacher.id, student_id=student_record_id)
    db.add(rel)
    db.commit()
    db.refresh(rel)
    s = rel.student
    return {
        "id": s.id,
        "student_id": s.student_id,
        "name": s.user.display_name if s.user else s.student_id,
        "school": s.school,
        "major": s.major,
    }


@router.delete("/my-students/{student_record_id}", status_code=204)
def remove_my_student(student_record_id: int, db: Session = Depends(get_db), teacher: User = Depends(get_current_teacher)):
    """Remove a student from the current teacher's list."""
    rel = db.query(TeacherStudent).filter(
        TeacherStudent.teacher_id == teacher.id,
        TeacherStudent.student_id == student_record_id
    ).first()
    if not rel:
        raise HTTPException(status_code=404, detail="Not in your student list")
    db.delete(rel)
    db.commit()
    return None
