"""
User schemas for request/response validation.
"""

from typing import Optional
from pydantic import BaseModel, Field

from backend.core.enums import UserRole


class UserRead(BaseModel):
    """User response schema."""

    id: int
    username: str
    role: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """User update request schema."""

    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=6, max_length=100)
    role: Optional[UserRole] = None


class UserListResponse(BaseModel):
    """Paginated user list response."""

    users: list[UserRead]
    total: int
    skip: int
    limit: int
