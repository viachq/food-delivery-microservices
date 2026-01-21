"""
User model for catalog-service (read-only, data comes from auth-service via HTTP).
This is a simple data class, not a database model.
"""

from dataclasses import dataclass


@dataclass
class User:
    """User data class (data comes from auth-service)."""

    id: int
    username: str
    role: str

    @classmethod
    def from_dict(cls, data: dict) -> "User":
        """Create User from dictionary (from auth-service API response)."""
        return cls(id=data["id"], username=data["username"], role=data["role"])
