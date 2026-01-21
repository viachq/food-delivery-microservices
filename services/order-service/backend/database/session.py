from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from backend.core.config import DATABASE_URL


# Optimized: Add connection pooling for better performance with concurrent requests
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False, "timeout": 30},
        pool_pre_ping=True,
        pool_size=10,  # Connection pool size for concurrent requests
        max_overflow=20,  # Additional connections beyond pool_size
        pool_recycle=3600,  # Recycle connections after 1 hour
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=20,
        max_overflow=40,
    )

# Enable WAL mode for better concurrency with SQLite
if DATABASE_URL.startswith("sqlite"):
    with engine.connect() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL"))
        conn.commit()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
