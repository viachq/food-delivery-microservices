"""
Admin user management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.core.enums import UserRole
from backend.deps import require_roles


router = APIRouter(prefix="/admin/users", tags=["admin:users"])


@router.put("/{user_id}/role")
def change_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(UserRole.SYSTEM_ADMIN)),
):
    """Change user role (system admin only)."""
    # Find user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate and set role
    try:
        new_role = UserRole(role)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}",
        )

    user.role = new_role.value
    db.commit()
    db.refresh(user)

    return {
        "message": "Role updated successfully",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
    }


@router.get("/")
def get_all_users(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles(UserRole.SYSTEM_ADMIN)),
):
    """Get all users (admin only)."""
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "role": u.role} for u in users]
