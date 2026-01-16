"""
Payment endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.payment import Payment
from backend.core.enums import PaymentStatus


router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create")
def create_payment(order_id: int, amount: int, db: Session = Depends(get_db)):
    """Create a payment for an order."""
    p = Payment(order_id=order_id, amount=amount, status=PaymentStatus.PENDING.value)
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"payment_id": p.id, "status": p.status, "amount": p.amount}


@router.post("/{payment_id}/confirm")
def confirm_payment(payment_id: int, db: Session = Depends(get_db)):
    """Confirm a payment."""
    p = db.query(Payment).filter(Payment.id == payment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")

    p.status = PaymentStatus.COMPLETED.value
    db.commit()

    return {"payment_id": p.id, "status": p.status}


@router.get("/{payment_id}")
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    """Get payment details."""
    p = db.query(Payment).filter(Payment.id == payment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")

    return {"id": p.id, "order_id": p.order_id, "amount": p.amount, "status": p.status}
