"""
Admin restaurant management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.restaurant import Restaurant
from backend.deps import require_roles
from backend.core.enums import UserRole
from backend.core.config import DEFAULT_RESTAURANT_ID


router = APIRouter(prefix="/admin/restaurant", tags=["admin:restaurant"])


@router.put("")
def update_restaurant(
    name: str | None = None,
    description: str | None = None,
    address: str | None = None,
    phone: str | None = None,
    opening_hours: str | None = None,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles(UserRole.SYSTEM_ADMIN, UserRole.RESTAURANT_ADMIN)
    ),
):
    """Update restaurant information."""
    r = db.query(Restaurant).filter(Restaurant.id == DEFAULT_RESTAURANT_ID).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if name is not None:
        r.name = name
    if description is not None:
        r.description = description
    if address is not None:
        r.address = address
    if phone is not None:
        r.phone = phone
    if opening_hours is not None:
        r.opening_hours = opening_hours

    db.commit()
    db.refresh(r)

    # Clear cache for get_restaurant_info after update
    from backend.routers.restaurants import clear_restaurant_info_cache

    clear_restaurant_info_cache()

    return {
        "message": "Restaurant updated successfully",
        "id": r.id,
        "name": r.name,
        "description": r.description,
        "address": r.address,
        "phone": r.phone,
        "opening_hours": r.opening_hours,
    }
