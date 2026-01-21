"""
Unit tests for database models.
"""
import pytest

from backend.models.user import User
from backend.core.enums import UserRole
from backend.core.security import hash_password


class TestUserModel:
    """Test User model."""

    def test_create_user(self, test_db):
        """Test creating a user."""
        user = User(
            username="testuser",
            password=hash_password("password123"),
            role=UserRole.CLIENT.value
        )
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        
        assert user.id is not None
        assert user.username == "testuser"
        assert user.role == UserRole.CLIENT.value

    def test_user_unique_username(self, test_db):
        """Test that username must be unique."""
        user1 = User(
            username="sameusername",
            password=hash_password("pass1"),
            role=UserRole.CLIENT.value
        )
        test_db.add(user1)
        test_db.commit()
        
        user2 = User(
            username="sameusername",
            password=hash_password("pass2"),
            role=UserRole.CLIENT.value
        )
        test_db.add(user2)
        
        with pytest.raises(Exception):  # Should raise integrity error
            test_db.commit()

    def test_user_default_role(self, test_db):
        """Test that default role is CLIENT."""
        user = User(
            username="defaultroleuser",
            password=hash_password("pass123")
        )
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        
        assert user.role == UserRole.CLIENT.value

    def test_query_user_by_id(self, test_db, test_user):
        """Test querying user by ID."""
        user = test_db.query(User).filter(User.id == test_user.id).first()
        
        assert user is not None
        assert user.id == test_user.id
        assert user.username == test_user.username

    def test_query_user_by_username(self, test_db, test_user):
        """Test querying user by username."""
        user = test_db.query(User).filter(User.username == test_user.username).first()
        
        assert user is not None
        assert user.id == test_user.id
        assert user.username == test_user.username

    def test_query_users_by_role(self, test_db, test_user, test_admin):
        """Test querying users by role."""
        admins = test_db.query(User).filter(User.role == UserRole.SYSTEM_ADMIN.value).all()
        clients = test_db.query(User).filter(User.role == UserRole.CLIENT.value).all()
        
        assert len(admins) >= 1
        assert len(clients) >= 1
        assert test_admin.username in [u.username for u in admins]
        assert test_user.username in [u.username for u in clients]

    def test_update_user(self, test_db, test_user):
        """Test updating user fields."""
        test_user.username = "updatedusername"
        test_user.role = UserRole.RESTAURANT_ADMIN.value
        test_db.commit()
        test_db.refresh(test_user)
        
        assert test_user.username == "updatedusername"
        assert test_user.role == UserRole.RESTAURANT_ADMIN.value

    def test_delete_user(self, test_db, test_user):
        """Test deleting a user."""
        user_id = test_user.id
        test_db.delete(test_user)
        test_db.commit()
        
        deleted_user = test_db.query(User).filter(User.id == user_id).first()
        assert deleted_user is None
