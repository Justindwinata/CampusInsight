import { AcademicAnalytics } from "../../services/academicRecordsService";
import AcademicCharts from "./AcademicCharts";
import AcademicSummaryCards from "./AcademicSummaryCards";
import AcademicTables from "./AcademicTables";
import CourseRiskReview from "./CourseRiskReview";

type AnalyticsDashboardProps = {
  analytics: AcademicAnalytics;
};

function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  return (
    <>
      <AcademicSummaryCards analytics={analytics} />
      <AcademicCharts analytics={analytics} />
      <AcademicTables analytics={analytics} />
      <CourseRiskReview analytics={analytics} />
    </>
  );
}

export default AnalyticsDashboard;
