from fastapi import APIRouter
from typing import List
from app.models.item import Item
from app.crud.item import create_item, get_items

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/items", response_model=Item)
def create_item_endpoint(item: Item):
    return create_item(name=item.name, description=item.description)


@router.get("/items", response_model=List[Item])
def list_items():
    return get_items()
