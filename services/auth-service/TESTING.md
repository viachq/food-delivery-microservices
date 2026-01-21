# Auth Service Testing

Comprehensive testing suite for the Auth Service microservice with **70%+ code coverage**.

## Test Coverage

The test suite achieves **84% code coverage** across all backend modules:

- **Security functions**: 94% coverage (password hashing, JWT tokens)
- **API endpoints**: 88-96% coverage (authentication, user management, admin)
- **Database models**: 100% coverage
- **Main application**: 92% coverage

## Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Pytest fixtures and configuration
├── test_security.py         # Unit tests for security functions
├── test_auth_endpoints.py   # Integration tests for authentication
├── test_user_endpoints.py   # Integration tests for user management
├── test_admin_endpoints.py  # Integration tests for admin operations
├── test_models.py           # Unit tests for database models
└── test_app.py              # Integration tests for general app features
```

## Running Tests

### Prerequisites

```bash
cd services/auth-service
pip install -r requirements.txt
```

### Run All Tests

```bash
# Run all tests with coverage
pytest tests/ -v --cov=backend --cov-report=term-missing

# Run with HTML coverage report
pytest tests/ -v --cov=backend --cov-report=html

# View HTML report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

### Run Specific Test Categories

```bash
# Run only unit tests for security
pytest tests/test_security.py -v

# Run only authentication endpoint tests
pytest tests/test_auth_endpoints.py -v

# Run only model tests
pytest tests/test_models.py -v

# Run only admin endpoint tests
pytest tests/test_admin_endpoints.py -v
```

### Run Tests in Parallel

```bash
# Install pytest-xdist
pip install pytest-xdist

# Run tests in parallel
pytest tests/ -n auto
```

## Test Types

### 1. Unit Tests

**File**: `test_security.py`, `test_models.py`

Tests individual functions and classes in isolation:
- Password hashing and verification
- JWT token creation and validation
- Database model CRUD operations

### 2. Integration Tests

**Files**: `test_auth_endpoints.py`, `test_user_endpoints.py`, `test_admin_endpoints.py`

Tests API endpoints with database interactions:
- User registration and login
- Profile management
- Admin user management
- Role-based access control

## Test Fixtures

Defined in `conftest.py`:

- `test_engine`: In-memory SQLite database engine
- `test_db`: Database session for tests
- `client`: FastAPI TestClient with test database
- `test_user`: Regular user fixture
- `test_admin`: System admin user fixture
- `test_restaurant_admin`: Restaurant admin user fixture
- `auth_headers`: Authorization headers for regular user
- `admin_headers`: Authorization headers for admin user

## Coverage Requirements

- **Minimum coverage**: 70% (enforced in CI/CD)
- **Current coverage**: 84%
- **Target coverage**: 80%+

### Coverage by Module

```
Module                          Coverage
─────────────────────────────────────────
backend/core/security.py        94%
backend/routers/admin_users.py  96%
backend/deps.py                 88%
backend/main.py                 92%
backend/routers/auth_login.py   90%
backend/models/user.py          100%
```

## Continuous Integration

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request targeting `main` or `develop`
- Changes to `services/auth-service/**` files

### CI Pipeline

1. **Linting**: Code quality checks with flake8
2. **Testing**: Run full test suite with pytest
3. **Coverage**: Generate coverage reports
4. **Upload**: Upload coverage to Codecov
5. **Artifacts**: Save HTML coverage reports

### Viewing CI Results

- **GitHub Actions**: Check the "Actions" tab in your repository
- **Coverage Reports**: Download artifacts from workflow runs
- **PR Comments**: Automatic coverage comments on pull requests

## Writing New Tests

### Example Unit Test

```python
from backend.core.security import hash_password, verify_password

def test_password_hashing():
    """Test password hashing works correctly."""
    password = "mypassword123"
    hashed = hash_password(password)
    
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpass", hashed) is False
```

### Example Integration Test

```python
def test_login_success(client, test_user):
    """Test successful user login."""
    response = client.post(
        "/auth/login",
        json={
            "username": "testuser",
            "password": "testpass123"
        }
    )
    
    assert response.status_code == 200
    assert "access_token" in response.json()
```

## Best Practices

1. **Use fixtures**: Leverage existing fixtures for common test data
2. **Test isolation**: Each test should be independent
3. **Descriptive names**: Use clear, descriptive test function names
4. **Assert clearly**: Use specific assertions with helpful messages
5. **Coverage focus**: Aim for high coverage of critical paths
6. **Fast tests**: Keep unit tests fast; use mocks for external dependencies

## Troubleshooting

### Tests Fail Locally

```bash
# Clean up test artifacts
rm -rf .pytest_cache htmlcov .coverage

# Reinstall dependencies
pip install -r requirements.txt

# Run tests again
pytest tests/ -v
```

### Database Errors

Tests use in-memory SQLite database. If you see database errors:

```bash
# Verify fixtures are properly defined
cat tests/conftest.py

# Check database initialization
pytest tests/ -v -s  # Show print statements
```

### Import Errors

```bash
# Set PYTHONPATH correctly
export PYTHONPATH=/path/to/auth-service:$PYTHONPATH

# Or run from auth-service directory
cd services/auth-service
pytest tests/
```

## Contributing

When adding new features:

1. Write tests for new functionality
2. Ensure all tests pass locally
3. Maintain or improve code coverage
4. Update this README if adding new test categories

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Coverage.py](https://coverage.readthedocs.io/)
- [GitHub Actions](https://docs.github.com/en/actions)
