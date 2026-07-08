from __future__ import annotations

from dataclasses import dataclass

from campusinsight_api.domain.academic_records import AcademicRecord
from campusinsight_api.services.transcript_course_parser import TranscriptCourseRecord
from campusinsight_api.services.transcript_metadata_parser import TranscriptMetadata


@dataclass(frozen=True, slots=True)
class TranscriptNormalizationError:
    field: str | None
    message: str


@dataclass(frozen=True, slots=True)
class TranscriptNormalizationResult:
    is_valid: bool
    records: list[AcademicRecord]
    errors: list[TranscriptNormalizationError]
    row_count: int


def normalize_transcript_records(
    *,
    metadata: TranscriptMetadata | None,
    course_records: list[TranscriptCourseRecord],
    academic_year: str = "PDF Transcript",
) -> TranscriptNormalizationResult:
    errors: list[TranscriptNormalizationError] = []

    if metadata is None:
        errors.append(
            TranscriptNormalizationError(
                field="metadata",
                message="Transcript metadata is required before normalization.",
            )
        )

    if not course_records:
        errors.append(
            TranscriptNormalizationError(
                field="courses",
                message="At least one transcript course is required before normalization.",
            )
        )

    if errors:
        return TranscriptNormalizationResult(
            is_valid=False,
            records=[],
            errors=errors,
            row_count=0,
        )

    assert metadata is not None
    records = [
        AcademicRecord(
            student_id=metadata.student_id,
            student_name=metadata.student_name,
            semester=course.semester,
            academic_year=academic_year,
            course_code=course.course_code,
            course_name=course.course_name,
            credits=course.credits,
            grade_letter=course.grade_letter,
            grade_point=course.grade_point,
            score=_score_from_grade_point(course.grade_point),
        )
        for course in course_records
    ]

    return TranscriptNormalizationResult(
        is_valid=True,
        records=records,
        errors=[],
        row_count=len(records),
    )


def _score_from_grade_point(grade_point: float) -> float:
    return round(max(0.0, min(grade_point, 4.0)) * 25, 2)
