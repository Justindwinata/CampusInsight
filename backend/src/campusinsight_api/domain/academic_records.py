from dataclasses import dataclass

ACADEMIC_RECORD_COLUMNS = (
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

VALID_GRADE_LETTERS = frozenset({"A", "A-", "B+", "B", "B-", "C+", "C", "D", "E"})


@dataclass(frozen=True, slots=True)
class AcademicRecord:
    student_id: str
    student_name: str
    semester: int
    academic_year: str
    course_code: str
    course_name: str
    credits: float
    grade_letter: str
    grade_point: float
    score: float
