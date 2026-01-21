"""
Unit tests for security functions (password hashing, JWT tokens).
"""

from datetime import datetime, timedelta, timezone
from jose import jwt

from backend.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token
)
from backend.core.config import JWT_SECRET_KEY, JWT_ALGORITHM


class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_hash_password_creates_hash(self):
        """Test that hash_password creates a hash with salt."""
        password = "mypassword123"
        hashed = hash_password(password)
        
        assert hashed is not None
        assert len(hashed) > len(password)
        assert "$" in hashed  # Should contain salt separator

    def test_hash_password_different_salts(self):
        """Test that same password produces different hashes due to salt."""
        password = "samepassword"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 != hash2  # Different salts should produce different hashes

    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "correctpassword"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "correctpassword"
        hashed = hash_password(password)
        
        assert verify_password("wrongpassword", hashed) is False

    def test_verify_password_legacy_format(self):
        """Test backward compatibility with legacy password format."""
        import hashlib
        password = "legacypass"
        # Simulate old format without salt
        legacy_hash = hashlib.sha256(password.encode()).hexdigest()
        
        assert verify_password(password, legacy_hash) is True
        assert verify_password("wrongpass", legacy_hash) is False

    def test_verify_password_malformed_hash(self):
        """Test password verification with malformed hash."""
        assert verify_password("anypass", "malformed") is False
        assert verify_password("anypass", "") is False


class TestJWTTokens:
    """Test JWT token creation and validation."""

    def test_create_access_token(self):
        """Test JWT token creation."""
        username = "testuser"
        token = create_access_token(username)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_token_valid(self):
        """Test decoding a valid JWT token."""
        username = "testuser"
        token = create_access_token(username)
        
        payload = decode_token(token)
        
        assert payload is not None
        assert payload["sub"] == username
        assert "exp" in payload
        assert "iat" in payload

    def test_decode_token_invalid(self):
        """Test decoding an invalid JWT token."""
        invalid_token = "invalid.token.here"
        payload = decode_token(invalid_token)
        
        assert payload is None

    def test_decode_token_expired(self):
        """Test decoding an expired JWT token."""
        username = "testuser"
        
        # Create an expired token
        expire = datetime.now(timezone.utc) - timedelta(minutes=1)
        to_encode = {
            "sub": username,
            "exp": expire,
            "iat": datetime.now(timezone.utc)
        }
        expired_token = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        payload = decode_token(expired_token)
        assert payload is None

    def test_decode_token_wrong_signature(self):
        """Test decoding a token with wrong signature."""
        username = "testuser"
        
        # Create token with different secret
        expire = datetime.now(timezone.utc) + timedelta(minutes=30)
        to_encode = {
            "sub": username,
            "exp": expire,
            "iat": datetime.now(timezone.utc)
        }
        wrong_token = jwt.encode(to_encode, "wrong-secret-key", algorithm=JWT_ALGORITHM)
        
        payload = decode_token(wrong_token)
        assert payload is None

    
    def test_token_contains_correct_expiry(self):
        """Test that token contains correct expiration time."""
        from backend.core.config import JWT_EXPIRES_MINUTES

        username = "testuser"
        token = create_access_token(username)
        payload = decode_token(token)

        assert payload is not None
        assert "exp" in payload
        assert "iat" in payload

        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        iat = datetime.fromtimestamp(payload["iat"], tz=timezone.utc)

        lifetime = exp - iat

        # Token lifetime should be approximately JWT_EXPIRES_MINUTES
        assert timedelta(minutes=JWT_EXPIRES_MINUTES - 1) <= lifetime <= timedelta(
            minutes=JWT_EXPIRES_MINUTES + 1
        )
