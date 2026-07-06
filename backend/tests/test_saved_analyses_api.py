from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from campusinsight_api.api import academic_records
from campusinsight_api.api import analyses as analyses_api
from campusinsight_api.main import app
from campusinsight_api.services.saved_analysis_repository import SavedAnalysisRepository

client = TestClient(app)

ROOT_DIR = Path(__file__).resolve().parents[2]
SAMPLE_CSV = ROOT_DIR / "data" / "sample" / "academic_records_sample.csv"


@pytest.fixture()
def saved_analysis_repository(tmp_path: Path):
    repository = SavedAnalysisRepository(tmp_path / "campusinsight.sqlite3")
    app.dependency_overrides[analyses_api.get_saved_analysis_repository] = lambda: repository
    app.dependency_overrides[academic_records.get_saved_analysis_repository] = lambda: repository
    yield repository
    app.dependency_overrides.clear()


def test_list_analyses_returns_saved_summaries(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    saved_analysis_repository.save(
        analysis_id="analysis-001",
        created_at="2026-07-06T08:00:00+00:00",
        source_filename="records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=_analysis_response("analysis-001"),
    )

    response = client.get("/analyses")

    payload = response.json()
    assert response.status_code == 200
    assert payload["analyses"] == [
        {
            "analysis_id": "analysis-001",
            "created_at": "2026-07-06T08:00:00+00:00",
            "source_filename": "records.csv",
            "row_count": 16,
            "total_courses": 16,
            "weighted_gpa": 3.11,
            "average_score": 80.0,
        }
    ]


def test_list_analyses_excludes_full_analysis_json(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    saved_analysis_repository.save(
        analysis_id="analysis-001",
        source_filename="records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=_analysis_response("analysis-001"),
    )

    response = client.get("/analyses")

    item = response.json()["analyses"][0]
    assert "analysis_json" not in item
    assert "analytics" not in item
    assert "student_id,student_name" not in response.text
    assert str(ROOT_DIR) not in response.text


def test_list_analyses_sorts_newest_first(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    saved_analysis_repository.save(
        analysis_id="older",
        created_at="2026-07-06T08:00:00+00:00",
        source_filename="older.csv",
        row_count=8,
        total_courses=8,
        weighted_gpa=3.0,
        average_score=79.0,
        analysis=_analysis_response("older"),
    )
    saved_analysis_repository.save(
        analysis_id="newer",
        created_at="2026-07-06T09:00:00+00:00",
        source_filename="newer.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=_analysis_response("newer"),
    )

    response = client.get("/analyses")

    assert [item["analysis_id"] for item in response.json()["analyses"]] == ["newer", "older"]


def test_get_analysis_returns_stored_canonical_response(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    analysis = _analysis_response("analysis-001")
    saved_analysis_repository.save(
        analysis_id="analysis-001",
        source_filename="records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=analysis,
    )

    response = client.get("/analyses/analysis-001")

    assert response.status_code == 200
    assert response.json() == analysis


def test_report_endpoint_returns_html_for_existing_analysis(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    saved_analysis_repository.save(
        analysis_id="analysis-001",
        source_filename="records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=_analysis_response("analysis-001"),
    )

    response = client.get("/analyses/analysis-001/report.html")

    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "CampusInsight Academic Report" in response.text
    assert "analysis-001" in response.text
    assert "CS102 - Data Structures" in response.text


def test_report_endpoint_returns_safe_404_for_unknown_analysis() -> None:
    response = client.get("/analyses/missing-analysis/report.html")

    assert response.status_code == 404
    assert response.json()["detail"] == "Saved analysis was not found."
    assert "Traceback" not in response.text
    assert "sqlite" not in response.text.lower()


def test_report_endpoint_uses_stored_canonical_json(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    analysis = _analysis_response("analysis-001")
    analysis["analytics"]["gpa_summary"]["best_course"] = "HIST999 - Stored Only Course"
    saved_analysis_repository.save(
        analysis_id="analysis-001",
        source_filename="records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=analysis,
    )

    response = client.get("/analyses/analysis-001/report.html")

    assert "HIST999 - Stored Only Course" in response.text


def test_report_endpoint_does_not_expose_csv_content_paths_or_stack_traces(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    saved_analysis_repository.save(
        analysis_id="analysis-001",
        source_filename="/private/tmp/student_records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=_analysis_response("analysis-001"),
    )

    response = client.get("/analyses/analysis-001/report.html")

    assert "student_id,student_name" not in response.text
    assert str(ROOT_DIR) not in response.text
    assert "/private/tmp" not in response.text
    assert "Traceback" not in response.text
    assert "sqlite" not in response.text.lower()


def test_get_unknown_analysis_returns_safe_404() -> None:
    response = client.get("/analyses/missing-analysis")

    payload = response.json()
    assert response.status_code == 404
    assert payload["detail"] == "Saved analysis was not found."
    assert payload["analysis_id"] == "missing-analysis"
    assert "Traceback" not in response.text
    assert "sqlite" not in response.text.lower()


def test_delete_analysis_removes_record(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    saved_analysis_repository.save(
        analysis_id="analysis-001",
        source_filename="records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=_analysis_response("analysis-001"),
    )

    response = client.delete("/analyses/analysis-001")

    assert response.status_code == 200
    assert response.json() == {"deleted": True, "analysis_id": "analysis-001"}
    assert saved_analysis_repository.get("analysis-001") is None


def test_delete_unknown_analysis_returns_safe_404() -> None:
    response = client.delete("/analyses/missing-analysis")

    payload = response.json()
    assert response.status_code == 404
    assert payload["detail"] == "Saved analysis was not found."
    assert "Traceback" not in response.text
    assert "sqlite" not in response.text.lower()


def test_history_api_responses_do_not_expose_stack_traces() -> None:
    response = client.get("/analyses/not-found")

    assert response.status_code == 404
    assert "Traceback" not in response.text
    assert "OperationalError" not in response.text
    assert str(ROOT_DIR) not in response.text


def test_existing_analyze_endpoint_still_saves_valid_analyses(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    response = _post_file("/academic-records/analyze", SAMPLE_CSV)

    payload = response.json()
    assert response.status_code == 200
    assert saved_analysis_repository.get(payload["analysis_id"]) is not None


def test_existing_validation_endpoint_still_works() -> None:
    response = _post_file("/academic-records/validate", SAMPLE_CSV)

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is True
    assert payload["row_count"] == 16
    assert "analytics" not in payload


def _post_file(url: str, path: Path):
    return client.post(
        url,
        files={"file": (path.name, path.read_bytes(), "text/csv")},
    )


def _analysis_response(analysis_id: str) -> dict:
    return {
        "analysis_id": analysis_id,
        "is_valid": True,
        "validation": {"row_count": 16, "errors": []},
        "analytics": {
            "gpa_summary": {
                "total_courses": 16,
                "total_credits": 46.0,
                "weighted_gpa": 3.11,
                "average_score": 80.0,
                "highest_score": 94.0,
                "lowest_score": 66.0,
                "best_course": "CS102 - Data Structures",
                "weakest_course": "CS101 - Introduction to Programming",
            },
            "semester_performance": [],
            "grade_distribution": [],
            "course_performance": [],
            "credit_summary": {
                "total_credits": 46.0,
                "attempted_courses": 16,
                "average_credits_per_course": 2.88,
            },
            "course_risks": [],
        },
    }
