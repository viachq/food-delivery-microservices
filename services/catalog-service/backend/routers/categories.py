from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.category import Category


router = APIRouter(prefix="/categories", tags=["categories"])


def clear_categories_cache():
    """Clear cache for list_categories. Call this after creating/updating/deleting categories."""
    if hasattr(list_categories, "_cache"):
        list_categories._cache = None
        list_categories._cache_time = 0


@router.get("/")
def list_categories(db: Session = Depends(get_db)):
    """Get all categories (cached for 5 minutes)."""
    # Simple cache for categories (they change rarely)
    if not hasattr(list_categories, "_cache"):
        list_categories._cache = None
        list_categories._cache_time = 0

    import time

    current_time = time.time()
    # Cache for 5 minutes (300 seconds)
    if (
        list_categories._cache is None
        or (current_time - list_categories._cache_time) > 300
    ):
        list_categories._cache = db.query(Category).all()
        list_categories._cache_time = current_time

    cats = list_categories._cache
    return [{"id": c.id, "name": c.name, "description": c.description} for c in cats]


@router.get("/{category_id}")
def get_category(category_id: int, db: Session = Depends(get_db)):
    c = db.query(Category).filter(Category.id == category_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"id": c.id, "name": c.name, "description": c.description}


# Removed - MenuItem doesn't have category_id in simplified version
# @router.get("/{category_id}/items")
# def get_category_items(category_id: int, db: Session = Depends(get_db)):
#     # This endpoint is disabled in single-restaurant mode
#     pass
