from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class GpaSummary:
    total_courses: int
    total_credits: float
    weighted_gpa: float
    average_score: float
    highest_score: float
    lowest_score: float
    best_course: str | None
    weakest_course: str | None


@dataclass(frozen=True, slots=True)
class SemesterPerformance:
    semester: int
    academic_year: str
    course_count: int
    credits: float
    weighted_gpa: float
    average_score: float


@dataclass(frozen=True, slots=True)
class GradeDistributionItem:
    grade_letter: str
    count: int
    percentage: float


@dataclass(frozen=True, slots=True)
class CoursePerformanceItem:
    course_code: str
    course_name: str
    credits: float
    grade_letter: str
    grade_point: float
    score: float


@dataclass(frozen=True, slots=True)
class CreditSummary:
    total_credits: float
    attempted_courses: int
    average_credits_per_course: float


@dataclass(frozen=True, slots=True)
class CourseRiskItem:
    course_code: str
    course_name: str
    risk_level: str
    reasons: list[str]


@dataclass(frozen=True, slots=True)
class AcademicAnalyticsResult:
    gpa_summary: GpaSummary
    semester_performance: list[SemesterPerformance]
    grade_distribution: list[GradeDistributionItem]
    course_performance: list[CoursePerformanceItem]
    credit_summary: CreditSummary
    course_risks: list[CourseRiskItem]
