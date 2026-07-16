import { AcademicAnalytics } from "../../services/academicRecordsService";

type AcademicTablesProps = {
  analytics: AcademicAnalytics;
};

function AcademicTables({ analytics }: AcademicTablesProps) {
  const { semester_performance, grade_distribution, course_performance } = analytics;

  return (
    <section className="analytics-section" aria-labelledby="analytics-tables-title">
      <div className="section-heading dashboard-heading">
        <p className="eyebrow">Detailed Records</p>
        <h2 id="analytics-tables-title">Academic analytics tables</h2>
        <p className="section-copy">
          Tables provide the full accessible record view behind the summary cards and charts.
        </p>
      </div>

      <div className="table-section" aria-labelledby="semester-performance-title">
        <div className="table-section-heading">
          <span>Performance Trends</span>
          <h3 id="semester-performance-title">Semester Performance</h3>
        </div>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">
              Semester performance table with GPA, average score, and credits.
            </caption>
            <thead>
              <tr>
                <th scope="col">Semester</th>
                <th scope="col">Academic year</th>
                <th scope="col">GPA</th>
                <th scope="col">Average score</th>
                <th scope="col">Credits</th>
              </tr>
            </thead>
            <tbody>
              {semester_performance.length > 0 ? (
                semester_performance.map((semester) => (
                  <tr key={`${semester.academic_year}-${semester.semester}`}>
                    <td>{semester.semester}</td>
                    <td>{semester.academic_year}</td>
                    <td>{semester.weighted_gpa}</td>
                    <td>{semester.average_score}</td>
                    <td>{semester.credits}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="table-empty-cell" colSpan={5}>
                    No semester performance rows were returned for this analysis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section" aria-labelledby="grade-distribution-title">
        <div className="table-section-heading">
          <span>Grade Distribution</span>
          <h3 id="grade-distribution-title">Grade Distribution</h3>
        </div>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">
              Grade distribution table with grade letters, course counts, and percentages.
            </caption>
            <thead>
              <tr>
                <th scope="col">Grade letter</th>
                <th scope="col">Count</th>
                <th scope="col">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {grade_distribution.length > 0 ? (
                grade_distribution.map((grade) => (
                  <tr key={grade.grade_letter}>
                    <td>{grade.grade_letter}</td>
                    <td>{grade.count}</td>
                    <td>{grade.percentage}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="table-empty-cell" colSpan={3}>
                    No grade distribution rows were returned for this analysis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section" aria-labelledby="course-performance-title">
        <div className="table-section-heading">
          <span>Course Performance</span>
          <h3 id="course-performance-title">Course Performance</h3>
        </div>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">
              Course performance table with course names, credits, grades, and scores.
            </caption>
            <thead>
              <tr>
                <th scope="col">Course code</th>
                <th scope="col">Course name</th>
                <th scope="col">Credits</th>
                <th scope="col">Grade letter</th>
                <th scope="col">Grade point</th>
                <th scope="col">Score</th>
              </tr>
            </thead>
            <tbody>
              {course_performance.length > 0 ? (
                course_performance.map((course, index) => (
                  <tr key={`${course.course_code}-${index}`}>
                    <td>{course.course_code}</td>
                    <td>{course.course_name}</td>
                    <td>{course.credits}</td>
                    <td>{course.grade_letter}</td>
                    <td>{course.grade_point}</td>
                    <td>{course.score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="table-empty-cell" colSpan={6}>
                    No course performance rows were returned for this analysis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AcademicTables;
