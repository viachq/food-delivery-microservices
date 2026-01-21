"""
Category model and related database schema.
"""

from sqlalchemy import Column, Integer, String
from backend.database.base import Base


class Category(Base):
    """Menu item category model."""

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
