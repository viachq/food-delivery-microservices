"""
Order Service - Cart, Orders, Payments, Reviews, and Statistics.
This service manages only Order, OrderItem, Payment, Review, and Cart entities.
"""

import traceback
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.database import Base
from backend.database.session import engine

# Import only models managed by this service

# Import routers
from backend.routers import (
    cart,
    orders,
    admin_orders,
    payments,
    reviews,
    admin_stats,
)

# Create FastAPI application
app = FastAPI(
    title="Order Service",
    version="1.0.0",
    description="Cart, Orders, Payments, Reviews, and Statistics",
)


def init_db():
    """Initialize database tables for order-service (orders, order_items, payments, reviews, carts, cart_items)."""
    Base.metadata.create_all(bind=engine)
    print(
        "[OK] Order service: Database tables created (orders, order_items, payments, reviews, carts, cart_items)"
    )


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    init_db()
    print("[OK] Order service: Startup complete")


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# IMPORTANT: Admin routers must be registered BEFORE public routers
# to avoid path conflicts (e.g., /admin/orders/{id} vs /orders/{id})
app.include_router(admin_orders.router)
app.include_router(admin_stats.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(reviews.router)


# Health check endpoint
@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "order-service", "version": "1.0.0"}


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
