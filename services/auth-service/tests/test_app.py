"""
Integration tests for application health and general endpoints.
"""



class TestHealthEndpoint:
    """Test health check endpoint."""

    def test_health_check(self, client):
        """Test health check endpoint returns OK."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "auth-service"
        assert "version" in data


class TestDependencyInjection:
    """Test dependency injection functions."""

    def test_get_current_user_valid_token(self, client, test_user, auth_headers):
        """Test get_current_user with valid token."""
        # Use an endpoint that requires authentication
        response = client.get("/users/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user.username

    def test_require_roles_admin(self, client, admin_headers):
        """Test require_roles with admin user."""
        response = client.get("/admin/users/", headers=admin_headers)
        
        assert response.status_code == 200

    def test_require_roles_insufficient_permissions(self, client, auth_headers):
        """Test require_roles with insufficient permissions."""
        response = client.get("/admin/users/", headers=auth_headers)
        
        assert response.status_code == 403
