from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.student import Student
from app.models.user import User
from app.schemas.schemas import UserOut

router = APIRouter(prefix="/api/v1/students", tags=["students"])


@router.get("", response_model=List[dict])
def list_students(page: int = 1, limit: int = 20, q: str = None, db: Session = Depends(get_db)):
    query = db.query(Student)
    if q:
        query = query.filter(Student.student_id.contains(q) | Student.school.contains(q) | Student.major.contains(q))
    students = query.offset((page - 1) * limit).limit(limit).all()
    result = []
    for s in students:
        result.append({
            "id": s.id,
            "student_id": s.student_id,
            "school": s.school,
            "major": s.major,
            "name": s.user.display_name if s.user else None,
        })
    return result


@router.post("", response_model=dict)
def create_student(payload: dict, db: Session = Depends(get_db)):
    # payload expected: { name, student_id, school, major }
    student_id = payload.get("student_id")
    if not student_id:
        raise HTTPException(status_code=400, detail="student_id required")
    s = Student(student_id=student_id, school=payload.get("school"), major=payload.get("major"), phone=payload.get("phone"))
    db.add(s)
    db.commit()
    db.refresh(s)
    return {"id": s.id, "student_id": s.student_id}


@router.get("/{student_id}", response_model=dict)
def get_student(student_id: int, db: Session = Depends(get_db)):
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="student not found")
    return {
        "id": s.id,
        "student_id": s.student_id,
        "school": s.school,
        "major": s.major,
        "phone": s.phone,
        "courses": [ {"id": c.id, "name": c.name, "credit": c.credit, "grade": c.grade, "semester": c.semester} for c in s.courses ],
        "achievements": [ {"id": a.id, "name": a.name, "type": a.type, "date": a.date} for a in s.achievements ]
    }
