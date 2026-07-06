from datetime import UTC, datetime

from campusinsight_api.domain.saved_analysis import SavedAnalysis, SavedAnalysisSummary
from campusinsight_api.services.html_report_service import render_saved_analysis_html_report


def test_report_renderer_returns_html_string() -> None:
    html = render_saved_analysis_html_report(_saved_analysis())

    assert isinstance(html, str)
    assert html.startswith("<!doctype html>")
    assert "<html" in html


def test_report_includes_key_academic_sections() -> None:
    html = render_saved_analysis_html_report(_saved_analysis())

    assert "CampusInsight Academic Report" in html
    assert "Report Metadata" in html
    assert "GPA Summary" in html
    assert "Credit Summary" in html
    assert "Semester Performance" in html
    assert "Grade Distribution" in html
    assert "Course Performance" in html
    assert "Course Risk Review" in html
    assert "Limitations and Safety Notes" in html


def test_report_escapes_unsafe_values() -> None:
    html = render_saved_analysis_html_report(
        _saved_analysis(source_filename='<script>alert("x")</script>.csv')
    )

    assert "<script>" not in html
    assert "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;.csv" in html


def test_report_handles_missing_optional_fields_safely() -> None:
    saved_analysis = SavedAnalysis(
        summary=SavedAnalysisSummary(
            analysis_id="analysis-001",
            created_at="2026-07-06T08:00:00+00:00",
            source_filename="records.csv",
            row_count=1,
            total_courses=1,
            weighted_gpa=3.0,
            average_score=80.0,
        ),
        analysis={"analysis_id": "analysis-001", "is_valid": True, "validation": {}, "analytics": {}},
    )

    html = render_saved_analysis_html_report(saved_analysis)

    assert "Not available" in html
    assert "No saved records available." in html
    assert "Traceback" not in html


def test_report_does_not_include_external_script_tags() -> None:
    html = render_saved_analysis_html_report(_saved_analysis())

    assert "<script" not in html.lower()
    assert "src=" not in html.lower()
    assert "http://" not in html.lower()
    assert "https://" not in html.lower()


def test_report_does_not_expose_stack_traces_or_prediction_claims() -> None:
    html = render_saved_analysis_html_report(_saved_analysis())

    assert "Traceback" not in html
    assert "sqlite" not in html.lower()
    assert "student_id,student_name" not in html
    assert "will fail" not in html.lower()
    assert "predict academic outcomes" in html


def test_report_uses_generated_timestamp() -> None:
    html = render_saved_analysis_html_report(
        _saved_analysis(),
        generated_at=datetime(2026, 7, 7, 2, 30, tzinfo=UTC),
    )

    assert "2026-07-07T02:30:00+00:00" in html


def _saved_analysis(source_filename: str = "records.csv") -> SavedAnalysis:
    return SavedAnalysis(
        summary=SavedAnalysisSummary(
            analysis_id="analysis-001",
            created_at="2026-07-06T08:00:00+00:00",
            source_filename=source_filename,
            row_count=16,
            total_courses=16,
            weighted_gpa=3.11,
            average_score=80.0,
        ),
        analysis={
            "analysis_id": "analysis-001",
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
                "semester_performance": [
                    {
                        "semester": 1,
                        "academic_year": "2024/2025",
                        "course_count": 8,
                        "credits": 24.0,
                        "weighted_gpa": 3.15,
                        "average_score": 79.88,
                    }
                ],
                "grade_distribution": [{"grade_letter": "A", "count": 3, "percentage": 18.75}],
                "course_performance": [
                    {
                        "course_code": "CS101",
                        "course_name": "Introduction to Programming",
                        "credits": 3.0,
                        "grade_letter": "A",
                        "grade_point": 4.0,
                        "score": 91.0,
                    }
                ],
                "credit_summary": {
                    "total_credits": 46.0,
                    "attempted_courses": 16,
                    "average_credits_per_course": 2.88,
                },
                "course_risks": [
                    {
                        "course_code": "CS101",
                        "course_name": "Introduction to Programming",
                        "risk_level": "high",
                        "reasons": ["Score is below 70."],
                    }
                ],
            },
        },
    )
