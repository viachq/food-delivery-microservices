"""
Menu endpoints (read-only for public).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.menu_item import MenuItem
from backend.core.config import DEFAULT_RESTAURANT_ID


router = APIRouter(prefix="/menu", tags=["menu"])


@router.get("/")
def get_all_menu_items(
    q: str | None = None, category_id: int | None = None, db: Session = Depends(get_db)
):
    """Get all menu items for the default restaurant (with search and category filter)."""
    # Optimized: Cache menu items when no filters applied (menu changes rarely)
    if not q and category_id is None:
        items = _get_cached_menu_items(db)
    else:
        query = db.query(MenuItem).filter(
            MenuItem.restaurant_id == DEFAULT_RESTAURANT_ID
        )
        if q:
            like = f"%{q}%"
            query = query.filter(MenuItem.name.like(like))
        if category_id is not None:
            query = query.filter(MenuItem.category_id == category_id)
        items = query.all()

    return [
        {
            "id": i.id,
            "name": i.name,
            "description": i.description,
            "price": i.price,
            "category_id": i.category_id,
            "image_url": i.image_url,
        }
        for i in items
    ]


def clear_menu_items_cache():
    """Clear cache for menu items. Call this after creating/updating/deleting menu items."""
    if hasattr(_get_cached_menu_items, "_cache"):
        _get_cached_menu_items._cache = None
        _get_cached_menu_items._cache_time = 0


def _get_cached_menu_items(db: Session):
    """Get menu items with simple in-memory caching (60 second TTL)."""
    # Simple cache: store in function attribute (cleared on service restart)
    if not hasattr(_get_cached_menu_items, "_cache"):
        _get_cached_menu_items._cache = None
        _get_cached_menu_items._cache_time = 0

    import time

    current_time = time.time()
    # Cache for 60 seconds
    if (
        _get_cached_menu_items._cache is None
        or (current_time - _get_cached_menu_items._cache_time) > 60
    ):
        _get_cached_menu_items._cache = (
            db.query(MenuItem)
            .filter(MenuItem.restaurant_id == DEFAULT_RESTAURANT_ID)
            .all()
        )
        _get_cached_menu_items._cache_time = current_time

    return _get_cached_menu_items._cache


@router.get("/{item_id}")
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Get menu item details."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Menu item not found")

    return {
        "id": item.id,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "category_id": item.category_id,
        "image_url": item.image_url,
    }
