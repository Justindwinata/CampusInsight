import { describe, expect, it } from "vitest";

import {
  toCourseScoreChartData,
  toGradeDistributionChartData,
  toSemesterChartData,
} from "./chartUtils";

describe("chartUtils", () => {
  it("shapes semester performance data for charts", () => {
    const data = toSemesterChartData([
      {
        semester: 1,
        academic_year: "2024/2025",
        course_count: 8,
        credits: 24,
        weighted_gpa: 3.15,
        average_score: 79.88,
      },
    ]);

    expect(data).toEqual([
      {
        label: "2024/2025 S1",
        gpa: 3.15,
        averageScore: 79.88,
        credits: 24,
      },
    ]);
  });

  it("shapes grade distribution data for charts", () => {
    const data = toGradeDistributionChartData([{ grade_letter: "A", count: 3, percentage: 18.75 }]);

    expect(data).toEqual([{ grade: "A", count: 3, percentage: 18.75 }]);
  });

  it("shapes and limits course score chart data", () => {
    const data = toCourseScoreChartData(
      [
        {
          course_code: "CS101",
          course_name: "Introduction to Programming",
          credits: 3,
          grade_letter: "A",
          grade_point: 4,
          score: 91,
        },
        {
          course_code: "MTH101",
          course_name: "Discrete Mathematics",
          credits: 3,
          grade_letter: "B+",
          grade_point: 3.5,
          score: 84,
        },
      ],
      1,
    );

    expect(data).toEqual([
      {
        courseCode: "CS101",
        courseName: "Introduction to Programming",
        score: 91,
        gradePoint: 4,
      },
    ]);
  });
});
