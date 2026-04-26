from sqlalchemy import Column, Integer, String, UniqueConstraint
from .base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("username", "role", name="uq_username_role"),)

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    role = Column(String, default="student")
    email = Column(String, nullable=True)
