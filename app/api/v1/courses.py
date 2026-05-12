from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.course import Course
from app.models.student import Student
from app.schemas.schemas import CourseCreate, CourseOut

router = APIRouter(prefix="/api/v1/students/{student_id}/courses", tags=["courses"])


@router.get("", response_model=List[CourseOut])
def list_courses(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="student not found")
    return student.courses


@router.post("", response_model=CourseOut)
def create_course(student_id: int, payload: CourseCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="student not found")
    course = Course(student_id=student.id, name=payload.name, semester=payload.semester, code=payload.code, credit=payload.credit, grade=payload.grade, teacher=payload.teacher, note=payload.note)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/{course_id}", response_model=CourseOut)
def update_course(student_id: int, course_id: int, payload: CourseCreate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id, Course.student_id == student_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="course not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}")
def delete_course(student_id: int, course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id, Course.student_id == student_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="course not found")
    db.delete(course)
    db.commit()
    return {"ok": True}
