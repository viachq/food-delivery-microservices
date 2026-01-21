"""
Pytest fixtures and configuration for auth-service tests.
"""


import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# ------------------------------------------------------------------
# BACKEND IMPORTS
# ------------------------------------------------------------------
from backend.database.base import Base
from backend.database import get_db
from backend.main import app
from backend.models.user import User
from backend.core.security import hash_password, create_access_token
from backend.core.enums import UserRole

# ------------------------------------------------------------------
# TEST DATABASE
# ------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite:///./test.db"


@pytest.fixture(scope="function")
def test_engine():
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def test_db(test_engine):
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine,
    )
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(test_db):
    def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(test_db):
    user = User(
        username="testuser",
        password=hash_password("testpass123"),
        role=UserRole.CLIENT.value,
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_admin(test_db):
    admin = User(
        username="adminuser",
        password=hash_password("adminpass123"),
        role=UserRole.SYSTEM_ADMIN.value,
    )
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    return admin


@pytest.fixture(scope="function")
def test_restaurant_admin(test_db):
    admin = User(
        username="restaurantadmin",
        password=hash_password("restpass123"),
        role=UserRole.RESTAURANT_ADMIN.value,
    )
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    return admin



@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(test_user.username)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin):
    token = create_access_token(test_admin.username)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def restaurant_admin_headers(test_restaurant_admin):
    token = create_access_token(test_restaurant_admin.username)
    return {"Authorization": f"Bearer {token}"}
