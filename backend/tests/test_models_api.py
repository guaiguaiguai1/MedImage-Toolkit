"""Models API tests."""

import pytest
from fastapi.testclient import TestClient

from tests.conftest import create_test_user, get_auth_headers


def test_create_model(client: TestClient, db):
    """Test creating a pretrained model."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.post(
        "/api/v1/models",
        json={
            "name": "CT-Synthesis-v1",
            "modality": "CT",
            "version": "1.0.0",
            "description": "A CT synthesis model",
            "fid_score": 22.5,
            "download_size_mb": 500,
        },
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "CT-Synthesis-v1"
    assert data["modality"] == "CT"
    assert data["version"] == "1.0.0"
    assert "id" in data


def test_create_model_invalid_modality(client: TestClient, db):
    """Test that invalid modality is rejected."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.post(
        "/api/v1/models",
        json={
            "name": "Ultrasound Model",
            "modality": "Ultrasound",
            "version": "1.0.0",
        },
        headers=headers,
    )
    assert response.status_code == 422


def test_list_models(client: TestClient, db):
    """Test listing models."""
    create_test_user(db)
    headers = get_auth_headers(client)

    client.post(
        "/api/v1/models",
        json={"name": "Model-A", "modality": "CT", "version": "1.0.0"},
        headers=headers,
    )
    client.post(
        "/api/v1/models",
        json={"name": "Model-B", "modality": "MRI", "version": "2.0.0"},
        headers=headers,
    )

    response = client.get("/api/v1/models", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_list_models_filter_modality(client: TestClient, db):
    """Test filtering models by modality."""
    create_test_user(db)
    headers = get_auth_headers(client)

    client.post(
        "/api/v1/models",
        json={"name": "Model-CT", "modality": "CT", "version": "1.0.0"},
        headers=headers,
    )
    client.post(
        "/api/v1/models",
        json={"name": "Model-MRI", "modality": "MRI", "version": "1.0.0"},
        headers=headers,
    )

    response = client.get("/api/v1/models?modality=MRI", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert all(m["modality"] == "MRI" for m in data)


def test_get_model(client: TestClient, db):
    """Test getting a model by ID."""
    create_test_user(db)
    headers = get_auth_headers(client)

    create_resp = client.post(
        "/api/v1/models",
        json={"name": "Model-Test", "modality": "CT", "version": "1.0.0"},
        headers=headers,
    )
    model_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/models/{model_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == model_id


def test_get_model_not_found(client: TestClient, db):
    """Test getting a non-existent model."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.get("/api/v1/models/nonexistent-id", headers=headers)
    assert response.status_code == 404


def test_update_model(client: TestClient, db):
    """Test updating a model."""
    create_test_user(db)
    headers = get_auth_headers(client)

    create_resp = client.post(
        "/api/v1/models",
        json={"name": "Model-Old", "modality": "CT", "version": "1.0.0"},
        headers=headers,
    )
    model_id = create_resp.json()["id"]

    response = client.put(
        f"/api/v1/models/{model_id}",
        json={"name": "Model-New", "modality": "CT", "version": "2.0.0"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Model-New"
    assert response.json()["version"] == "2.0.0"


def test_delete_model(client: TestClient, db):
    """Test deleting a model."""
    create_test_user(db)
    headers = get_auth_headers(client)

    create_resp = client.post(
        "/api/v1/models",
        json={"name": "Model-Delete", "modality": "CT", "version": "1.0.0"},
        headers=headers,
    )
    model_id = create_resp.json()["id"]

    response = client.delete(f"/api/v1/models/{model_id}", headers=headers)
    assert response.status_code == 200

    response = client.get(f"/api/v1/models/{model_id}", headers=headers)
    assert response.status_code == 404


def test_models_require_auth(client: TestClient, db):
    """Test that model endpoints require authentication."""
    response = client.get("/api/v1/models")
    assert response.status_code == 401
