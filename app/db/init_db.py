from sqlalchemy.exc import IntegrityError
from app.db.session import engine, SessionLocal
from app.models.base import Base
# Import all models to ensure they are registered on Base.metadata
from app.models.user import User
from app.models.student import Student
from app.models.course import Course
from app.models.achievement import Achievement
from app.models.file import File as FileModel
from app.models.teacher_student import TeacherStudent
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
        # create UIBE student user
        if not db.query(User).filter(User.username == 'UIBE', User.role == 'student').first():
            u = User(username='UIBE', password_hash=get_password_hash('123'), display_name='UIBE学生', role='student', email='student@uibe.edu.cn')
            db.add(u)
            db.commit()
            db.refresh(u)
            s = Student(user_id=u.id, student_id='UIBE001', school='对外经济贸易大学', major='计算机科学与技术')
            db.add(s)
            db.commit()
            logger.info('Created UIBE student user')
        else:
            logger.info('UIBE student already exists')

        # create UIBE staff user
        if not db.query(User).filter(User.username == 'UIBE', User.role == 'staff').first():
            u = User(username='UIBE', password_hash=get_password_hash('123'), display_name='UIBE教师', role='staff', email='staff@uibe.edu.cn')
            db.add(u)
            db.commit()
            logger.info('Created UIBE staff user')
        else:
            logger.info('UIBE staff already exists')
    except IntegrityError:
        db.rollback()
        logger.exception('IntegrityError during DB init')
    finally:
        db.close()


if __name__ == '__main__':
    init_db()
