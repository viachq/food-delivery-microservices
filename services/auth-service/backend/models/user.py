"""
User model and related database schema.
"""

from sqlalchemy import Column, Integer, String
from backend.database.base import Base
from backend.core.enums import UserRole


class User(Base):
    """User account model with role-based access control."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default=UserRole.CLIENT.value, nullable=False, index=True)
