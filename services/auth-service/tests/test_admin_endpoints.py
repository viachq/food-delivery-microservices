"""
Integration tests for admin user management endpoints.
"""

from backend.core.enums import UserRole


class TestGetAllUsers:
    """Test GET /admin/users/ endpoint."""

    def test_get_all_users_as_admin(self, client, test_user, test_admin, admin_headers):
        """Test getting all users as system admin."""
        response = client.get("/admin/users/", headers=admin_headers)
        
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) >= 2  # At least test_user and test_admin
        
        # Check that both users are in the response
        usernames = [u["username"] for u in users]
        assert test_user.username in usernames
        assert test_admin.username in usernames

    def test_get_all_users_as_regular_user(self, client, test_user, auth_headers):
        """Test that regular users cannot access admin endpoint."""
        response = client.get("/admin/users/", headers=auth_headers)
        
        assert response.status_code == 403
        assert "forbidden" in response.json()["detail"].lower()

    def test_get_all_users_as_restaurant_admin(self, client, restaurant_admin_headers):
        """Test that restaurant admins cannot access system admin endpoint."""
        response = client.get("/admin/users/", headers=restaurant_admin_headers)
        
        assert response.status_code == 403

    def test_get_all_users_no_auth(self, client):
        """Test that unauthenticated users cannot access admin endpoint."""
        response = client.get("/admin/users/")
        
        assert response.status_code == 401


class TestChangeUserRole:
    """Test PUT /admin/users/{user_id}/role endpoint."""

    def test_change_role_to_restaurant_admin(self, client, test_user, admin_headers):
        """Test changing user role to restaurant admin."""
        response = client.put(
            f"/admin/users/{test_user.id}/role",
            params={"role": UserRole.RESTAURANT_ADMIN.value},
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Role updated successfully"
        assert data["user_id"] == test_user.id
        assert data["role"] == UserRole.RESTAURANT_ADMIN.value

    def test_change_role_to_system_admin(self, client, test_user, admin_headers):
        """Test changing user role to system admin."""
        response = client.put(
            f"/admin/users/{test_user.id}/role",
            params={"role": UserRole.SYSTEM_ADMIN.value},
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == UserRole.SYSTEM_ADMIN.value

    def test_change_role_to_client(self, client, test_restaurant_admin, admin_headers):
        """Test changing user role to client."""
        response = client.put(
            f"/admin/users/{test_restaurant_admin.id}/role",
            params={"role": UserRole.CLIENT.value},
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == UserRole.CLIENT.value

    def test_change_role_invalid_role(self, client, test_user, admin_headers):
        """Test changing role to invalid value."""
        response = client.put(
            f"/admin/users/{test_user.id}/role",
            params={"role": "invalid_role"},
            headers=admin_headers
        )
        
        assert response.status_code == 400
        assert "Invalid role" in response.json()["detail"]

    def test_change_role_user_not_found(self, client, admin_headers):
        """Test changing role for non-existent user."""
        response = client.put(
            "/admin/users/99999/role",
            params={"role": UserRole.CLIENT.value},
            headers=admin_headers
        )
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_change_role_as_regular_user(self, client, test_user, auth_headers):
        """Test that regular users cannot change roles."""
        response = client.put(
            f"/admin/users/{test_user.id}/role",
            params={"role": UserRole.SYSTEM_ADMIN.value},
            headers=auth_headers
        )
        
        assert response.status_code == 403

    def test_change_role_as_restaurant_admin(self, client, test_user, restaurant_admin_headers):
        """Test that restaurant admins cannot change user roles."""
        response = client.put(
            f"/admin/users/{test_user.id}/role",
            params={"role": UserRole.CLIENT.value},
            headers=restaurant_admin_headers
        )
        
        assert response.status_code == 403

    def test_change_role_no_auth(self, client, test_user):
        """Test that unauthenticated users cannot change roles."""
        response = client.put(
            f"/admin/users/{test_user.id}/role",
            params={"role": UserRole.CLIENT.value}
        )
        
        assert response.status_code == 401
