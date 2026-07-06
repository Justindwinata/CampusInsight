from pathlib import Path

from campusinsight_api.services.analytics_service import (
    calculate_credit_summary,
    calculate_grade_distribution,
    calculate_semester_performance,
)
from campusinsight_api.services.csv_validation import validate_academic_records_csv_file

ROOT_DIR = Path(__file__).resolve().parents[2]
SAMPLE_CSV = ROOT_DIR / "data" / "sample" / "academic_records_sample.csv"


def test_semester_performance_calculates_semester_gpa() -> None:
    records = _sample_records()

    performance = calculate_semester_performance(records)

    assert len(performance) == 2
    assert performance[0].academic_year == "2024/2025"
    assert performance[0].semester == 1
    assert performance[0].course_count == 8
    assert performance[0].credits == 24.0
    assert performance[0].weighted_gpa == 3.15
    assert performance[0].average_score == 79.88


def test_semester_performance_calculates_second_semester_metrics() -> None:
    records = _sample_records()

    performance = calculate_semester_performance(records)

    assert performance[1].semester == 2
    assert performance[1].course_count == 8
    assert performance[1].credits == 22.0
    assert performance[1].weighted_gpa == 3.06
    assert performance[1].average_score == 80.13


def test_grade_distribution_calculates_counts_and_percentages() -> None:
    records = _sample_records()

    distribution = calculate_grade_distribution(records)
    distribution_by_grade = {item.grade_letter: item for item in distribution}

    assert distribution_by_grade["A"].count == 3
    assert distribution_by_grade["A"].percentage == 18.75
    assert distribution_by_grade["B"].count == 3
    assert distribution_by_grade["C"].count == 2
    assert "D" not in distribution_by_grade
    assert "E" not in distribution_by_grade


def test_credit_summary_calculates_credit_totals() -> None:
    records = _sample_records()

    summary = calculate_credit_summary(records)

    assert summary.total_credits == 46.0
    assert summary.attempted_courses == 16
    assert summary.average_credits_per_course == 2.88


def test_distribution_and_credit_summary_handle_empty_records() -> None:
    assert calculate_semester_performance([]) == []
    assert calculate_grade_distribution([]) == []

    credit_summary = calculate_credit_summary([])
    assert credit_summary.total_credits == 0.0
    assert credit_summary.attempted_courses == 0
    assert credit_summary.average_credits_per_course == 0.0


def _sample_records():
    result = validate_academic_records_csv_file(SAMPLE_CSV)
    assert result.is_valid is True
    return result.records
