"""
Security utilities for password hashing and JWT token management.
"""

import hashlib
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

from backend.core.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRES_MINUTES


def hash_password(password: str) -> str:
    """
    Hash a password using SHA256 with salt.

    NOTE: For production, use bcrypt/passlib instead.
    This is a simple implementation for educational purposes.
    """
    # Generate a salt for this password
    salt = os.urandom(32).hex()
    # Hash password with salt
    pwd_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    # Return salt + hash
    return f"{salt}${pwd_hash}"


def verify_password(plain_password: str, stored_password: str) -> bool:
    """
    Verify a password against its stored hash.

    Args:
        plain_password: The plain text password to verify
        stored_password: The stored hash in format 'salt$hash'

    Returns:
        True if password matches, False otherwise
    """
    try:
        # Split stored password into salt and hash
        if "$" not in stored_password:
            # Legacy password without salt (for backwards compatibility)
            return (
                hashlib.sha256(plain_password.encode()).hexdigest() == stored_password
            )

        salt, stored_hash = stored_password.split("$", 1)
        # Hash the provided password with the stored salt
        pwd_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        # Compare hashes
        return pwd_hash == stored_hash
    except Exception:
        return False


def create_access_token(subject: str) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRES_MINUTES)

    to_encode = {"sub": subject, "exp": expire, "iat": datetime.now(timezone.utc)}

    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
