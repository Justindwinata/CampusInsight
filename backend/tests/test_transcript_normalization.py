from campusinsight_api.services.analytics_service import calculate_academic_analytics
from campusinsight_api.services.transcript_course_parser import (
    TranscriptCourseRecord,
)
from campusinsight_api.services.transcript_metadata_parser import TranscriptMetadata
from campusinsight_api.services.transcript_normalization import normalize_transcript_records


def test_normalize_transcript_records_to_academic_records() -> None:
    result = normalize_transcript_records(
        metadata=_metadata(),
        course_records=[
            TranscriptCourseRecord(
                course_code="F062100001",
                course_name="DASAR KEAMANAN KOMPUTER",
                semester=1,
                credits=3.0,
                grade_letter="A",
                grade_point=4.0,
                credit_weight=12.0,
            )
        ],
    )

    assert result.is_valid is True
    assert result.row_count == 1
    assert result.errors == []
    assert result.records[0].student_id == "TST23010001"
    assert result.records[0].student_name == "ALEX PRATAMA"
    assert result.records[0].course_code == "F062100001"
    assert result.records[0].academic_year == "PDF Transcript"
    assert result.records[0].score == 100.0


def test_normalized_pdf_records_can_use_existing_analytics_engine() -> None:
    result = normalize_transcript_records(
        metadata=_metadata(),
        course_records=[
            TranscriptCourseRecord(
                course_code="F062100001",
                course_name="DASAR KEAMANAN KOMPUTER",
                semester=1,
                credits=3.0,
                grade_letter="A",
                grade_point=4.0,
                credit_weight=12.0,
            ),
            TranscriptCourseRecord(
                course_code="W152100004",
                course_name="MATEMATIKA DISKRIT",
                semester=2,
                credits=3.0,
                grade_letter="B+",
                grade_point=3.5,
                credit_weight=10.5,
            ),
        ],
    )

    analytics = calculate_academic_analytics(result.records)

    assert analytics.gpa_summary.total_courses == 2
    assert analytics.gpa_summary.total_credits == 6.0
    assert analytics.gpa_summary.weighted_gpa == 3.75
    assert analytics.gpa_summary.average_score == 93.75
    assert len(analytics.semester_performance) == 2
    assert analytics.course_performance[1].course_name == "MATEMATIKA DISKRIT"


def test_normalize_transcript_records_requires_metadata() -> None:
    result = normalize_transcript_records(metadata=None, course_records=_course_records())

    assert result.is_valid is False
    assert result.records == []
    assert result.errors[0].field == "metadata"


def test_normalize_transcript_records_requires_courses() -> None:
    result = normalize_transcript_records(metadata=_metadata(), course_records=[])

    assert result.is_valid is False
    assert result.records == []
    assert result.errors[0].field == "courses"


def test_normalize_transcript_records_does_not_expose_stack_traces() -> None:
    result = normalize_transcript_records(metadata=None, course_records=[])
    response_text = str(result)

    assert "Traceback" not in response_text
    assert "AssertionError" not in response_text


def _metadata() -> TranscriptMetadata:
    return TranscriptMetadata(
        student_name="ALEX PRATAMA",
        student_id="TST23010001",
        faculty="Ilmu Komputer",
        study_program="Teknik Informatika",
        semesters=[],
    )


def _course_records() -> list[TranscriptCourseRecord]:
    return [
        TranscriptCourseRecord(
            course_code="F062100001",
            course_name="DASAR KEAMANAN KOMPUTER",
            semester=1,
            credits=3.0,
            grade_letter="A",
            grade_point=4.0,
            credit_weight=12.0,
        )
    ]
