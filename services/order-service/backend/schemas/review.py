"""
Review-related Pydantic schemas with validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class ReviewCreate(BaseModel):
    """Review creation request schema."""

    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: str = Field(..., min_length=10, max_length=1000, description="Review text")


class ReviewResponse(BaseModel):
    """Review response schema."""

    id: int
    user_id: int
    order_id: int
    rating: int
    text: str
    created_at: Optional[str] = None

    model_config = {"from_attributes": True}
