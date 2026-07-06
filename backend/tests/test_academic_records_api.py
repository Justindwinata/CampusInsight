from pathlib import Path

from fastapi.testclient import TestClient

from campusinsight_api.main import app

client = TestClient(app)

ROOT_DIR = Path(__file__).resolve().parents[2]
SAMPLE_CSV = ROOT_DIR / "data" / "sample" / "academic_records_sample.csv"
FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_valid_csv_upload_returns_valid_result() -> None:
    response = _upload_file(SAMPLE_CSV)

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is True
    assert payload["errors"] == []
    assert payload["row_count"] == 16
    assert payload["records"][0]["student_id"] == "S1001"


def test_invalid_csv_upload_returns_invalid_result() -> None:
    response = _upload_file(FIXTURES_DIR / "invalid_bad_values.csv")

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is False
    assert payload["records"] == []
    assert payload["row_count"] == 3


def test_missing_file_returns_400() -> None:
    response = client.post("/academic-records/validate")

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert payload["errors"][0]["field"] == "file"


def test_empty_file_returns_400() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("empty.csv", b"", "text/csv")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert "empty" in payload["errors"][0]["message"].lower()


def test_non_csv_filename_returns_400() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("records.txt", b"student_id\nS1001\n", "text/csv")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert ".csv" in payload["errors"][0]["message"]


def test_invalid_content_type_returns_400() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("records.csv", b"student_id\nS1001\n", "application/json")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert "CSV file" in payload["errors"][0]["message"]


def test_unreadable_content_returns_safe_error() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("records.csv", b"\xff\xfe\xfa", "text/csv")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert "readable UTF-8 text" in payload["errors"][0]["message"]


def test_validation_errors_include_row_number_field_and_message() -> None:
    response = _upload_file(FIXTURES_DIR / "invalid_bad_values.csv")

    error = response.json()["errors"][0]
    assert {"row_number", "field", "message"}.issubset(error)
    assert isinstance(error["row_number"], int)
    assert isinstance(error["field"], str)
    assert isinstance(error["message"], str)


def test_upload_response_does_not_expose_stack_traces() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("records.csv", b"\xff\xfe\xfa", "text/csv")},
    )

    response_body = response.text
    assert "Traceback" not in response_body
    assert "UnicodeDecodeError" not in response_body
    assert "FileNotFoundError" not in response_body
    assert str(ROOT_DIR) not in response_body


def test_analyze_valid_csv_returns_analytics_result() -> None:
    response = _post_file("/academic-records/analyze", SAMPLE_CSV)

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is True
    assert payload["validation"]["row_count"] == 16
    assert payload["validation"]["errors"] == []
    assert payload["analytics"]["gpa_summary"]["weighted_gpa"] == 3.11
    assert payload["analytics"]["gpa_summary"]["total_courses"] == 16
    assert len(payload["analytics"]["semester_performance"]) == 2
    assert len(payload["analytics"]["course_performance"]) == 16
    assert payload["analytics"]["credit_summary"]["total_credits"] == 46.0
    assert payload["analytics"]["course_risks"]


def test_analyze_invalid_csv_returns_validation_errors_without_analytics() -> None:
    response = _post_file("/academic-records/analyze", FIXTURES_DIR / "invalid_bad_values.csv")

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is False
    assert payload["validation"]["row_count"] == 3
    assert payload["validation"]["errors"][0]["row_number"] == 2
    assert payload["validation"]["errors"][0]["field"] == "semester"
    assert payload["analytics"] is None


def test_analyze_upload_error_response_does_not_expose_stack_traces() -> None:
    response = client.post(
        "/academic-records/analyze",
        files={"file": ("records.csv", b"\xff\xfe\xfa", "text/csv")},
    )

    payload = response.json()
    response_body = response.text
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert payload["analytics"] is None
    assert "Traceback" not in response_body
    assert "UnicodeDecodeError" not in response_body
    assert str(ROOT_DIR) not in response_body


def test_validation_endpoint_still_returns_validation_result() -> None:
    response = _upload_file(SAMPLE_CSV)

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is True
    assert payload["row_count"] == 16
    assert "analytics" not in payload


def _upload_file(path: Path):
    return _post_file("/academic-records/validate", path)


def _post_file(url: str, path: Path):
    return client.post(
        url,
        files={"file": (path.name, path.read_bytes(), "text/csv")},
    )
