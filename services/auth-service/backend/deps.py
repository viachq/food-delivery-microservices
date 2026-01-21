"""
Dependency injection functions for FastAPI endpoints.
"""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.core.security import decode_token
from backend.models.user import User
from backend.core.enums import UserRole


auth_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(auth_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Get the current authenticated user from JWT token."""
    if creds is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token_data = decode_token(creds.credentials)
    if not token_data or "sub" not in token_data:
        raise HTTPException(status_code=401, detail="Invalid token")

    username = token_data["sub"]
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def require_roles(*allowed_roles: UserRole):
    """Role-based access control."""

    def role_checker(user: User = Depends(get_current_user)) -> User:
        if allowed_roles and user.role not in [role.value for role in allowed_roles]:
            raise HTTPException(status_code=403, detail="Access forbidden")
        return user

    return role_checker
