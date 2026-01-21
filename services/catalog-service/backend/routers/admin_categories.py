from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.category import Category
from backend.deps import require_roles
from backend.core.enums import UserRole
from backend.schemas.category import CategoryCreate, CategoryUpdate, CategoryRead


router = APIRouter(prefix="/admin/categories", tags=["admin:categories"])


@router.post("", response_model=CategoryRead)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(UserRole.SYSTEM_ADMIN)),
):
    if db.query(Category).filter(Category.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Category name already exists")
    c = Category(name=payload.name, description=payload.description)
    db.add(c)
    db.commit()
    db.refresh(c)

    # Clear cache for list_categories after create
    from backend.routers.categories import clear_categories_cache

    clear_categories_cache()

    return c


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(UserRole.SYSTEM_ADMIN)),
):
    c = db.query(Category).filter(Category.id == category_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    if payload.name is not None:
        c.name = payload.name
    if payload.description is not None:
        c.description = payload.description
    db.commit()
    db.refresh(c)

    # Clear cache for list_categories after update
    from backend.routers.categories import clear_categories_cache

    clear_categories_cache()

    return c


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(UserRole.SYSTEM_ADMIN)),
):
    c = db.query(Category).filter(Category.id == category_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(c)
    db.commit()

    # Clear cache for list_categories after delete
    from backend.routers.categories import clear_categories_cache

    clear_categories_cache()

    return {"message": "Category deleted"}
