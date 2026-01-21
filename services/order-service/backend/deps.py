"""
Dependency injection functions for FastAPI endpoints.
"""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.core.security import decode_token
from backend.models.user import User
from backend.core.enums import UserRole
from backend.clients.auth_client import get_auth_client


auth_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(auth_scheme),
) -> User:
    """Get the current authenticated user from JWT token via auth-service."""
    if creds is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token_data = decode_token(creds.credentials)
    if not token_data or "sub" not in token_data:
        raise HTTPException(status_code=401, detail="Invalid token")

    username = token_data["sub"]

    # Get user from auth-service via HTTP
    auth_client = get_auth_client()
    try:
        user_data = auth_client.get_user_by_username(username)
        return User.from_dict(user_data)
    except HTTPException as e:
        if e.status_code == 404:
            raise HTTPException(status_code=401, detail="User not found")
        raise


def require_roles(*allowed_roles: UserRole):
    """Role-based access control."""

    def role_checker(user: User = Depends(get_current_user)) -> User:
        if allowed_roles and user.role not in [role.value for role in allowed_roles]:
            raise HTTPException(status_code=403, detail="Access forbidden")
        return user

    return role_checker
