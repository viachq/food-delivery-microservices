"""
Legacy module kept for backward compatibility. Prefer imports from `backend.database`.
"""

from backend.database.base import Base  # noqa: F401
from backend.database.session import engine, SessionLocal, get_db  # noqa: F401
