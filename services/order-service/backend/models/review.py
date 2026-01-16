"""
Review model and related database schema.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from backend.database.base import Base


class Review(Base):
    """Review model for order feedback."""

    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # External ID (no ForeignKey - references auth-service users)
    user_id = Column(
        Integer, nullable=False, index=True
    )  # References auth-service users
    order_id = Column(
        Integer, ForeignKey("orders.id"), nullable=False, unique=True, index=True
    )  # Internal FK to orders
    rating = Column(Integer, nullable=False)  # 1-5
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships (only internal to this service)
    order = relationship("Order", backref="review", uselist=False)  # One-to-one
