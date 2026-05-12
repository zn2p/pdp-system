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
        "name": s.user.display_name if s.user else None,
        "school": s.school,
        "major": s.major,
        "grad_year": s.grad_year,
        "phone": s.phone,
        "email": s.email or (s.user.email if s.user else None),
        "job_target": s.job_target,
        "degree": s.degree,
        "skill_tags": s.skill_tags,
        "photo_path": s.photo_path,
        "courses": [{"id": c.id, "name": c.name, "credit": c.credit, "grade": c.grade, "semester": c.semester, "code": c.code, "teacher": c.teacher, "rank": c.rank, "note": c.note} for c in s.courses],
        "achievements": [{"id": a.id, "name": a.name, "type": a.type, "date": a.date, "org": a.org, "level": a.level, "description": a.description, "tags": a.tags} for a in s.achievements],
    }


@router.put("/{student_id}/profile", response_model=dict)
def update_profile(student_id: int, payload: dict, db: Session = Depends(get_db)):
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="student not found")
    allowed = {"school", "major", "grad_year", "phone", "email", "job_target", "degree", "skill_tags", "photo_path"}
    for key, val in payload.items():
        if key in allowed:
            setattr(s, key, val)
    # update display name if provided
    if "name" in payload and payload["name"] and s.user:
        s.user.display_name = payload["name"]
    db.commit()
    return {"ok": True}
