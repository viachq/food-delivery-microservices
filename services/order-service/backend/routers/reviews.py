"""
Review management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.review import Review
from backend.models.order import Order
from backend.models.user import User
from backend.deps import get_current_user
from backend.core.enums import UserRole, OrderStatus
from backend.schemas.review import ReviewCreate


router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/")
def list_all_reviews(restaurant_id: int | None = None, db: Session = Depends(get_db)):
    """
    Get all reviews (public page with all customer feedback).

    Args:
        restaurant_id: Optional filter by restaurant ID (for inter-service communication)
    """
    query = db.query(Review)

    # Filter by restaurant_id if provided
    if restaurant_id is not None:
        # Join with orders to filter by restaurant_id
        query = query.join(Order, Review.order_id == Order.id).filter(
            Order.restaurant_id == restaurant_id
        )

    reviews = query.order_by(Review.created_at.desc()).all()

    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "order_id": r.order_id,
            "rating": r.rating,
            "text": r.text,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reviews
    ]


@router.post("/order/{order_id}")
def create_review_for_order(
    order_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create review for a completed order with validation.

    - Rating must be 1-5 (validated by Pydantic)
    - Comment must be 10-1000 characters (validated by Pydantic)
    - Order must be delivered
    - User must own the order
    """
    # Check if order exists and belongs to user
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You can only review your own orders"
        )

    # Check if order is delivered
    if order.status != OrderStatus.DELIVERED.value:
        raise HTTPException(
            status_code=400, detail="You can only review delivered orders"
        )

    # Check if review already exists for this order
    existing_review = db.query(Review).filter(Review.order_id == order_id).first()
    if existing_review:
        raise HTTPException(
            status_code=400, detail="Review already exists for this order"
        )

    # Create review (validation is done by Pydantic)
    rv = Review(
        order_id=order_id,
        user_id=current_user.id,
        rating=payload.rating,
        text=payload.comment,
    )
    db.add(rv)
    db.commit()
    db.refresh(rv)

    return {
        "message": "Review added successfully",
        "id": rv.id,
        "order_id": rv.order_id,
        "rating": rv.rating,
    }


@router.get("/order/{order_id}")
def get_order_review(order_id: int, db: Session = Depends(get_db)):
    """Get review for a specific order."""
    review = db.query(Review).filter(Review.order_id == order_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="No review found for this order")

    return {
        "id": review.id,
        "user_id": review.user_id,
        "order_id": review.order_id,
        "rating": review.rating,
        "text": review.text,
        "created_at": review.created_at.isoformat() if review.created_at else None,
    }


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete own review."""
    rv = db.query(Review).filter(Review.id == review_id).first()
    if not rv:
        raise HTTPException(status_code=404, detail="Review not found")

    # Users can only delete their own reviews (or admin can delete any)
    if (
        rv.user_id != current_user.id
        and current_user.role != UserRole.SYSTEM_ADMIN.value
    ):
        raise HTTPException(
            status_code=403, detail="You can only delete your own reviews"
        )

    db.delete(rv)
    db.commit()

    return {"message": "Review deleted successfully"}
