import { AcademicAnalytics } from "../../services/academicRecordsService";
import CourseScoreChart from "../charts/CourseScoreChart";
import GradeDistributionChart from "../charts/GradeDistributionChart";
import SemesterPerformanceChart from "../charts/SemesterPerformanceChart";

type AcademicChartsProps = {
  analytics: AcademicAnalytics;
};

function AcademicCharts({ analytics }: AcademicChartsProps) {
  return (
    <section className="analytics-section" aria-labelledby="visualizations-title">
      <div className="section-heading dashboard-heading">
        <p className="eyebrow">Performance Trends</p>
        <h2 id="visualizations-title">Analytics charts</h2>
        <p className="section-copy">
          Visual summaries use the same deterministic backend analytics shown in the accessible
          tables below.
        </p>
      </div>

      <div className="chart-grid">
        <SemesterPerformanceChart semesters={analytics.semester_performance} />
        <GradeDistributionChart grades={analytics.grade_distribution} />
        <CourseScoreChart courses={analytics.course_performance} />
      </div>
    </section>
  );
}

export default AcademicCharts;
