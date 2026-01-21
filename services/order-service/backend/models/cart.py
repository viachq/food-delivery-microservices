from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.base import Base


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # External ID (no ForeignKey - references auth-service users)
    user_id = Column(
        Integer, unique=True, nullable=False
    )  # References auth-service users

    items = relationship("CartItem", backref="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cart_id = Column(
        Integer, ForeignKey("carts.id"), nullable=False
    )  # Internal FK to carts
    # External ID (no ForeignKey - references catalog-service menu_items)
    menu_item_id = Column(
        Integer, nullable=False
    )  # References catalog-service menu_items
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Integer, nullable=False)
