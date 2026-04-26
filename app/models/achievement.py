from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)
    date = Column(String, nullable=True)
    org = Column(String, nullable=True)
    level = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    tags = Column(String, nullable=True)
    attachment_path = Column(String, nullable=True)

    student = relationship("Student", backref="achievements")
