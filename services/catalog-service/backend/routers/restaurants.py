"""
Restaurant endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.restaurant import Restaurant
from backend.core.config import DEFAULT_RESTAURANT_ID


router = APIRouter(prefix="/restaurant", tags=["restaurant"])


def clear_restaurant_info_cache():
    """Clear cache for get_restaurant_info. Call this after updating restaurant."""
    if hasattr(get_restaurant_info, "_cache"):
        get_restaurant_info._cache = None
        get_restaurant_info._cache_time = 0


@router.get("/info")
def get_restaurant_info(db: Session = Depends(get_db)):
    """Get information about our restaurant (cached for 1 hour)."""
    # Simple cache for restaurant info (changes very rarely)
    if not hasattr(get_restaurant_info, "_cache"):
        get_restaurant_info._cache = None
        get_restaurant_info._cache_time = 0

    import time

    current_time = time.time()
    # Cache for 1 hour (3600 seconds)
    if (
        get_restaurant_info._cache is None
        or (current_time - get_restaurant_info._cache_time) > 3600
    ):
        r = db.query(Restaurant).filter(Restaurant.id == DEFAULT_RESTAURANT_ID).first()
        if not r:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        get_restaurant_info._cache = {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "address": r.address,
            "phone": r.phone,
            "opening_hours": r.opening_hours,
        }
        get_restaurant_info._cache_time = current_time

    return get_restaurant_info._cache


@router.get("/reviews")
def get_restaurant_reviews(db: Session = Depends(get_db)):
    """Get all reviews for our restaurant (fetches from order-service)."""
    from backend.clients.order_client import get_order_client

    try:
        # Get reviews from order-service via HTTP
        order_client = get_order_client()
        reviews = order_client.get_reviews_by_restaurant(DEFAULT_RESTAURANT_ID)
        return reviews
    except HTTPException:
        # If order-service is unavailable, return empty list
        return []


@router.get("/{restaurant_id}")
def get_restaurant_by_id(restaurant_id: int, db: Session = Depends(get_db)):
    """Get restaurant by ID (for inter-service communication)."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return {
        "id": restaurant.id,
        "name": restaurant.name,
        "description": restaurant.description,
        "address": restaurant.address,
        "phone": restaurant.phone,
        "opening_hours": restaurant.opening_hours,
    }
