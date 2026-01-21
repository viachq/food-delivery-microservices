"""
Order-related Pydantic schemas with validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class OrderCreate(BaseModel):
    """Order creation request schema."""

    address: str = Field(
        ..., min_length=5, max_length=200, description="Delivery address"
    )
    delivery_time: Optional[str] = Field(
        None, description="Desired delivery time in ISO format"
    )


class OrderResponse(BaseModel):
    """Order response schema."""

    id: int
    status: str
    total_price: int
    delivery_address: str
    delivery_time: Optional[str] = None
    created_at: Optional[str] = None
    payment_method: str

    model_config = {"from_attributes": True}
