"""
Order item model for database.
"""

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.base import Base


class OrderItem(Base):
    """Order item model representing individual items in an order."""

    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(
        Integer, ForeignKey("orders.id"), nullable=False, index=True
    )  # Internal FK to orders
    # External ID (no ForeignKey - references catalog-service menu_items)
    menu_item_id = Column(
        Integer, nullable=False, index=True
    )  # References catalog-service menu_items
    quantity = Column(Integer, default=1, nullable=False)
    price = Column(Integer, nullable=False)  # Price at time of order (in cents/kopiyky)

    # Relationships (only internal to this service)
    order = relationship("Order", backref="order_items")
