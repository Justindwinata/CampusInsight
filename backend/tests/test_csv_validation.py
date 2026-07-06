from pathlib import Path

from campusinsight_api.services.csv_validation import (
    validate_academic_records_csv_content,
    validate_academic_records_csv_file,
)

ROOT_DIR = Path(__file__).resolve().parents[2]
SAMPLE_CSV = ROOT_DIR / "data" / "sample" / "academic_records_sample.csv"
FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_valid_sample_csv_passes() -> None:
    result = validate_academic_records_csv_file(SAMPLE_CSV)

    assert result.is_valid is True
    assert result.errors == []
    assert result.row_count == 16
    assert len(result.records) == 16
    assert result.records[0].student_id == "S1001"


def test_missing_required_column_fails() -> None:
    result = validate_academic_records_csv_file(FIXTURES_DIR / "invalid_missing_column.csv")

    assert result.is_valid is False
    assert result.records == []
    assert any(error.field == "score" for error in result.errors)


def test_unknown_extra_column_fails() -> None:
    csv_content = (
        "student_id,student_name,semester,academic_year,course_code,course_name,credits,"
        "grade_letter,grade_point,score,advisor\n"
        "S2001,Nadia Kirana,1,2024/2025,CS101,Introduction to Programming,3,A,4.0,91,"
        "Dr Fictional\n"
    )

    result = validate_academic_records_csv_content(csv_content)

    assert result.is_valid is False
    assert any(error.field == "advisor" for error in result.errors)


def test_empty_csv_fails() -> None:
    result = validate_academic_records_csv_file(FIXTURES_DIR / "invalid_empty.csv")

    assert result.is_valid is False
    assert result.row_count == 0
    assert result.errors[0].row_number is None
    assert "at least one academic record" in result.errors[0].message


def test_invalid_semester_fails() -> None:
    result = validate_academic_records_csv_content(_single_row_csv(semester="0"))

    assert _has_field_error(result, "semester")


def test_invalid_credits_fails() -> None:
    result = validate_academic_records_csv_content(_single_row_csv(credits="0"))

    assert _has_field_error(result, "credits")


def test_invalid_grade_letter_fails() -> None:
    result = validate_academic_records_csv_content(_single_row_csv(grade_letter="F"))

    assert _has_field_error(result, "grade_letter")


def test_invalid_grade_point_fails() -> None:
    result = validate_academic_records_csv_content(_single_row_csv(grade_point="4.1"))

    assert _has_field_error(result, "grade_point")


def test_invalid_score_fails() -> None:
    result = validate_academic_records_csv_content(_single_row_csv(score="101"))

    assert _has_field_error(result, "score")


def test_invalid_academic_year_fails() -> None:
    result = validate_academic_records_csv_content(_single_row_csv(academic_year="2024-2025"))

    assert _has_field_error(result, "academic_year")


def test_empty_required_values_fail() -> None:
    result = validate_academic_records_csv_content(_single_row_csv(student_name=" "))

    assert _has_field_error(result, "student_name")


def test_multiple_row_errors_are_collected() -> None:
    result = validate_academic_records_csv_file(FIXTURES_DIR / "invalid_bad_values.csv")

    error_fields = {(error.row_number, error.field) for error in result.errors}
    assert result.is_valid is False
    assert (2, "semester") in error_fields
    assert (2, "academic_year") in error_fields
    assert (3, "credits") in error_fields
    assert (3, "grade_letter") in error_fields
    assert (3, "grade_point") in error_fields
    assert (3, "score") in error_fields
    assert (4, "semester") in error_fields
    assert (4, "score") in error_fields


def test_validation_result_does_not_expose_stack_traces() -> None:
    result = validate_academic_records_csv_file(Path("does-not-exist.csv"))

    messages = " ".join(error.message for error in result.errors)
    assert result.is_valid is False
    assert "Traceback" not in messages
    assert "FileNotFoundError" not in messages
    assert "No such file" not in messages


def _has_field_error(result, field: str) -> bool:
    return not result.is_valid and any(error.field == field for error in result.errors)


def _single_row_csv(**overrides: str) -> str:
    row = {
        "student_id": "S2001",
        "student_name": "Nadia Kirana",
        "semester": "1",
        "academic_year": "2024/2025",
        "course_code": "CS101",
        "course_name": "Introduction to Programming",
        "credits": "3",
        "grade_letter": "A",
        "grade_point": "4.0",
        "score": "91",
    }
    row.update(overrides)
    header = ",".join(row)
    values = ",".join(row.values())
    return f"{header}\n{values}\n"
