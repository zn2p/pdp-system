from sqlalchemy import Column, Integer, String, Float
from .base import Base


class Benchmark(Base):
    __tablename__ = "benchmarks"

    id = Column(Integer, primary_key=True)
    group_name = Column(String, index=True)
    time_range = Column(String, default="全部")
    gpa_avg = Column(Float, default=0.0)
    course_count_avg = Column(Float, default=0.0)
    competition_count_avg = Column(Float, default=0.0)
    internship_count_avg = Column(Float, default=0.0)
    award_count_avg = Column(Float, default=0.0)
    cert_count_avg = Column(Float, default=0.0)
    sample_size = Column(Integer, default=0)
