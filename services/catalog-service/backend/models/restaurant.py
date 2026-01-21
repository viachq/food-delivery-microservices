"""
Restaurant model and related database schema.
"""

from sqlalchemy import Column, Integer, String, Text
from backend.database.base import Base


class Restaurant(Base):
    """Restaurant information model."""

    __tablename__ = "restaurant_info"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    opening_hours = Column(String, nullable=True)
