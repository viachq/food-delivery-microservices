"""
Security utilities for JWT token validation (Catalog Service).
"""

from typing import Optional

from jose import JWTError, jwt

from backend.core.config import JWT_SECRET_KEY, JWT_ALGORITHM


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
