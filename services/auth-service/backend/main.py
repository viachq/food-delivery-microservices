"""
Auth Service - Main FastAPI application with database initialization.
This service manages only User authentication and authorization.
"""

import traceback
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.database import Base
from backend.database.session import engine, SessionLocal

# Import only User model - this service manages only users
from backend.models.user import User

# Import routers
from backend.routers import (
    auth_register,
    auth_login,
    users as users_router,
    admin_users as admin_users_router,
)

# Create FastAPI application
app = FastAPI(title="Auth Service", version="1.0.0")


def init_db():
    """Initialize database tables for auth-service (only users table)."""
    Base.metadata.create_all(bind=engine)
    print("[OK] Auth service: Database tables created (users)")


def init_default_users():
    """Create default users if they don't exist."""
    from backend.core.enums import UserRole
    from backend.core.security import hash_password

    db: Session = SessionLocal()
    try:
        default_users = [
            {
                "username": "admin",
                "password": "admin",
                "role": UserRole.SYSTEM_ADMIN,
            },
            {
                "username": "restaurant_admin",
                "password": "restaurant_admin",
                "role": UserRole.RESTAURANT_ADMIN,
            },
            {
                "username": "client",
                "password": "client",
                "role": UserRole.CLIENT,
            },
        ]

        for user_data in default_users:
            existing = (
                db.query(User)
                .filter(User.username == user_data["username"])
                .first()
            )

            if existing is None:
                user = User(
                    username=user_data["username"],
                    password=hash_password(user_data["password"]),
                    role=user_data["role"].value,
                )
                db.add(user)
                db.commit()
                db.refresh(user)

                print(
                    "[OK] User created: {username} "
                    "(password: {password}, role: {role})".format(
                        username=user_data["username"],
                        password=user_data["password"],
                        role=user_data["role"].value,
                    )
                )
    finally:
        db.close()



@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    init_db()
    init_default_users()
    print("[OK] Auth service: Startup complete")


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (only auth-related routers for auth-service)
# IMPORTANT: Admin routers must be registered BEFORE public routers
app.include_router(admin_users_router.router)
app.include_router(auth_register.router)
app.include_router(auth_login.router)
app.include_router(users_router.router)


# Health check endpoint
@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "auth-service", "version": "1.0.0"}


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all exceptions and log them."""
    print("=" * 60)
    print("ERROR OCCURRED:")
    print(f"Request: {request.method} {request.url}")
    print(f"Error: {type(exc).__name__}: {str(exc)}")
    print("\nTraceback:")
    traceback.print_exc()
    print("=" * 60)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": str(exc), "type": type(exc).__name__},
    )
