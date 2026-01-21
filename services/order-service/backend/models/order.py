"""
Order model and related database schema.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from backend.database.base import Base
from backend.core.enums import OrderStatus, PaymentMethod


class Order(Base):
    """Order model representing customer orders."""

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # External IDs (no ForeignKey - these reference entities in other services)
    user_id = Column(
        Integer, nullable=False, index=True
    )  # References auth-service users
    restaurant_id = Column(
        Integer, nullable=False, index=True
    )  # References catalog-service restaurant_info
    status = Column(
        String, default=OrderStatus.PENDING.value, nullable=False, index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Order details
    delivery_address = Column(String, nullable=False)
    payment_method = Column(String, default=PaymentMethod.CARD.value, nullable=False)
    total_price = Column(Integer, nullable=False, default=0)  # in cents/kopiyky
    delivery_time = Column(DateTime, nullable=True)
