"""Dataset API tests."""

import pytest
from fastapi.testclient import TestClient

from tests.conftest import create_test_user, get_auth_headers


def test_create_dataset(client: TestClient, db):
    """Test creating a dataset."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.post(
        "/api/v1/datasets",
        json={
            "name": "CT Chest Dataset",
            "modality": "CT",
            "image_count": 500,
            "description": "CT chest scans for training",
            "source": "Hospital A",
            "file_size_mb": 1024,
        },
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "CT Chest Dataset"
    assert data["modality"] == "CT"
    assert data["image_count"] == 500
    assert "id" in data


def test_create_dataset_duplicate_name(client: TestClient, db):
    """Test that duplicate dataset names are rejected."""
    create_test_user(db)
    headers = get_auth_headers(client)

    client.post(
        "/api/v1/datasets",
        json={"name": "Duplicate Dataset", "modality": "CT"},
        headers=headers,
    )

    response = client.post(
        "/api/v1/datasets",
        json={"name": "Duplicate Dataset", "modality": "MRI"},
        headers=headers,
    )
    assert response.status_code == 400


def test_create_dataset_invalid_modality(client: TestClient, db):
    """Test that invalid modality is rejected."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.post(
        "/api/v1/datasets",
        json={"name": "Invalid Dataset", "modality": "PET"},
        headers=headers,
    )
    assert response.status_code == 422


def test_list_datasets(client: TestClient, db):
    """Test listing datasets."""
    create_test_user(db)
    headers = get_auth_headers(client)

    client.post(
        "/api/v1/datasets",
        json={"name": "Dataset-A", "modality": "CT"},
        headers=headers,
    )
    client.post(
        "/api/v1/datasets",
        json={"name": "Dataset-B", "modality": "MRI"},
        headers=headers,
    )

    response = client.get("/api/v1/datasets", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_list_datasets_filter_modality(client: TestClient, db):
    """Test filtering datasets by modality."""
    create_test_user(db)
    headers = get_auth_headers(client)

    client.post(
        "/api/v1/datasets",
        json={"name": "CT-Dataset", "modality": "CT"},
        headers=headers,
    )
    client.post(
        "/api/v1/datasets",
        json={"name": "MRI-Dataset", "modality": "MRI"},
        headers=headers,
    )

    response = client.get("/api/v1/datasets?modality=MRI", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert all(d["modality"] == "MRI" for d in data)


def test_get_dataset(client: TestClient, db):
    """Test getting a dataset by ID."""
    create_test_user(db)
    headers = get_auth_headers(client)

    create_resp = client.post(
        "/api/v1/datasets",
        json={"name": "Test Dataset", "modality": "CT"},
        headers=headers,
    )
    dataset_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/datasets/{dataset_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == dataset_id


def test_get_dataset_not_found(client: TestClient, db):
    """Test getting a non-existent dataset."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.get("/api/v1/datasets/nonexistent-id", headers=headers)
    assert response.status_code == 404


def test_update_dataset(client: TestClient, db):
    """Test updating a dataset."""
    create_test_user(db)
    headers = get_auth_headers(client)

    create_resp = client.post(
        "/api/v1/datasets",
        json={"name": "Old Dataset", "modality": "CT", "image_count": 100},
        headers=headers,
    )
    dataset_id = create_resp.json()["id"]

    response = client.put(
        f"/api/v1/datasets/{dataset_id}",
        json={"name": "New Dataset", "image_count": 200},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Dataset"
    assert response.json()["image_count"] == 200


def test_delete_dataset(client: TestClient, db):
    """Test deleting a dataset."""
    create_test_user(db)
    headers = get_auth_headers(client)

    create_resp = client.post(
        "/api/v1/datasets",
        json={"name": "Delete Dataset", "modality": "CT"},
        headers=headers,
    )
    dataset_id = create_resp.json()["id"]

    response = client.delete(f"/api/v1/datasets/{dataset_id}", headers=headers)
    assert response.status_code == 200

    response = client.get(f"/api/v1/datasets/{dataset_id}", headers=headers)
    assert response.status_code == 404


def test_datasets_require_auth(client: TestClient, db):
    """Test that dataset endpoints require authentication."""
    response = client.get("/api/v1/datasets")
    assert response.status_code == 401
