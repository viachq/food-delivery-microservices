"""
Auth Service configuration settings.
"""

import os
from pathlib import Path

# Database URL - окрема база для auth-service
# Підтримка Docker (через environment variable) та локальної розробки
if os.getenv("DATABASE_URL"):
    DATABASE_URL = os.getenv("DATABASE_URL")
else:
    # Локальна розробка: auth-service/backend/core/config.py → (4 рівні вгору) → food-delivery/auth.db
    project_root = Path(__file__).resolve().parents[4]
    db_path = project_root / "auth.db"
    DATABASE_URL = f"sqlite:///{db_path.as_posix()}"

    # Створити директорію для БД якщо не існує (для Docker)
    db_dir = db_path.parent
    if not db_dir.exists():
        db_dir.mkdir(parents=True, exist_ok=True)

# JWT Settings - однаковий ключ для всіх мікросервісів
JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "ippt-project-dev-secret-key-fixed-for-local-development-2024"
)
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = 10080  # 7 days

# Single Restaurant Mode
DEFAULT_RESTAURANT_ID = 1

# Service Configuration
SERVICE_NAME = "auth-service"
SERVICE_PORT = 8001

# Telegram Bot Settings (для рідкого використання з auth-service)
TELEGRAM_BOT_TOKEN = "8322734845:AAGQDbGSboYa9qP5G6H-omfAnnPL0GDiwQE"
TELEGRAM_ADMIN_CHAT_IDS = [827612750]
TELEGRAM_NOTIFICATIONS_ENABLED = True
