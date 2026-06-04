"""Authentication tests."""

import pytest
from fastapi.testclient import TestClient


def test_login_success(client: TestClient):
    """Test successful login."""
    # First create a test user
    from app.core.security import get_password_hash
    from app.models.user import User
    from app.core.database import SessionLocal

    db = SessionLocal()
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpassword"),
        full_name="Test User",
        role="user",
    )
    db.add(user)
    db.commit()
    db.close()

    # Try to login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient):
    """Test login with wrong password."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_protected_endpoint_without_token(client: TestClient):
    """Test accessing protected endpoint without token."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_protected_endpoint_with_token(client: TestClient):
    """Test accessing protected endpoint with valid token."""
    # First create a test user and login
    from app.core.security import get_password_hash
    from app.models.user import User
    from app.core.database import SessionLocal

    db = SessionLocal()
    user = User(
        username="testuser2",
        email="test2@example.com",
        hashed_password=get_password_hash("testpassword"),
        full_name="Test User 2",
        role="user",
    )
    db.add(user)
    db.commit()
    db.close()

    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser2", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]

    # Access protected endpoint
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser2"
