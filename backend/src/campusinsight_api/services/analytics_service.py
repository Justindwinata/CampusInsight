from decimal import ROUND_HALF_UP, Decimal

from campusinsight_api.domain.academic_records import AcademicRecord
from campusinsight_api.domain.analytics import (
    CoursePerformanceItem,
    CourseRiskItem,
    CreditSummary,
    GpaSummary,
    GradeDistributionItem,
    SemesterPerformance,
)

GRADE_ORDER = ("A", "A-", "B+", "B", "B-", "C+", "C", "D", "E")


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


def calculate_semester_performance(records: list[AcademicRecord]) -> list[SemesterPerformance]:
    grouped_records: dict[tuple[str, int], list[AcademicRecord]] = {}
    for record in records:
        grouped_records.setdefault((record.academic_year, record.semester), []).append(record)

    performance: list[SemesterPerformance] = []
    for academic_year, semester in sorted(grouped_records):
        semester_records = grouped_records[(academic_year, semester)]
        total_credits = sum(record.credits for record in semester_records)
        weighted_points = sum(record.grade_point * record.credits for record in semester_records)
        average_score = sum(record.score for record in semester_records) / len(semester_records)

        performance.append(
            SemesterPerformance(
                semester=semester,
                academic_year=academic_year,
                course_count=len(semester_records),
                credits=_round_metric(total_credits),
                weighted_gpa=_round_metric(weighted_points / total_credits),
                average_score=_round_metric(average_score),
            )
        )

    return performance


def calculate_grade_distribution(records: list[AcademicRecord]) -> list[GradeDistributionItem]:
    if not records:
        return []

    total_records = len(records)
    distribution: list[GradeDistributionItem] = []
    for grade_letter in GRADE_ORDER:
        count = sum(1 for record in records if record.grade_letter == grade_letter)
        if count == 0:
            continue

        distribution.append(
            GradeDistributionItem(
                grade_letter=grade_letter,
                count=count,
                percentage=_round_metric((count / total_records) * 100),
            )
        )

    return distribution


def calculate_credit_summary(records: list[AcademicRecord]) -> CreditSummary:
    if not records:
        return CreditSummary(total_credits=0.0, attempted_courses=0, average_credits_per_course=0.0)

    total_credits = sum(record.credits for record in records)
    return CreditSummary(
        total_credits=_round_metric(total_credits),
        attempted_courses=len(records),
        average_credits_per_course=_round_metric(total_credits / len(records)),
    )


def calculate_course_performance(records: list[AcademicRecord]) -> list[CoursePerformanceItem]:
    return [
        CoursePerformanceItem(
            course_code=record.course_code,
            course_name=record.course_name,
            credits=_round_metric(record.credits),
            grade_letter=record.grade_letter,
            grade_point=_round_metric(record.grade_point),
            score=_round_metric(record.score),
        )
        for record in records
    ]


def detect_course_risks(records: list[AcademicRecord]) -> list[CourseRiskItem]:
    risks: list[CourseRiskItem] = []
    for record in records:
        reasons = _risk_reasons(record)
        if not reasons:
            continue

        risks.append(
            CourseRiskItem(
                course_code=record.course_code,
                course_name=record.course_name,
                risk_level=_risk_level(record, reasons),
                reasons=reasons,
            )
        )

    return risks


def _risk_reasons(record: AcademicRecord) -> list[str]:
    reasons: list[str] = []
    if record.score < 70:
        reasons.append("Score is below 70.")
    if record.grade_point < 2.5:
        reasons.append("Grade point is below 2.5.")
    if record.grade_letter in {"C", "D", "E"}:
        reasons.append("Grade letter is C, D, or E.")
    if record.credits >= 3 and (record.score < 75 or record.grade_point <= 2.7):
        reasons.append("High-credit course has weak performance indicators.")
    return reasons


def _risk_level(record: AcademicRecord, reasons: list[str]) -> str:
    if record.score < 70 or record.grade_letter in {"D", "E"} or len(reasons) >= 3:
        return "high"
    if record.grade_point < 2.5 or record.grade_letter == "C" or len(reasons) >= 1:
        return "medium"
    return "low"


def _format_course(record: AcademicRecord) -> str:
    return f"{record.course_code} - {record.course_name}"


def _round_metric(value: float) -> float:
    return float(Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
