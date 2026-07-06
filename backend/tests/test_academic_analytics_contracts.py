from campusinsight_api.domain.analytics import (
    AcademicAnalyticsResult,
    CoursePerformanceItem,
    CourseRiskItem,
    CreditSummary,
    GpaSummary,
    GradeDistributionItem,
    SemesterPerformance,
)


def test_gpa_summary_contract_represents_summary_metrics() -> None:
    summary = GpaSummary(
        total_courses=2,
        total_credits=6.0,
        weighted_gpa=3.75,
        average_score=88.5,
        highest_score=92.0,
        lowest_score=85.0,
        best_course="CS101",
        weakest_course="MTH101",
    )

    assert summary.total_courses == 2
    assert summary.weighted_gpa == 3.75
    assert summary.best_course == "CS101"


def test_academic_analytics_result_contract_groups_all_sections() -> None:
    result = AcademicAnalyticsResult(
        gpa_summary=GpaSummary(
            total_courses=1,
            total_credits=3.0,
            weighted_gpa=4.0,
            average_score=91.0,
            highest_score=91.0,
            lowest_score=91.0,
            best_course="CS101",
            weakest_course="CS101",
        ),
        semester_performance=[
            SemesterPerformance(
                semester=1,
                academic_year="2024/2025",
                course_count=1,
                credits=3.0,
                weighted_gpa=4.0,
                average_score=91.0,
            )
        ],
        grade_distribution=[GradeDistributionItem(grade_letter="A", count=1, percentage=100.0)],
        course_performance=[
            CoursePerformanceItem(
                course_code="CS101",
                course_name="Introduction to Programming",
                credits=3.0,
                grade_letter="A",
                grade_point=4.0,
                score=91.0,
            )
        ],
        credit_summary=CreditSummary(
            total_credits=3.0,
            attempted_courses=1,
            average_credits_per_course=3.0,
        ),
        course_risks=[
            CourseRiskItem(
                course_code="CS101",
                course_name="Introduction to Programming",
                risk_level="low",
                reasons=[],
            )
        ],
    )

    assert result.gpa_summary.total_courses == 1
    assert result.semester_performance[0].semester == 1
    assert result.grade_distribution[0].grade_letter == "A"
    assert result.course_performance[0].course_code == "CS101"
    assert result.credit_summary.total_credits == 3.0
    assert result.course_risks[0].risk_level == "low"
