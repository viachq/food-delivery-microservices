"""
Menu item model and related database schema.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.base import Base


class MenuItem(Base):
    """Menu item model representing dishes from restaurants."""

    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurant_info.id"), nullable=False)
    category_id = Column(
        Integer, ForeignKey("categories.id"), nullable=True, index=True
    )
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Integer, nullable=False)  # in cents/kopiyky
    image_url = Column(String, nullable=True)

    # Relationships
    restaurant = relationship("Restaurant", backref="menu_items")
    category = relationship("Category", backref="menu_items")
