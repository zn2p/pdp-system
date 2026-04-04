from sqlmodel import Session, select
from app.models.item import Item
from app.db.session import engine


def create_item(name: str, description: str | None = None) -> Item:
    with Session(engine) as session:
        item = Item(name=name, description=description)
        session.add(item)
        session.commit()
        session.refresh(item)
        return item


def get_items() -> list[Item]:
    with Session(engine) as session:
        statement = select(Item)
        return session.exec(statement).all()
