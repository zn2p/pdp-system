from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .base import Base


class TeacherStudent(Base):
    __tablename__ = "teacher_students"
    __table_args__ = (UniqueConstraint("teacher_id", "student_id", name="uq_teacher_student"),)

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)

    teacher = relationship("User", foreign_keys=[teacher_id])
    student = relationship("Student", foreign_keys=[student_id])
