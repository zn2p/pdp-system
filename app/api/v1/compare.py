import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.benchmark import Benchmark
from app.models.student import Student

router = APIRouter()


def grade_to_gpa(grade: float) -> float:
    if grade >= 90: return 4.0
    if grade >= 85: return 3.7
    if grade >= 82: return 3.3
    if grade >= 78: return 3.0
    if grade >= 75: return 2.7
    if grade >= 72: return 2.3
    if grade >= 68: return 2.0
    return 1.0


def _filter_courses(courses, time_range: str):
    if not time_range or time_range == "全部":
        return courses
    return [c for c in courses if (c.semester or "") == time_range]


def _filter_achievements(achievements, time_range: str):
    """Filter by year extracted from time_range (e.g. '2024春' → year '2024')."""
    if not time_range or time_range == "全部":
        return achievements
    year_match = re.search(r"(\d{4})", time_range)
    if year_match:
        year = year_match.group(1)
        return [a for a in achievements if year in (a.date or "")]
    return achievements


@router.post("/import-benchmark", response_model=dict)
def import_benchmark(payload: dict, db: Session = Depends(get_db)):
    """
    Import / update group benchmark averages.
    payload: { group_name, time_range, rows: [{gpa, courses, competitions, internships, awards, certs}, ...] }
    """
    group_name = payload.get("group_name", "同专业")
    time_range = payload.get("time_range", "全部")
    rows = payload.get("rows", [])

    if not rows:
        raise HTTPException(status_code=400, detail="rows 为空，请检查 CSV 格式")

    n = len(rows)
    def avg(field):
        return sum(float(r.get(field, 0) or 0) for r in rows) / n

    gpa_avg = round(avg("gpa"), 3)
    course_count_avg = round(avg("courses"), 2)
    competition_count_avg = round(avg("competitions"), 2)
    internship_count_avg = round(avg("internships"), 2)
    award_count_avg = round(avg("awards"), 2)
    cert_count_avg = round(avg("certs"), 2)

    existing = db.query(Benchmark).filter(
        Benchmark.group_name == group_name,
        Benchmark.time_range == time_range
    ).first()

    if existing:
        existing.gpa_avg = gpa_avg
        existing.course_count_avg = course_count_avg
        existing.competition_count_avg = competition_count_avg
        existing.internship_count_avg = internship_count_avg
        existing.award_count_avg = award_count_avg
        existing.cert_count_avg = cert_count_avg
        existing.sample_size = n
    else:
        db.add(Benchmark(
            group_name=group_name,
            time_range=time_range,
            gpa_avg=gpa_avg,
            course_count_avg=course_count_avg,
            competition_count_avg=competition_count_avg,
            internship_count_avg=internship_count_avg,
            award_count_avg=award_count_avg,
            cert_count_avg=cert_count_avg,
            sample_size=n,
        ))

    db.commit()
    return {"ok": True, "sample_size": n, "group_name": group_name, "time_range": time_range}


@router.post("/run", response_model=dict)
def run_comparison(payload: dict, db: Session = Depends(get_db)):
    """
    Run comparison for a student against group benchmark.
    payload: { student_id, group, time_range, dims }
    Returns: { dims: {dim: {label, personal, benchmark, unit}}, message, has_benchmark, sample_size }
    """
    student_id = payload.get("student_id")
    group = payload.get("group", "同专业")
    time_range = payload.get("time_range", "全部")
    dims = payload.get("dims", ["gpa"])

    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="student not found")

    # Find best matching benchmark: exact group+time_range, then group-only fallback
    bm = db.query(Benchmark).filter(
        Benchmark.group_name == group,
        Benchmark.time_range == time_range
    ).first()
    if not bm:
        bm = db.query(Benchmark).filter(Benchmark.group_name == group).first()

    has_benchmark = bm is not None

    # Filter student data by time range
    filtered_courses = _filter_courses(s.courses, time_range)
    filtered_achievements = _filter_achievements(s.achievements, time_range)

    # Personal values
    gpa_vals = [grade_to_gpa(float(c.grade)) for c in filtered_courses if c.grade is not None]
    personal_gpa = round(sum(gpa_vals) / len(gpa_vals), 2) if gpa_vals else 0.0
    personal_course = len(filtered_courses)
    personal_competition = len([a for a in filtered_achievements if a.type == "竞赛"])
    personal_internship = len([a for a in filtered_achievements if a.type == "实习"])
    personal_award = len([a for a in filtered_achievements if a.type == "奖项"])
    personal_cert = len([a for a in filtered_achievements if a.type == "证书"])

    dim_map = {
        "gpa":         {"label": "GPA",      "personal": personal_gpa,         "benchmark": round(bm.gpa_avg, 2) if bm else None,               "unit": ""},
        "course":      {"label": "课程修读",  "personal": personal_course,      "benchmark": round(bm.course_count_avg, 1) if bm else None,      "unit": "门"},
        "competition": {"label": "竞赛经历",  "personal": personal_competition, "benchmark": round(bm.competition_count_avg, 1) if bm else None, "unit": "次"},
        "internship":  {"label": "实习经历",  "personal": personal_internship,  "benchmark": round(bm.internship_count_avg, 1) if bm else None,  "unit": "段"},
        "award":       {"label": "获奖情况",  "personal": personal_award,       "benchmark": round(bm.award_count_avg, 1) if bm else None,       "unit": "项"},
        "cert":        {"label": "技能证书",  "personal": personal_cert,        "benchmark": round(bm.cert_count_avg, 1) if bm else None,        "unit": "项"},
    }

    result_dims = {d: dim_map[d] for d in dims if d in dim_map}

    # Overall summary message
    if has_benchmark and "gpa" in result_dims:
        p = result_dims["gpa"]["personal"]
        b = result_dims["gpa"]["benchmark"]
        if b and b > 0:
            if p >= b * 1.1:
                msg = f"你的GPA（{p}）明显高于{group}均值（{b}），综合表现优秀！"
            elif p >= b:
                msg = f"你的GPA（{p}）略高于{group}均值（{b}），继续保持！"
            elif p >= b * 0.9:
                msg = f"你的GPA（{p}）接近{group}均值（{b}），还有提升空间。"
            else:
                msg = f"你的GPA（{p}）低于{group}均值（{b}），建议加强课程学习。"
        else:
            msg = f"已完成{group}对比分析（{len(dims)} 个维度）。"
    elif not has_benchmark:
        msg = f"暂无「{group}」基准数据，请先通过上方导入功能上传群体 CSV 文件。当前仅展示个人数据。"
    else:
        msg = f"已完成{group}对比分析，共 {len(dims)} 个维度。"

    return {
        "dims": result_dims,
        "message": msg,
        "has_benchmark": has_benchmark,
        "sample_size": bm.sample_size if bm else 0,
    }
