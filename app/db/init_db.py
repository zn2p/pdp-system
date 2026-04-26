from sqlalchemy.exc import IntegrityError
from app.db.session import engine, SessionLocal
from app.models.base import Base
# Import all models to ensure they are registered on Base.metadata
from app.models.user import User
from app.models.student import Student
from app.models.course import Course
from app.models.achievement import Achievement
from app.models.file import File as FileModel
from app.core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def init_db():
    # show registered tables before create
    logger.info("Registered tables before create_all: %s", list(Base.metadata.tables.keys()))
    Base.metadata.create_all(bind=engine)
    logger.info("Called create_all on engine: %s", engine)
    logger.info("Registered tables after create_all: %s", list(Base.metadata.tables.keys()))
    db = SessionLocal()
    try:
        # create demo user if not exists
        if not db.query(User).filter(User.username == 'student').first():
            u = User(username='student', password_hash=get_password_hash('123'), display_name='学生示例', role='student', email='student@example.com')
            db.add(u)
            db.commit()
            db.refresh(u)
            s = Student(user_id=u.id, student_id='2024001', school='示例大学', major='计算机')
            db.add(s)
            db.commit()
            logger.info('Demo user and student created: %s', u.username)
        else:
            logger.info('Demo user already exists')
    except IntegrityError:
        db.rollback()
        logger.exception('IntegrityError during DB init')
    finally:
        db.close()


if __name__ == '__main__':
    init_db()
