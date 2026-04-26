from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.student import Student
from app.models.achievement import Achievement
from app.schemas.schemas import UserOut

router = APIRouter(prefix="/api/v1/students/{student_id}/achievements", tags=["achievements"])


@router.get("", response_model=List[dict])
def list_achievements(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="student not found")
    return [ {"id": a.id, "name": a.name, "type": a.type, "date": a.date, "org": a.org} for a in student.achievements ]


@router.post("", response_model=dict)
def create_achievement(student_id: int, payload: dict, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="student not found")
    if not payload.get("name"):
        raise HTTPException(status_code=400, detail="name required")
    a = Achievement(student_id=student.id, name=payload.get("name"), type=payload.get("type"), date=payload.get("date"), org=payload.get("org"), level=payload.get("level"), description=payload.get("description"), tags=payload.get("tags"), attachment_path=payload.get("attachment_path"))
    db.add(a)
    db.commit()
    db.refresh(a)
    return {"id": a.id, "name": a.name}


@router.put("/{achieve_id}", response_model=dict)
def update_achievement(student_id: int, achieve_id: int, payload: dict, db: Session = Depends(get_db)):
    a = db.query(Achievement).filter(Achievement.id == achieve_id, Achievement.student_id == student_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="achievement not found")
    for k, v in payload.items():
        if hasattr(a, k):
            setattr(a, k, v)
    db.add(a)
    db.commit()
    db.refresh(a)
    return {"id": a.id, "name": a.name}


@router.delete("/{achieve_id}")
def delete_achievement(student_id: int, achieve_id: int, db: Session = Depends(get_db)):
    a = db.query(Achievement).filter(Achievement.id == achieve_id, Achievement.student_id == student_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="achievement not found")
    db.delete(a)
    db.commit()
    return {"ok": True}
