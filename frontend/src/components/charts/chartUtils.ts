import {
  CoursePerformanceItem,
  GradeDistributionItem,
  SemesterPerformance,
} from "../../services/academicRecordsService";

export type SemesterChartDatum = {
  label: string;
  gpa: number;
  averageScore: number;
  credits: number;
};

export type GradeChartDatum = {
  grade: string;
  count: number;
  percentage: number;
};

export type CourseScoreChartDatum = {
  courseCode: string;
  courseName: string;
  score: number;
  gradePoint: number;
};

export function toSemesterChartData(
  semesters: SemesterPerformance[],
): SemesterChartDatum[] {
  return semesters.map((semester) => ({
    label: `${semester.academic_year} S${semester.semester}`,
    gpa: semester.weighted_gpa,
    averageScore: semester.average_score,
    credits: semester.credits,
  }));
}

export function toGradeDistributionChartData(
  grades: GradeDistributionItem[],
): GradeChartDatum[] {
  return grades.map((grade) => ({
    grade: grade.grade_letter,
    count: grade.count,
    percentage: grade.percentage,
  }));
}

export function toCourseScoreChartData(
  courses: CoursePerformanceItem[],
  maxItems = 12,
): CourseScoreChartDatum[] {
  return courses.slice(0, maxItems).map((course) => ({
    courseCode: course.course_code,
    courseName: course.course_name,
    score: course.score,
    gradePoint: course.grade_point,
  }));
}
