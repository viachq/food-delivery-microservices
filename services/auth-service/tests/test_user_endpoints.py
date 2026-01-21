"""
Integration tests for user management endpoints.
"""

from backend.core.enums import UserRole


class TestGetUserById:
    """Test GET /users/{user_id} endpoint."""

    def test_get_user_by_id_success(self, client, test_user):
        """Test getting user by ID."""
        response = client.get(f"/users/{test_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_user.id
        assert data["username"] == test_user.username
        assert data["role"] == test_user.role

    def test_get_user_by_id_not_found(self, client):
        """Test getting non-existent user by ID."""
        response = client.get("/users/99999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestGetUserByUsername:
    """Test GET /users/username/{username} endpoint."""

    def test_get_user_by_username_success(self, client, test_user):
        """Test getting user by username."""
        response = client.get(f"/users/username/{test_user.username}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_user.id
        assert data["username"] == test_user.username
        assert data["role"] == test_user.role

    def test_get_user_by_username_not_found(self, client):
        """Test getting non-existent user by username."""
        response = client.get("/users/username/nonexistent")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()


class TestGetCurrentUser:
    """Test GET /users/me endpoint."""

    def test_get_current_user_success(self, client, test_user, auth_headers):
        """Test getting current user info."""
        response = client.get("/users/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_user.id
        assert data["username"] == test_user.username
        assert data["role"] == test_user.role

    def test_get_current_user_no_auth(self, client):
        """Test getting current user without authentication."""
        response = client.get("/users/me")
        
        assert response.status_code == 401
        assert "not authenticated" in response.json()["detail"].lower()

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        response = client.get(
            "/users/me",
            headers={"Authorization": "Bearer invalid.token.here"}
        )
        
        assert response.status_code == 401


class TestUpdateUserProfile:
    """Test PUT /users/me endpoint."""

    def test_update_username_success(self, client, test_user, auth_headers):
        """Test updating username."""
        response = client.put(
            "/users/me",
            params={"username": "newusername"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Profile updated"
        assert data["username"] == "newusername"

    def test_update_password_success(self, client, test_user, auth_headers):
        """Test updating password."""
        response = client.put(
            "/users/me",
            params={"password": "newpass123"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Profile updated"
        
        # Verify can login with new password
        login_response = client.post(
            "/auth/login",
            json={
                "username": test_user.username,
                "password": "newpass123"
            }
        )
        assert login_response.status_code == 200

    def test_update_both_username_and_password(self, client, test_user, auth_headers):
        """Test updating both username and password."""
        response = client.put(
            "/users/me",
            params={
                "username": "updateduser",
                "password": "updatedpass123"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "updateduser"
        
        # Verify can login with new credentials
        login_response = client.post(
            "/auth/login",
            json={
                "username": "updateduser",
                "password": "updatedpass123"
            }
        )
        assert login_response.status_code == 200

    def test_update_username_already_taken(self, client, test_user, auth_headers, test_db):
        """Test updating username to one that's already taken."""
        # Create another user
        from backend.models.user import User
        from backend.core.security import hash_password
        
        existing_user = User(
            username="existinguser",
            password=hash_password("pass123"),
            role=UserRole.CLIENT.value
        )
        test_db.add(existing_user)
        test_db.commit()
        
        # Try to update to existing username
        response = client.put(
            "/users/me",
            params={"username": "existinguser"},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert "already taken" in response.json()["detail"].lower()

    def test_update_profile_no_auth(self, client):
        """Test updating profile without authentication."""
        response = client.put(
            "/users/me",
            params={"username": "newname"}
        )
        
        assert response.status_code == 401
