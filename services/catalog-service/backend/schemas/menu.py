"""
Menu-related Pydantic schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional


class MenuItemCreate(BaseModel):
    """Menu item creation schema."""

    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: int = Field(..., gt=0, description="Price in kopiyky/cents")
    category_id: Optional[int] = Field(None, description="Category ID")
    image_url: Optional[str] = None


class MenuItemUpdate(BaseModel):
    """Menu item update schema."""

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[int] = Field(None, gt=0)
    category_id: Optional[int] = Field(None, description="Category ID")
    image_url: Optional[str] = None


class MenuItemRead(BaseModel):
    """Menu item response schema."""

    id: int
    name: str
    description: Optional[str]
    price: int
    restaurant_id: int
    category_id: Optional[int]
    image_url: Optional[str]

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    """Category creation schema."""

    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=200)


class CategoryUpdate(BaseModel):
    """Category update schema."""

    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=200)


class CategoryRead(BaseModel):
    """Category response schema."""

    id: int
    name: str
    description: Optional[str]

    model_config = {"from_attributes": True}
