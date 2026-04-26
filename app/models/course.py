from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from .base import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    credit = Column(Float, nullable=True)
    grade = Column(Float, nullable=True)
    teacher = Column(String, nullable=True)
    rank = Column(String, nullable=True)
    note = Column(String, nullable=True)

    student = relationship("Student", backref="courses")
