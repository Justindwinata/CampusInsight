from fastapi.testclient import TestClient

from campusinsight_api.main import app

client = TestClient(app)


def test_health_endpoint_returns_service_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "campusinsight-api",
    }


def test_root_endpoint_returns_welcome_status() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["service"] == "campusinsight-api"
    assert response.json()["status"] == "under-development"
