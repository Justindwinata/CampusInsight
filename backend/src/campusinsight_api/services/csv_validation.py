from __future__ import annotations

import csv
import re
from dataclasses import dataclass
from io import StringIO
from pathlib import Path

from campusinsight_api.domain.academic_records import (
    ACADEMIC_RECORD_COLUMNS,
    VALID_GRADE_LETTERS,
    AcademicRecord,
)

ACADEMIC_YEAR_PATTERN = re.compile(r"^\d{4}/\d{4}$")


@dataclass(frozen=True, slots=True)
class ValidationError:
    row_number: int | None
    field: str | None
    message: str


@dataclass(frozen=True, slots=True)
class CsvValidationResult:
    is_valid: bool
    records: list[AcademicRecord]
    errors: list[ValidationError]
    row_count: int


def validate_academic_records_csv_file(file_path: str | Path) -> CsvValidationResult:
    try:
        csv_content = Path(file_path).read_text(encoding="utf-8")
    except OSError:
        return CsvValidationResult(
            is_valid=False,
            records=[],
            errors=[
                ValidationError(
                    row_number=None,
                    field=None,
                    message="CSV file could not be read.",
                )
            ],
            row_count=0,
        )

    return validate_academic_records_csv_content(csv_content)


def validate_academic_records_csv_content(csv_content: str) -> CsvValidationResult:
    try:
        reader = csv.DictReader(StringIO(csv_content))
        fieldnames = reader.fieldnames
    except csv.Error:
        return _file_error("CSV content could not be parsed.")

    if not fieldnames:
        return _file_error("CSV must include a header row.")

    schema_errors = _validate_columns(fieldnames)
    if schema_errors:
        return CsvValidationResult(is_valid=False, records=[], errors=schema_errors, row_count=0)

    errors: list[ValidationError] = []
    records: list[AcademicRecord] = []
    row_count = 0

    try:
        for row_offset, row in enumerate(reader, start=2):
            row_count += 1

            if None in row:
                errors.append(
                    ValidationError(
                        row_number=row_offset,
                        field=None,
                        message="Row contains more values than the academic record schema allows.",
                    )
                )
                continue

            record, row_errors = _validate_row(row, row_offset)
            errors.extend(row_errors)
            if record and not row_errors:
                records.append(record)
    except csv.Error:
        return _file_error("CSV content could not be parsed.")

    if row_count == 0:
        errors.append(
            ValidationError(
                row_number=None,
                field=None,
                message="CSV must contain at least one academic record.",
            )
        )

    if errors:
        return CsvValidationResult(is_valid=False, records=[], errors=errors, row_count=row_count)

    return CsvValidationResult(is_valid=True, records=records, errors=[], row_count=row_count)


def _validate_columns(fieldnames: list[str]) -> list[ValidationError]:
    errors: list[ValidationError] = []
    provided_columns = set(fieldnames)
    required_columns = set(ACADEMIC_RECORD_COLUMNS)

    missing_columns = sorted(required_columns - provided_columns)
    extra_columns = sorted(provided_columns - required_columns)

    for column in missing_columns:
        errors.append(
            ValidationError(
                row_number=None,
                field=column,
                message=f"Required column '{column}' is missing.",
            )
        )

    for column in extra_columns:
        errors.append(
            ValidationError(
                row_number=None,
                field=column,
                message=f"Unknown column '{column}' is not allowed.",
            )
        )

    return errors


def _validate_row(
    row: dict[str, str],
    row_number: int,
) -> tuple[AcademicRecord | None, list[ValidationError]]:
    errors: list[ValidationError] = []

    cleaned = {field: _clean_value(row.get(field)) for field in ACADEMIC_RECORD_COLUMNS}
    for field, value in cleaned.items():
        if value == "":
            errors.append(
                ValidationError(
                    row_number=row_number,
                    field=field,
                    message=f"'{field}' is required.",
                )
            )

    semester = _parse_positive_int(cleaned["semester"], "semester", row_number, errors)
    credits = _parse_positive_float(cleaned["credits"], "credits", row_number, errors)
    grade_point = _parse_float_in_range(
        cleaned["grade_point"],
        "grade_point",
        row_number,
        errors,
        minimum=0.0,
        maximum=4.0,
    )
    score = _parse_float_in_range(
        cleaned["score"],
        "score",
        row_number,
        errors,
        minimum=0.0,
        maximum=100.0,
    )

    if cleaned["grade_letter"] and cleaned["grade_letter"] not in VALID_GRADE_LETTERS:
        errors.append(
            ValidationError(
                row_number=row_number,
                field="grade_letter",
                message="grade_letter must be one of: A, A-, B+, B, B-, C+, C, D, E.",
            )
        )

    if cleaned["academic_year"] and not ACADEMIC_YEAR_PATTERN.fullmatch(cleaned["academic_year"]):
        errors.append(
            ValidationError(
                row_number=row_number,
                field="academic_year",
                message="academic_year must use the format YYYY/YYYY, such as 2024/2025.",
            )
        )

    if errors or semester is None or credits is None or grade_point is None or score is None:
        return None, errors

    return (
        AcademicRecord(
            student_id=cleaned["student_id"],
            student_name=cleaned["student_name"],
            semester=semester,
            academic_year=cleaned["academic_year"],
            course_code=cleaned["course_code"],
            course_name=cleaned["course_name"],
            credits=credits,
            grade_letter=cleaned["grade_letter"],
            grade_point=grade_point,
            score=score,
        ),
        errors,
    )


def _clean_value(value: str | None) -> str:
    return "" if value is None else value.strip()


def _parse_positive_int(
    value: str,
    field: str,
    row_number: int,
    errors: list[ValidationError],
) -> int | None:
    if value == "":
        return None

    try:
        parsed = int(value)
    except ValueError:
        errors.append(
            ValidationError(
                row_number=row_number,
                field=field,
                message=f"{field} must be a positive integer.",
            )
        )
        return None

    if parsed <= 0:
        errors.append(
            ValidationError(
                row_number=row_number,
                field=field,
                message=f"{field} must be a positive integer.",
            )
        )
        return None

    return parsed


def _parse_positive_float(
    value: str,
    field: str,
    row_number: int,
    errors: list[ValidationError],
) -> float | None:
    if value == "":
        return None

    try:
        parsed = float(value)
    except ValueError:
        errors.append(
            ValidationError(
                row_number=row_number,
                field=field,
                message=f"{field} must be a positive number.",
            )
        )
        return None

    if parsed <= 0:
        errors.append(
            ValidationError(
                row_number=row_number,
                field=field,
                message=f"{field} must be a positive number.",
            )
        )
        return None

    return parsed


def _parse_float_in_range(
    value: str,
    field: str,
    row_number: int,
    errors: list[ValidationError],
    *,
    minimum: float,
    maximum: float,
) -> float | None:
    if value == "":
        return None

    try:
        parsed = float(value)
    except ValueError:
        errors.append(
            ValidationError(
                row_number=row_number,
                field=field,
                message=f"{field} must be between {minimum:g} and {maximum:g}.",
            )
        )
        return None

    if parsed < minimum or parsed > maximum:
        errors.append(
            ValidationError(
                row_number=row_number,
                field=field,
                message=f"{field} must be between {minimum:g} and {maximum:g}.",
            )
        )
        return None

    return parsed


def _file_error(message: str) -> CsvValidationResult:
    return CsvValidationResult(
        is_valid=False,
        records=[],
        errors=[ValidationError(row_number=None, field=None, message=message)],
        row_count=0,
    )
