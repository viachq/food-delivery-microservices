"""
HTTP client for communicating with Auth Service.
"""

from typing import Optional
from fastapi import HTTPException
import httpx

from backend.clients.base_client import BaseServiceClient
from backend.core.config import AUTH_SERVICE_URL


class AuthServiceClient(BaseServiceClient):
    """Client for Auth Service API."""

    def __init__(self):
        super().__init__(AUTH_SERVICE_URL)

    def get_user_by_id(self, user_id: int) -> dict:
        """
        Get user information by ID.

        Args:
            user_id: User ID

        Returns:
            User data dictionary

        Raises:
            HTTPException: If user not found or service unavailable
        """
        try:
            response = self.get(f"/users/{user_id}")
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="User not found")
            raise

    def get_user_by_username(self, username: str) -> dict:
        """
        Get user information by username.

        Args:
            username: Username

        Returns:
            User data dictionary

        Raises:
            HTTPException: If user not found or service unavailable
        """
        try:
            response = self.get(f"/users/username/{username}")
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="User not found")
            raise

    def validate_user_id(self, user_id: int) -> bool:
        """
        Validate that user exists.

        Args:
            user_id: User ID to validate

        Returns:
            True if user exists, False otherwise
        """
        try:
            self.get_user_by_id(user_id)
            return True
        except HTTPException:
            return False


# Singleton instance
_auth_client: Optional[AuthServiceClient] = None


def get_auth_client() -> AuthServiceClient:
    """Get singleton AuthServiceClient instance."""
    global _auth_client
    if _auth_client is None:
        _auth_client = AuthServiceClient()
    return _auth_client
