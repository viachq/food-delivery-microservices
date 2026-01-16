"""Import all routers."""

from backend.routers import auth_login, auth_register, users, admin_users

__all__ = ["auth_login", "auth_register", "users", "admin_users"]
