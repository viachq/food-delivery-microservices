"""
HTTP client for communicating with Catalog Service.
"""

from typing import Optional
from fastapi import HTTPException
import httpx

from backend.clients.base_client import BaseServiceClient
from backend.core.config import CATALOG_SERVICE_URL


class CatalogServiceClient(BaseServiceClient):
    """Client for Catalog Service API."""

    def __init__(self):
        super().__init__(CATALOG_SERVICE_URL)

    def get_menu_item(self, menu_item_id: int) -> dict:
        """
        Get menu item information by ID.

        Args:
            menu_item_id: Menu item ID

        Returns:
            Menu item data dictionary

        Raises:
            HTTPException: If menu item not found or service unavailable
        """
        try:
            response = self.get(f"/menu/{menu_item_id}")
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Menu item not found")
            raise

    def get_restaurant(self, restaurant_id: int) -> dict:
        """
        Get restaurant information by ID.

        Args:
            restaurant_id: Restaurant ID

        Returns:
            Restaurant data dictionary

        Raises:
            HTTPException: If restaurant not found or service unavailable
        """
        try:
            response = self.get(f"/restaurant/{restaurant_id}")
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Restaurant not found")
            raise

    def validate_menu_item_id(self, menu_item_id: int) -> bool:
        """
        Validate that menu item exists.

        Args:
            menu_item_id: Menu item ID to validate

        Returns:
            True if menu item exists, False otherwise
        """
        try:
            self.get_menu_item(menu_item_id)
            return True
        except HTTPException:
            return False

    def validate_restaurant_id(self, restaurant_id: int) -> bool:
        """
        Validate that restaurant exists.

        Args:
            restaurant_id: Restaurant ID to validate

        Returns:
            True if restaurant exists, False otherwise
        """
        try:
            self.get_restaurant(restaurant_id)
            return True
        except HTTPException:
            return False


# Singleton instance
_catalog_client: Optional[CatalogServiceClient] = None


def get_catalog_client() -> CatalogServiceClient:
    """Get singleton CatalogServiceClient instance."""
    global _catalog_client
    if _catalog_client is None:
        _catalog_client = CatalogServiceClient()
    return _catalog_client
