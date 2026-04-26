from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    path = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    mime = Column(String, nullable=True)
    size = Column(Integer, nullable=True)

    owner = relationship("User")
