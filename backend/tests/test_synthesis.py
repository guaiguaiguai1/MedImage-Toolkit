"""Synthesis API tests."""

import pytest
from fastapi.testclient import TestClient

from app.models.user import User
from tests.conftest import create_test_user, get_auth_headers


def test_generate_image(client: TestClient, db):
    """Test submitting a synthesis task."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.post(
        "/api/v1/synthesis/generate",
        json={
            "prompt": "Generate a CT scan of human chest",
            "modality": "CT",
            "steps": 30,
            "guidance_scale": 7.5,
        },
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["prompt"] == "Generate a CT scan of human chest"
    assert data["modality"] == "CT"
    assert data["status"] == "completed"
    assert "id" in data


def test_generate_image_invalid_modality(client: TestClient, db):
    """Test that invalid modality is rejected."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.post(
        "/api/v1/synthesis/generate",
        json={
            "prompt": "Generate an ultrasound image",
            "modality": "Ultrasound",
        },
        headers=headers,
    )
    assert response.status_code == 422


def test_generate_image_short_prompt(client: TestClient, db):
    """Test that short prompt is rejected."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.post(
        "/api/v1/synthesis/generate",
        json={"prompt": "ab", "modality": "CT"},
        headers=headers,
    )
    assert response.status_code == 422


def test_list_tasks(client: TestClient, db):
    """Test listing synthesis tasks."""
    create_test_user(db)
    headers = get_auth_headers(client)

    # Create a task first
    client.post(
        "/api/v1/synthesis/generate",
        json={"prompt": "Generate a CT scan", "modality": "CT"},
        headers=headers,
    )

    response = client.get("/api/v1/synthesis/tasks", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_list_tasks_filter_modality(client: TestClient, db):
    """Test filtering tasks by modality."""
    create_test_user(db)
    headers = get_auth_headers(client)

    client.post(
        "/api/v1/synthesis/generate",
        json={"prompt": "Generate a CT scan", "modality": "CT"},
        headers=headers,
    )
    client.post(
        "/api/v1/synthesis/generate",
        json={"prompt": "Generate an MRI scan", "modality": "MRI"},
        headers=headers,
    )

    response = client.get("/api/v1/synthesis/tasks?modality=CT", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert all(t["modality"] == "CT" for t in data)


def test_get_task(client: TestClient, db):
    """Test getting a specific task by ID."""
    create_test_user(db)
    headers = get_auth_headers(client)

    create_resp = client.post(
        "/api/v1/synthesis/generate",
        json={"prompt": "Generate a CT scan", "modality": "CT"},
        headers=headers,
    )
    task_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/synthesis/tasks/{task_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == task_id


def test_get_task_not_found(client: TestClient, db):
    """Test getting a non-existent task."""
    create_test_user(db)
    headers = get_auth_headers(client)

    response = client.get("/api/v1/synthesis/tasks/nonexistent-id", headers=headers)
    assert response.status_code == 404


def test_delete_task(client: TestClient, db):
    """Test deleting a synthesis task."""
    create_test_user(db)
    headers = get_auth_headers(client)

    create_resp = client.post(
        "/api/v1/synthesis/generate",
        json={"prompt": "Generate a CT scan", "modality": "CT"},
        headers=headers,
    )
    task_id = create_resp.json()["id"]

    response = client.delete(f"/api/v1/synthesis/tasks/{task_id}", headers=headers)
    assert response.status_code == 200

    # Verify it's gone
    response = client.get(f"/api/v1/synthesis/tasks/{task_id}", headers=headers)
    assert response.status_code == 404


def test_generate_requires_auth(client: TestClient, db):
    """Test that generate endpoint requires authentication."""
    response = client.post(
        "/api/v1/synthesis/generate",
        json={"prompt": "Generate a CT scan", "modality": "CT"},
    )
    assert response.status_code == 401
