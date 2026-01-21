"""
Integration tests for authentication endpoints (login, register).
"""

from backend.core.enums import UserRole


class TestUserRegistration:
    """Test user registration endpoint."""

    def test_register_new_user_success(self, client):
        """Test successful user registration."""
        response = client.post(
            "/auth/register",
            json={
                "username": "newuser",
                "password": "newpass123"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert data["username"] == "newuser"
        assert "user_id" in data
        assert isinstance(data["user_id"], int)

    def test_register_duplicate_username(self, client, test_user):
        """Test registration with existing username."""
        response = client.post(
            "/auth/register",
            json={
                "username": test_user.username,
                "password": "somepass123"
            }
        )
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    def test_register_creates_client_role(self, client, test_db):
        """Test that new users are created with CLIENT role."""
        response = client.post(
            "/auth/register",
            json={
                "username": "clientuser",
                "password": "pass123"
            }
        )
        
        assert response.status_code == 201
        
        # Verify user has client role in database
        from backend.models.user import User
        user = test_db.query(User).filter(User.username == "clientuser").first()
        assert user is not None
        assert user.role == UserRole.CLIENT.value


class TestUserLogin:
    """Test user login endpoint."""

    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/auth/login",
            json={
                "username": "testuser",
                "password": "testpass123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["username"] == "testuser"
        assert data["user"]["role"] == UserRole.CLIENT.value

    def test_login_invalid_username(self, client):
        """Test login with non-existent username."""
        response = client.post(
            "/auth/login",
            json={
                "username": "nonexistent",
                "password": "anypass"
            }
        )
        
        assert response.status_code == 401
        assert "Invalid username or password" in response.json()["detail"]

    def test_login_invalid_password(self, client, test_user):
        """Test login with incorrect password."""
        response = client.post(
            "/auth/login",
            json={
                "username": "testuser",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "Invalid username or password" in response.json()["detail"]

    def test_login_returns_valid_token(self, client, test_user):
        """Test that login returns a valid JWT token."""
        response = client.post(
            "/auth/login",
            json={
                "username": "testuser",
                "password": "testpass123"
            }
        )
        
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        # Verify token is valid by decoding it
        from backend.core.security import decode_token
        payload = decode_token(token)
        
        assert payload is not None
        assert payload["sub"] == "testuser"

    def test_login_admin_user(self, client, test_admin):
        """Test login with admin user."""
        response = client.post(
            "/auth/login",
            json={
                "username": "adminuser",
                "password": "adminpass123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["role"] == UserRole.SYSTEM_ADMIN.value
