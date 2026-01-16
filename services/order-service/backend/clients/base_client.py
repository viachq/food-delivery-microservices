"""
Base HTTP client with retry logic for inter-service communication.
Supports both sync and async operations.
"""

import httpx
from fastapi import HTTPException


class BaseServiceClient:
    """Base HTTP client for communicating with other microservices."""

    def __init__(self, base_url: str, timeout: float = 5.0, max_retries: int = 3):
        """
        Initialize the HTTP client.

        Args:
            base_url: Base URL of the target service
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
        """
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        # Use sync client for compatibility with sync routes
        self.client = httpx.Client(
            base_url=self.base_url, timeout=timeout, follow_redirects=True
        )

    def _request(self, method: str, path: str, **kwargs) -> httpx.Response:
        """
        Make HTTP request with retry logic (synchronous).

        Args:
            method: HTTP method (GET, POST, etc.)
            path: API path (without base URL)
            **kwargs: Additional arguments for httpx request

        Returns:
            httpx.Response object

        Raises:
            HTTPException: If request fails after retries
        """
        path = path.lstrip("/")
        url = f"{self.base_url}/{path}"

        for attempt in range(self.max_retries):
            try:
                response = self.client.request(method, url, **kwargs)
                response.raise_for_status()
                return response
            except httpx.HTTPStatusError as e:
                # Don't retry on client errors (4xx)
                if 400 <= e.response.status_code < 500:
                    raise HTTPException(
                        status_code=e.response.status_code,
                        detail=f"Service error: {e.response.text}",
                    )
            except (httpx.TimeoutException, httpx.ConnectError):
                if attempt < self.max_retries - 1:
                    continue  # Retry on network errors

        # All retries failed
        raise HTTPException(
            status_code=503,
            detail=f"Service unavailable after {self.max_retries} attempts",
        )

    def get(self, path: str, **kwargs) -> httpx.Response:
        """Make GET request."""
        return self._request("GET", path, **kwargs)

    def post(self, path: str, **kwargs) -> httpx.Response:
        """Make POST request."""
        return self._request("POST", path, **kwargs)

    def put(self, path: str, **kwargs) -> httpx.Response:
        """Make PUT request."""
        return self._request("PUT", path, **kwargs)

    def delete(self, path: str, **kwargs) -> httpx.Response:
        """Make DELETE request."""
        return self._request("DELETE", path, **kwargs)

    def close(self):
        """Close the HTTP client."""
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
