"""
Admin statistics endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from collections import Counter

from backend.database import get_db
from backend.models.order import Order
from backend.models.order_item import OrderItem
from backend.core.config import DEFAULT_RESTAURANT_ID
from backend.clients.catalog_client import get_catalog_client


router = APIRouter(prefix="/admin/stats", tags=["admin:stats"])


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    """Statistics for default restaurant."""
    # All orders for default restaurant
    orders = db.query(Order).filter(Order.restaurant_id == DEFAULT_RESTAURANT_ID).all()
    orders_count = len(orders)
    revenue = sum(o.total_price for o in orders)

    # Average order value
    average_order = revenue // orders_count if orders_count > 0 else 0

    # Active orders (not delivered or cancelled)
    active_statuses = ["pending", "accepted", "preparing", "ready", "delivering"]
    active_orders = (
        db.query(Order)
        .filter(Order.restaurant_id == DEFAULT_RESTAURANT_ID)
        .filter(Order.status.in_(active_statuses))
        .count()
    )

    # Top items by popularity (most ordered) - calculate from order_items
    order_items = (
        db.query(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(Order.restaurant_id == DEFAULT_RESTAURANT_ID)
        .all()
    )

    # Count orders and quantities per menu_item_id
    item_order_count = Counter()
    item_quantity_sum = Counter()
    for item in order_items:
        item_order_count[item.menu_item_id] += 1
        item_quantity_sum[item.menu_item_id] += item.quantity

    # Get top 5 menu items by order count
    top_menu_item_ids = [item_id for item_id, _ in item_order_count.most_common(5)]

    # Get menu item names from catalog-service
    catalog_client = get_catalog_client()
    top_items = []
    for menu_item_id in top_menu_item_ids:
        try:
            menu_item = catalog_client.get_menu_item(menu_item_id)
            top_items.append(
                {
                    "id": menu_item_id,
                    "name": menu_item.get("name", "Unknown"),
                    "orders": item_order_count[menu_item_id],
                    "sold": item_quantity_sum[menu_item_id],
                }
            )
        except HTTPException:
            # Skip if menu item not found
            pass

    return {
        "orders": orders_count,
        "revenue": revenue,
        "average_order": average_order,
        "active_orders": active_orders,
        "menu_items_count": None,  # Not available without direct DB access
        "top_items": top_items,
    }


@router.get("/orders-by-day")
def orders_by_day(db: Session = Depends(get_db)):
    """Get orders count for last 7 days."""
    from datetime import datetime, timedelta

    today = datetime.utcnow().date()
    data = []

    for i in range(6, -1, -1):  # Last 7 days (from 6 days ago to today)
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())

        count = (
            db.query(Order)
            .filter(Order.restaurant_id == DEFAULT_RESTAURANT_ID)
            .filter(Order.created_at >= day_start)
            .filter(Order.created_at <= day_end)
            .count()
        )

        data.append({"date": day.strftime("%d/%m"), "orders": count})

    return data
