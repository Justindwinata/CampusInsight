from pathlib import Path

from campusinsight_api.services.analytics_service import (
    calculate_course_performance,
    detect_course_risks,
)
from campusinsight_api.services.csv_validation import validate_academic_records_csv_file

ROOT_DIR = Path(__file__).resolve().parents[2]
SAMPLE_CSV = ROOT_DIR / "data" / "sample" / "academic_records_sample.csv"


def test_course_performance_returns_one_item_per_record() -> None:
    records = _sample_records()

    performance = calculate_course_performance(records)

    assert len(performance) == 16
    assert performance[0].course_code == "CS101"
    assert performance[0].credits == 3.0
    assert performance[0].grade_point == 4.0
    assert performance[0].score == 91.0


def test_course_risk_detection_flags_low_scores_and_grade_points() -> None:
    records = _sample_records()

    risks = detect_course_risks(records)
    high_risks = [
        risk
        for risk in risks
        if risk.course_code == "CS101" and risk.course_name.endswith("Programming")
    ]

    assert any(risk.risk_level == "high" for risk in high_risks)
    assert any("Score is below 70." in risk.reasons for risk in high_risks)
    assert any("Grade point is below 2.5." in risk.reasons for risk in high_risks)


def test_course_risk_detection_flags_grade_letter_c_d_or_e() -> None:
    records = _sample_records()

    risks = detect_course_risks(records)

    assert any("Grade letter is C, D, or E." in risk.reasons for risk in risks)


def test_course_risk_detection_flags_high_credit_weak_performance() -> None:
    records = _sample_records()

    risks = detect_course_risks(records)

    assert any(
        "High-credit course has weak performance indicators." in risk.reasons for risk in risks
    )


def test_course_risk_detection_uses_deterministic_levels() -> None:
    records = _sample_records()

    risks = detect_course_risks(records)
    risk_levels = {risk.risk_level for risk in risks}

    assert risk_levels <= {"low", "medium", "high"}
    assert "high" in risk_levels
    assert "medium" in risk_levels


def test_course_risk_detection_handles_empty_records() -> None:
    assert calculate_course_performance([]) == []
    assert detect_course_risks([]) == []


def _sample_records():
    result = validate_academic_records_csv_file(SAMPLE_CSV)
    assert result.is_valid is True
    return result.records
