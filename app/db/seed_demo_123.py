"""
演示数据种子脚本 - 用户 123 (陈雨晴 · 国贸专业 · 求职路线)

用法:
    .venv311\Scripts\python.exe -m app.db.seed_demo_123

幂等:重复运行会先清空 123 账号下的旧课程/成就/学生信息再重新录入。
不会影响 UIBE 账号的数据。
"""
from sqlalchemy.exc import IntegrityError
from app.db.session import SessionLocal
from app.models.user import User
from app.models.student import Student
from app.models.course import Course
from app.models.achievement import Achievement
from app.models.benchmark import Benchmark
from app.core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(message)s")


# ============ 演示数据定义 ============

USER_INFO = {
    "username": "123",
    "password": "123",
    "display_name": "陈雨晴",
    "role": "student",
    "email": "chenyq@uibe.edu.cn",
}

STUDENT_INFO = {
    "student_id": "UIBE2024",
    "school": "对外经济贸易大学",
    "major": "国际经济与贸易",
    "degree": "本科",
    "grad_year": "2026",
    "phone": "159-8866-1024",
    "email": "chenyq@uibe.edu.cn",
    "job_target": "投行分析师 / 战略咨询顾问",
    "skill_tags": "英语(雅思 7.5),Excel,Python,SQL,财务建模,PPT",
}

COURSES = [
    {"name": "微观经济学",      "code": "ECO101",  "semester": "2024-春", "credit": 4.0, "grade": 94, "teacher": "林教授",   "note": "核心"},
    {"name": "宏观经济学",      "code": "ECO102",  "semester": "2024-秋", "credit": 4.0, "grade": 91, "teacher": "朱教授",   "note": "核心"},
    {"name": "国际贸易实务",    "code": "INT201",  "semester": "2024-秋", "credit": 3.5, "grade": 96, "teacher": "黄教授",   "note": "核心"},
    {"name": "计量经济学",      "code": "ECO301",  "semester": "2025-春", "credit": 4.0, "grade": 89, "teacher": "杨教授",   "note": "核心"},
    {"name": "财务管理",        "code": "FIN201",  "semester": "2025-春", "credit": 3.0, "grade": 92, "teacher": "韩教授",   "note": "核心"},
    {"name": "商务英语",        "code": "ENG301",  "semester": "2025-秋", "credit": 3.0, "grade": 95, "teacher": "Smith",    "note": "优势"},
    {"name": "软件体系结构",    "code": "CS401",   "semester": "2025-秋", "credit": 3.0, "grade": 86, "teacher": "周教授",   "note": "本课"},
    {"name": "数据分析与可视化", "code": "CS205",   "semester": "2025-春", "credit": 2.5, "grade": 88, "teacher": "吴教授",   "note": "跨专业"},
]

ACHIEVEMENTS = [
    {
        "name": "全国大学生市场营销大赛",
        "type": "竞赛获奖",
        "date": "2025-05",
        "org": "中国高等教育学会市场学专业委员会",
        "level": "全国一等奖",
        "description": "担任 5 人团队队长,围绕'新消费品牌出海东南亚'主题完成市场调研、策略方案与现场答辩,从 800 余支队伍中脱颖而出。",
        "tags": "商业策划,团队领导,国家级",
    },
    {
        "name": "'挑战杯'全国大学生创业计划竞赛",
        "type": "竞赛获奖",
        "date": "2024-11",
        "org": "共青团中央",
        "level": "北京赛区银奖",
        "description": "提交跨境电商代运营 SaaS 项目商业计划书,负责财务模型测算与盈利预测,5 年期 NPV 测算获评委高度认可。",
        "tags": "创业大赛,商业计划,财务建模",
    },
    {
        "name": "'一带一路'沿线国家贸易壁垒研究",
        "type": "项目经历",
        "date": "2024-10 ~ 2025-04",
        "org": "对外经济贸易大学 大学生创新创业训练计划",
        "level": "国家级立项",
        "description": "担任项目负责人,采用引力模型分析 13 个国家近 10 年贸易数据,产出研究报告 4 万字,论文获校级优秀本科生科研论文奖。",
        "tags": "学术研究,计量分析,国家级立项",
    },
    {
        "name": "中金公司 投资银行部 暑期实习生",
        "type": "实习经历",
        "date": "2025-06 ~ 2025-08",
        "org": "中国国际金融股份有限公司",
        "level": "Top 投行暑期实习",
        "description": "参与新能源汽车行业 IPO 项目,协助完成行业研究报告、可比公司估值模型(P/E、DCF)与招股说明书部分章节撰写,实习期内完整经历 1 个项目立项到反馈意见提交全流程。",
        "tags": "投行,IPO,估值建模,Top 实习",
    },
    {
        "name": "CFA 一级 通过",
        "type": "证书",
        "date": "2025-08",
        "org": "CFA Institute",
        "level": "高分通过(>90 percentile)",
        "description": "涵盖职业道德、定量分析、经济学、财报分析、公司金融、投资组合管理等十大模块,备考期 6 个月。同时持有雅思 7.5 与 BEC 高级证书。",
        "tags": "国际证书,金融,高分通过",
    },
    {
        "name": "校级三好学生 + 国家奖学金",
        "type": "奖项荣誉",
        "date": "2024-12",
        "org": "教育部 / 对外经济贸易大学",
        "level": "国家级",
        "description": "综合 GPA 排名专业前 3%、社会实践、学生工作三项评定通过。同时担任校学生会外联部部长。",
        "tags": "国奖,三好生,学生工作",
    },
]

