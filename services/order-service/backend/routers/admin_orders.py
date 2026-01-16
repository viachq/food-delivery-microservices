from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.order import Order
from backend.deps import require_roles
from backend.core.enums import UserRole
from backend.core.config import DEFAULT_RESTAURANT_ID


router = APIRouter(prefix="/admin/orders", tags=["admin:orders"])


@router.get("")
def list_orders(
    status: str | None = None,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles(UserRole.SYSTEM_ADMIN, UserRole.RESTAURANT_ADMIN)
    ),
):
    """Get all orders for default restaurant (admin only)."""
    q = db.query(Order).filter(Order.restaurant_id == DEFAULT_RESTAURANT_ID)

    if status is not None:
        q = q.filter(Order.status == status)

    orders = q.all()
    return [
        {
            "id": o.id,
            "user_id": o.user_id,
            "status": o.status,
            "total_price": o.total_price,
            "delivery_address": o.delivery_address,
            "delivery_time": o.delivery_time.isoformat() if o.delivery_time else None,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in orders
    ]


@router.get("/{order_id}")
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles(UserRole.SYSTEM_ADMIN, UserRole.RESTAURANT_ADMIN)
    ),
):
    """Get detailed order information including order items (admin only)."""
    from backend.models.order_item import OrderItem
    from backend.clients.catalog_client import get_catalog_client

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Get order items from local DB
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()

    # Get menu item names from catalog-service via HTTP
    catalog_client = get_catalog_client()
    items_data = []
    for item in order_items:
        menu_item_name = "Unknown"
        try:
            menu_item = catalog_client.get_menu_item(item.menu_item_id)
            menu_item_name = menu_item.get("name", "Unknown")
        except HTTPException:
            pass  # Keep "Unknown" if menu item not found

        items_data.append(
            {
                "id": item.id,
                "menu_item_id": item.menu_item_id,
                "menu_item_name": menu_item_name,
                "quantity": item.quantity,
                "price": item.price,
                "subtotal": item.price * item.quantity,
            }
        )

    return {
        "id": order.id,
        "user_id": order.user_id,
        "restaurant_id": order.restaurant_id,
        "status": order.status,
        "delivery_address": order.delivery_address,
        "payment_method": order.payment_method,
        "total_price": order.total_price,
        "delivery_time": order.delivery_time.isoformat()
        if order.delivery_time
        else None,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        "items": items_data,
    }


@router.put("/{order_id}/status")
def set_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles(UserRole.SYSTEM_ADMIN, UserRole.RESTAURANT_ADMIN)
    ),
):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    o.status = status
    db.commit()
    return {"message": "Status updated"}


@router.put("/{order_id}/assign-courier")
def assign_courier(
    order_id: int,
    courier_id: int,
    _: object = Depends(
        require_roles(UserRole.SYSTEM_ADMIN, UserRole.RESTAURANT_ADMIN)
    ),
):
    # stub
    return {
        "message": "Courier assigned",
        "order_id": order_id,
        "courier_id": courier_id,
    }


@router.put("/{order_id}")
def update_order_fields(
    order_id: int,
    address: str | None = None,
    operator_comment: str | None = None,
    db: Session = Depends(get_db),
    _: object = Depends(
        require_roles(UserRole.SYSTEM_ADMIN, UserRole.RESTAURANT_ADMIN)
    ),
):
    o = db.query(Order).filter(Order.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")
    if address is not None:
        o.delivery_address = address
    # operator_comment is not stored yet; stub
    db.commit()
    return {"message": "Order updated"}
