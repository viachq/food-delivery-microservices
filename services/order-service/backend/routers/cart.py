"""
Cart management endpoints with authentication.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.cart import Cart, CartItem
from backend.models.user import User
from backend.deps import get_current_user
from backend.schemas.cart import CartItemAdd, CartItemUpdate


router = APIRouter(prefix="/cart", tags=["cart"])


def _get_or_create_cart(db: Session, user_id: int) -> Cart:
    """Get or create cart for a user."""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


@router.get("/me")
def get_cart(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get current user's cart."""
    cart = _get_or_create_cart(db, current_user.id)
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": [
            {
                "id": i.id,
                "menu_item_id": i.menu_item_id,
                "quantity": i.quantity,
                "price": i.price,
            }
            for i in cart.items
        ],
    }


@router.post("/me/items")
def add_item(
    payload: CartItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add item to current user's cart with validation."""
    cart = _get_or_create_cart(db, current_user.id)
    ci = CartItem(
        cart_id=cart.id,
        menu_item_id=payload.menu_item_id,
        quantity=payload.quantity,
        price=payload.price,
    )
    db.add(ci)
    db.commit()
    db.refresh(ci)
    return {"message": "Item added", "id": ci.id}


@router.put("/me/items/{cart_item_id}")
def set_qty(
    cart_item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update quantity of item in current user's cart with validation."""
    cart = _get_or_create_cart(db, current_user.id)
    ci = next((i for i in cart.items if i.id == cart_item_id), None)
    if not ci:
        raise HTTPException(status_code=404, detail="Cart item not found")
    ci.quantity = payload.quantity
    db.commit()
    return {"message": "Quantity updated"}


@router.delete("/me/items/{cart_item_id}")
def remove_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove item from current user's cart."""
    cart = _get_or_create_cart(db, current_user.id)
    ci = next((i for i in cart.items if i.id == cart_item_id), None)
    if not ci:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(ci)
    db.commit()
    return {"message": "Item removed"}


@router.delete("/me")
def clear_cart(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Clear all items from current user's cart."""
    cart = _get_or_create_cart(db, current_user.id)
    for ci in list(cart.items):
        db.delete(ci)
    db.commit()
    return {"message": "Cart cleared"}