BENCHMARK = {
    "group_name": "国际经济与贸易",
    "time_range": "全部",
    "gpa_avg": 3.45,
    "course_count_avg": 7.0,
    "competition_count_avg": 0.9,
    "internship_count_avg": 0.6,
    "award_count_avg": 0.8,
    "cert_count_avg": 1.0,
    "sample_size": 320,
}


# ============ 主流程 ============

def seed():
    db = SessionLocal()
    try:
        # 1. 用户 (username='123', role='student')
        user = db.query(User).filter(
            User.username == USER_INFO["username"],
            User.role == USER_INFO["role"],
        ).first()
        if not user:
            user = User(
                username=USER_INFO["username"],
                password_hash=get_password_hash(USER_INFO["password"]),
                display_name=USER_INFO["display_name"],
                role=USER_INFO["role"],
                email=USER_INFO["email"],
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("✓ 已创建用户 123 (陈雨晴)")
        else:
            # 更新 display_name / email,但保留密码
            user.display_name = USER_INFO["display_name"]
            user.email = USER_INFO["email"]
            db.commit()
            logger.info("✓ 用户 123 已存在,已刷新基本信息")

        # 2. 学生档案
        student = db.query(Student).filter(Student.user_id == user.id).first()
        if not student:
            student = Student(user_id=user.id, **STUDENT_INFO)
            db.add(student)
            db.commit()
            db.refresh(student)
            logger.info("✓ 已创建学生档案 (UIBE2024)")
        else:
            for k, v in STUDENT_INFO.items():
                setattr(student, k, v)
            db.commit()
            logger.info("✓ 学生档案已存在,已刷新字段")

        # 3. 清空旧课程 / 成就(仅 123 账号下),重新录入
        db.query(Course).filter(Course.student_id == student.id).delete()
        db.query(Achievement).filter(Achievement.student_id == student.id).delete()
        db.commit()

        for c in COURSES:
            db.add(Course(student_id=student.id, **c))
        db.commit()
        logger.info("✓ 已录入 %d 门课程", len(COURSES))

        for a in ACHIEVEMENTS:
            db.add(Achievement(student_id=student.id, **a))
        db.commit()
        logger.info("✓ 已录入 %d 条成就", len(ACHIEVEMENTS))

        # 4. 基准数据(国际经济与贸易专业)
        bm = db.query(Benchmark).filter(
            Benchmark.group_name == BENCHMARK["group_name"]
        ).first()
        if not bm:
            db.add(Benchmark(**BENCHMARK))
            logger.info("✓ 已录入国贸专业基准数据")
        else:
            for k, v in BENCHMARK.items():
                setattr(bm, k, v)
            logger.info("✓ 国贸专业基准已存在,已刷新")
        db.commit()

        # 5. 摘要
        gpa = sum(c["grade"] * c["credit"] for c in COURSES) / sum(c["credit"] for c in COURSES)
        gpa_4 = (gpa - 50) / 10  # 简化的 4 分制估算
        logger.info("")
        logger.info("============================================")
        logger.info("  演示账号:陈雨晴")
        logger.info("  登录:123 / 123  (role=student)")
        logger.info("  专业:国际经济与贸易")
        logger.info("  课程平均分:%.2f (≈4 分制 GPA %.2f)", gpa, gpa_4)
        logger.info("  课程数:%d   成就数:%d", len(COURSES), len(ACHIEVEMENTS))
        logger.info("============================================")

    except IntegrityError:
        db.rollback()
        logger.exception("IntegrityError during seeding")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
