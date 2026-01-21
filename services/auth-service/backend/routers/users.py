"""
User management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.deps import get_current_user
from backend.core.security import hash_password


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
    }


@router.put("/me")
def update_my_profile(
    username: str = None,
    password: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update own profile."""
    if username:
        existing = (
            db.query(User)
            .filter(User.username == username, User.id != current_user.id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = username

    if password:
        current_user.password = hash_password(password)

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated",
        "id": current_user.id,
        "username": current_user.username,
    }


@router.get("/username/{username}")
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    """Get user by username (for inter-service communication)."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "username": user.username, "role": user.role}


@router.get("/{user_id}")
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID (for inter-service communication)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "username": user.username, "role": user.role}
