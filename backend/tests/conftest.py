"""Pytest configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def create_test_user(db, username="testuser", password="testpassword"):
    """Helper to create a test user and return it."""
    from app.core.security import get_password_hash
    from app.models.user import User

    user = User(
        username=username,
        email=f"{username}@example.com",
        hashed_password=get_password_hash(password),
        full_name=f"Test {username}",
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_auth_headers(client, username="testuser", password="testpassword"):
    """Helper to get authentication headers."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": username, "password": password},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
