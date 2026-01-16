"""
HTTP client for communicating with Order Service.
"""

from typing import Optional
import httpx

from backend.clients.base_client import BaseServiceClient
from backend.core.config import ORDER_SERVICE_URL


class OrderServiceClient(BaseServiceClient):
    """Client for Order Service API."""

    def __init__(self):
        super().__init__(ORDER_SERVICE_URL)

    def get_reviews_by_restaurant(self, restaurant_id: int) -> list:
        """
        Get reviews for a restaurant.

        Args:
            restaurant_id: Restaurant ID

        Returns:
            List of reviews

        Raises:
            HTTPException: If service unavailable
        """
        try:
            response = self.get("/reviews", params={"restaurant_id": restaurant_id})
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return []
            raise


# Singleton instance
_order_client: Optional[OrderServiceClient] = None


def get_order_client() -> OrderServiceClient:
    """Get singleton OrderServiceClient instance."""
    global _order_client
    if _order_client is None:
        _order_client = OrderServiceClient()
    return _order_client
