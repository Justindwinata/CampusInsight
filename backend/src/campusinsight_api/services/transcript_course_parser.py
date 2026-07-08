from __future__ import annotations

import re
from dataclasses import dataclass

from campusinsight_api.domain.academic_records import VALID_GRADE_LETTERS
from campusinsight_api.services.transcript_metadata_parser import ROMAN_SEMESTERS


@dataclass(frozen=True, slots=True)
class TranscriptCourseRecord:
    course_code: str
    course_name: str
    semester: int
    credits: float
    grade_letter: str
    grade_point: float
    credit_weight: float


@dataclass(frozen=True, slots=True)
class TranscriptCourseParseError:
    row_number: int | None
    field: str | None
    message: str


@dataclass(frozen=True, slots=True)
class TranscriptCourseParseResult:
    is_valid: bool
    records: list[TranscriptCourseRecord]
    errors: list[TranscriptCourseParseError]
    row_count: int


COURSE_ROW_PATTERN = re.compile(
    r"^\s*(?P<number>\d+)\s+"
    r"(?P<semester>[IVX]+)\s+"
    r"(?P<course_code>[A-Z]\d{9})"
    r"(?P<course_name>.+?)\s+"
    r"(?P<credits>\d+(?:[.,]\d+)?)\s+"
    r"(?P<grade_letter>A-|B\+|B-|C\+|A|B|C|D|E)\s*"
    r"(?P<grade_point>\d+(?:[.,]\d+)?)\s+"
    r"(?P<credit_weight>\d+(?:[.,]\d+)?)\s*$",
    flags=re.IGNORECASE,
)


def parse_transcript_course_records(text: str) -> TranscriptCourseParseResult:
    records: list[TranscriptCourseRecord] = []
    errors: list[TranscriptCourseParseError] = []

    for line in text.splitlines():
        match = COURSE_ROW_PATTERN.match(line)
        if not match:
            continue

        row_number = int(match.group("number"))
        semester_label = match.group("semester").upper()
        semester = ROMAN_SEMESTERS.get(semester_label)
        grade_letter = match.group("grade_letter").upper()

        if semester is None:
            errors.append(
                TranscriptCourseParseError(
                    row_number=row_number,
                    field="semester",
                    message="Semester label is not supported.",
                )
            )
            continue

        if grade_letter not in VALID_GRADE_LETTERS:
            errors.append(
                TranscriptCourseParseError(
                    row_number=row_number,
                    field="grade_letter",
                    message="Grade letter is not supported.",
                )
            )
            continue

        records.append(
            TranscriptCourseRecord(
                course_code=match.group("course_code").upper(),
                course_name=_clean_course_name(match.group("course_name")),
                semester=semester,
                credits=_parse_number(match.group("credits")),
                grade_letter=grade_letter,
                grade_point=_parse_number(match.group("grade_point")),
                credit_weight=_parse_number(match.group("credit_weight")),
            )
        )

    if not records and not errors:
        errors.append(
            TranscriptCourseParseError(
                row_number=None,
                field="courses",
                message="Course records could not be parsed from the transcript text.",
            )
        )

    return TranscriptCourseParseResult(
        is_valid=not errors and bool(records),
        records=[] if errors else records,
        errors=errors,
        row_count=len(records),
    )


def _parse_number(value: str) -> float:
    return float(value.replace(",", "."))


def _clean_course_name(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()
