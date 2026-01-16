"""
Order management endpoints.
"""

import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.database import get_db
from backend.models.user import User
from backend.models.order import Order
from backend.models.order_item import OrderItem
from backend.models.cart import Cart
from backend.models.review import Review
from backend.deps import get_current_user
from backend.core.enums import OrderStatus, PaymentMethod
from backend.core.config import DEFAULT_RESTAURANT_ID
from backend.schemas.order import OrderCreate
from backend.schemas.review import ReviewCreate
from backend.services.telegram_notifier import (
    send_new_order_notification,
    send_order_cancelled_notification,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", status_code=201)
async def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new order from cart.

    - Payment method is always CARD (as per requirements)
    - Delivery time is optional (for scheduling future orders)
    - Cart must not be empty
    """
    # Get user's cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Calculate total
    total_price = sum(item.price * item.quantity for item in cart.items)

    # Parse and validate delivery_time if provided
    delivery_datetime = None
    if payload.delivery_time:
        try:
            delivery_datetime = datetime.fromisoformat(
                payload.delivery_time.replace("Z", "+00:00")
            )
            # Validate that delivery time is in the future
            if delivery_datetime <= datetime.utcnow():
                raise HTTPException(
                    status_code=400, detail="Delivery time must be in the future"
                )
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid delivery_time format. Use ISO format (e.g., '2024-12-25T18:00:00')",
            )

    # Create order - payment is ALWAYS card (as per requirements)
    order = Order(
        user_id=current_user.id,
        restaurant_id=DEFAULT_RESTAURANT_ID,  # Single restaurant mode
        delivery_address=payload.address,
        payment_method=PaymentMethod.CARD.value,  # Always card payment
        total_price=total_price,
        delivery_time=delivery_datetime,
        status=OrderStatus.PENDING.value,
    )

    db.add(order)
    db.flush()

    # Create order items
    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=cart_item.menu_item_id,
            quantity=cart_item.quantity,
            price=cart_item.price,
        )
        db.add(order_item)

    # Clear cart
    for item in list(cart.items):
        db.delete(item)

    db.commit()
    db.refresh(order)

    # Send Telegram notification to admins (fire and forget)
    try:
        asyncio.create_task(
            send_new_order_notification(
                order_id=order.id,
                total_price=order.total_price,
                delivery_address=order.delivery_address,
                user_phone=None,
                user_name=current_user.username,
                delivery_time=order.delivery_time,
                items_count=len(order.order_items),
            )
        )
    except Exception:
        pass

    return {
        "message": "Order created",
        "id": order.id,
        "status": order.status,
        "total_price": order.total_price,
        "delivery_address": order.delivery_address,
        "delivery_time": order.delivery_time.isoformat()
        if order.delivery_time
        else None,
        "payment_method": order.payment_method,
    }


@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get order by ID."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden")

    return {
        "id": order.id,
        "user_id": order.user_id,
        "status": order.status,
        "total_price": order.total_price,
        "address": order.delivery_address,
        "delivery_time": order.delivery_time.isoformat()
        if order.delivery_time
        else None,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


@router.get("")
def list_orders(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get my orders."""
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()

    return [
        {
            "id": o.id,
            "status": o.status,
            "total_price": o.total_price,
            "delivery_time": o.delivery_time.isoformat() if o.delivery_time else None,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in orders
    ]


@router.put("/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel an order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden")

    if order.status not in [OrderStatus.PENDING.value, OrderStatus.ACCEPTED.value]:
        raise HTTPException(status_code=400, detail="Cannot cancel this order")

    order.status = OrderStatus.CANCELLED.value
    db.commit()

    # Send cancellation notification to admins (non-blocking)
    try:
        asyncio.create_task(
            send_order_cancelled_notification(
                order_id=order.id, reason="Скасовано клієнтом"
            )
        )
    except Exception:
        pass

    return {"message": "Order cancelled"}


@router.post("/{order_id}/review")
def add_review_to_order(
    order_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add review to a delivered order with validation.

    - Rating must be 1-5
    - Comment must be 10-1000 characters
    - Order must be delivered
    - User must own the order
    """
    # Check order exists and belongs to user
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You can only review your own orders"
        )

    # Check if delivered
    if order.status != OrderStatus.DELIVERED.value:
        raise HTTPException(
            status_code=400, detail="You can only review delivered orders"
        )

    # Check if review already exists
    existing = db.query(Review).filter(Review.order_id == order_id).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Review already exists for this order"
        )

    # Create review (validation is done by Pydantic)
    review = Review(
        order_id=order_id,
        user_id=current_user.id,
        rating=payload.rating,
        text=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return {
        "message": "Review added successfully",
        "review_id": review.id,
        "order_id": order_id,
        "rating": payload.rating,
    }


@router.get("/{order_id}/review")
def get_order_review(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get review for an order."""
    # Check order belongs to user
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access forbidden")

    review = db.query(Review).filter(Review.order_id == order_id).first()
    if not review:
        return {"has_review": False, "order_id": order_id}

    return {
        "has_review": True,
        "id": review.id,
        "rating": review.rating,
        "text": review.text,
        "created_at": review.created_at.isoformat() if review.created_at else None,
    }
