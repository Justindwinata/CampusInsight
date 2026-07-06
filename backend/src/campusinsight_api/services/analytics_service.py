from campusinsight_api.domain.academic_records import AcademicRecord
from campusinsight_api.domain.analytics import GpaSummary


def calculate_gpa_summary(records: list[AcademicRecord]) -> GpaSummary:
    if not records:
        return GpaSummary(
            total_courses=0,
            total_credits=0.0,
            weighted_gpa=0.0,
            average_score=0.0,
            highest_score=0.0,
            lowest_score=0.0,
            best_course=None,
            weakest_course=None,
        )

    total_credits = sum(record.credits for record in records)
    weighted_points = sum(record.grade_point * record.credits for record in records)
    scores = [record.score for record in records]
    best_record = max(records, key=lambda record: (record.score, record.grade_point))
    weakest_record = min(records, key=lambda record: (record.score, record.grade_point))

    return GpaSummary(
        total_courses=len(records),
        total_credits=_round_metric(total_credits),
        weighted_gpa=_round_metric(weighted_points / total_credits),
        average_score=_round_metric(sum(scores) / len(scores)),
        highest_score=_round_metric(max(scores)),
        lowest_score=_round_metric(min(scores)),
        best_course=_format_course(best_record),
        weakest_course=_format_course(weakest_record),
    )


def _format_course(record: AcademicRecord) -> str:
    return f"{record.course_code} - {record.course_name}"


def _round_metric(value: float) -> float:
    return round(value, 2)
