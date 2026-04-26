from pydantic import BaseModel, Field
from typing import Optional, List


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserCreate(BaseModel):
    username: str
    password: str
    display_name: Optional[str]
    role: Optional[str] = "student"
    student_id: Optional[str] = None


class UserOut(BaseModel):
    id: int
    username: str
    display_name: Optional[str]
    role: str

    class Config:
        orm_mode = True


class CourseCreate(BaseModel):
    name: str
    semester: Optional[str]
    code: Optional[str]
    credit: Optional[float]
    grade: Optional[float]
    teacher: Optional[str]
    note: Optional[str]


class CourseOut(BaseModel):
    id: int
    student_id: int
    name: str
    semester: Optional[str]
    credit: Optional[float]
    grade: Optional[float]

    class Config:
        orm_mode = True
