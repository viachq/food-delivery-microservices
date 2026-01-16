"""
Category-related Pydantic schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional


class CategoryCreate(BaseModel):
    """Category creation schema."""

    name: str = Field(..., min_length=2, max_length=50, description="Category name")
    description: Optional[str] = Field(
        None, max_length=200, description="Category description"
    )


class CategoryUpdate(BaseModel):
    """Category update schema."""

    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=200)


class CategoryRead(BaseModel):
    """Category response schema."""

    id: int
    name: str
    description: Optional[str]

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "examples": [
                {"id": 1, "name": "Pizza", "description": "Italian pizza variations"}
            ]
        },
    }
