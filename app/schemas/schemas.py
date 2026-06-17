from pydantic import BaseModel, Field, validator
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
    rank: Optional[str]
    note: Optional[str]

    @validator("credit")
    def validate_credit(cls, v):
        if v is not None and v <= 0:
            raise ValueError("学分必须大于 0")
        return v

    @validator("grade")
    def validate_grade(cls, v):
        if v is not None and v <= 0:
            raise ValueError("成绩必须大于0")
        if v is not None and v > 100:
            raise ValueError("成绩不能超过100")
        return v


class CourseOut(BaseModel):
    id: int
    student_id: int
    name: str
    semester: Optional[str]
    code: Optional[str]
    credit: Optional[float]
    grade: Optional[float]
    teacher: Optional[str]
    rank: Optional[str]
    note: Optional[str]

    class Config:
        orm_mode = True
