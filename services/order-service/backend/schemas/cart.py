"""
Cart-related Pydantic schemas with validation.
"""

from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    """Schema for adding item to cart."""

    menu_item_id: int = Field(..., gt=0, description="Menu item ID")
    quantity: int = Field(..., gt=0, le=100, description="Quantity (1-100)")
    price: int = Field(..., gt=0, description="Price in kopiyky/cents")


class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity."""

    quantity: int = Field(..., gt=0, le=100, description="New quantity (1-100)")
