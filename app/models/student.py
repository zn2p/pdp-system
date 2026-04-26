from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    student_id = Column(String, unique=True, index=True, nullable=True)
    school = Column(String, nullable=True)
    major = Column(String, nullable=True)
    grad_year = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    photo_path = Column(String, nullable=True)

    user = relationship("User")
