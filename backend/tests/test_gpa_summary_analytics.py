from pathlib import Path

from campusinsight_api.services.analytics_service import calculate_gpa_summary
from campusinsight_api.services.csv_validation import validate_academic_records_csv_file

ROOT_DIR = Path(__file__).resolve().parents[2]
SAMPLE_CSV = ROOT_DIR / "data" / "sample" / "academic_records_sample.csv"


def test_gpa_summary_calculates_course_and_credit_totals() -> None:
    records = _sample_records()

    summary = calculate_gpa_summary(records)

    assert summary.total_courses == 16
    assert summary.total_credits == 46.0


def test_gpa_summary_calculates_weighted_gpa() -> None:
    records = _sample_records()

    summary = calculate_gpa_summary(records)

    assert summary.weighted_gpa == 3.11


def test_gpa_summary_calculates_score_statistics() -> None:
    records = _sample_records()

    summary = calculate_gpa_summary(records)

    assert summary.average_score == 80.0
    assert summary.highest_score == 94.0
    assert summary.lowest_score == 66.0


def test_gpa_summary_detects_best_and_weakest_courses() -> None:
    records = _sample_records()

    summary = calculate_gpa_summary(records)

    assert summary.best_course == "CS102 - Data Structures"
    assert summary.weakest_course == "CS101 - Introduction to Programming"


def test_gpa_summary_handles_empty_records() -> None:
    summary = calculate_gpa_summary([])

    assert summary.total_courses == 0
    assert summary.total_credits == 0.0
    assert summary.weighted_gpa == 0.0
    assert summary.best_course is None
    assert summary.weakest_course is None


def _sample_records():
    result = validate_academic_records_csv_file(SAMPLE_CSV)
    assert result.is_valid is True
    return result.records
