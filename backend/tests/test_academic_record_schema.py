from campusinsight_api.domain.academic_records import (
    ACADEMIC_RECORD_COLUMNS,
    VALID_GRADE_LETTERS,
    AcademicRecord,
)


def test_academic_record_schema_defines_required_columns() -> None:
    assert ACADEMIC_RECORD_COLUMNS == (
        "student_id",
        "student_name",
        "semester",
        "academic_year",
        "course_code",
        "course_name",
        "credits",
        "grade_letter",
        "grade_point",
        "score",
    )


def test_academic_record_model_represents_one_record() -> None:
    record = AcademicRecord(
        student_id="S1001",
        student_name="Alya Prameswari",
        semester=1,
        academic_year="2024/2025",
        course_code="CS101",
        course_name="Introduction to Programming",
        credits=3.0,
        grade_letter="A",
        grade_point=4.0,
        score=91.0,
    )

    assert record.student_id == "S1001"
    assert record.semester == 1
    assert record.credits == 3.0
    assert record.grade_letter in VALID_GRADE_LETTERS
