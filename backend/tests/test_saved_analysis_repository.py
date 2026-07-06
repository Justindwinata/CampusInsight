import sqlite3
from pathlib import Path

import pytest

from campusinsight_api.services.saved_analysis_repository import SavedAnalysisRepository


def test_repository_creates_database_directory_and_table(tmp_path: Path) -> None:
    database_path = tmp_path / "nested" / "database" / "campusinsight.sqlite3"

    SavedAnalysisRepository(database_path)

    assert database_path.exists()
    with sqlite3.connect(database_path) as connection:
        table = connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'saved_analyses'"
        ).fetchone()
    assert table is not None


def test_repository_saves_and_loads_analysis_json(tmp_path: Path) -> None:
    repository = SavedAnalysisRepository(tmp_path / "campusinsight.sqlite3")
    analysis = _analysis_response()

    summary = repository.save(
        analysis_id="analysis-001",
        created_at="2026-07-06T08:00:00+00:00",
        source_filename="/private/path/records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=analysis,
    )
    loaded = repository.get("analysis-001")

    assert summary.analysis_id == "analysis-001"
    assert summary.source_filename == "records.csv"
    assert loaded is not None
    assert loaded.analysis == analysis
    assert loaded.summary.weighted_gpa == 3.11


def test_repository_enforces_unique_analysis_id(tmp_path: Path) -> None:
    repository = SavedAnalysisRepository(tmp_path / "campusinsight.sqlite3")

    repository.save(
        analysis_id="duplicate-id",
        source_filename="records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=_analysis_response(),
    )

    with pytest.raises(sqlite3.IntegrityError):
        repository.save(
            analysis_id="duplicate-id",
            source_filename="records.csv",
            row_count=16,
            total_courses=16,
            weighted_gpa=3.11,
            average_score=80.0,
            analysis=_analysis_response(),
        )


def test_repository_lists_newest_first_and_limits_results(tmp_path: Path) -> None:
    repository = SavedAnalysisRepository(tmp_path / "campusinsight.sqlite3")
    repository.save(
        analysis_id="older",
        created_at="2026-07-06T08:00:00+00:00",
        source_filename="older.csv",
        row_count=3,
        total_courses=3,
        weighted_gpa=2.5,
        average_score=70.0,
        analysis=_analysis_response(),
    )
    repository.save(
        analysis_id="newer",
        created_at="2026-07-06T09:00:00+00:00",
        source_filename="newer.csv",
        row_count=4,
        total_courses=4,
        weighted_gpa=3.5,
        average_score=88.0,
        analysis=_analysis_response(),
    )

    summaries = repository.list(limit=1)

    assert [summary.analysis_id for summary in summaries] == ["newer"]


def test_repository_deletes_saved_analysis(tmp_path: Path) -> None:
    repository = SavedAnalysisRepository(tmp_path / "campusinsight.sqlite3")
    repository.save(
        analysis_id="analysis-to-delete",
        source_filename="records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=_analysis_response(),
    )

    assert repository.delete("analysis-to-delete") is True
    assert repository.get("analysis-to-delete") is None
    assert repository.delete("missing") is False


def test_repository_does_not_store_uploaded_csv_content(tmp_path: Path) -> None:
    database_path = tmp_path / "campusinsight.sqlite3"
    repository = SavedAnalysisRepository(database_path)
    repository.save(
        analysis_id="analysis-002",
        source_filename="records.csv",
        row_count=16,
        total_courses=16,
        weighted_gpa=3.11,
        average_score=80.0,
        analysis=_analysis_response(),
    )

    with sqlite3.connect(database_path) as connection:
        columns = [
            row[1] for row in connection.execute("PRAGMA table_info(saved_analyses)").fetchall()
        ]
        stored_json = connection.execute(
            "SELECT analysis_json FROM saved_analyses WHERE analysis_id = ?",
            ("analysis-002",),
        ).fetchone()[0]

    assert "csv" not in columns
    assert "student_id,student_name" not in stored_json


def _analysis_response() -> dict:
    return {
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
