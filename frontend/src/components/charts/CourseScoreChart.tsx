import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CoursePerformanceItem } from "../../services/academicRecordsService";
import ChartCard from "./ChartCard";
import { toCourseScoreChartData } from "./chartUtils";

type CourseScoreChartProps = {
  courses: CoursePerformanceItem[];
};

function CourseScoreChart({ courses }: CourseScoreChartProps) {
  const data = toCourseScoreChartData(courses);

  return (
    <ChartCard
      title="Course Score Overview"
      description="Shows course scores from the analyzed records, limited to the first twelve courses for readability."
    >
      <div
        className="chart-canvas chart-canvas-wide"
        role="img"
        aria-label="Course score overview chart showing scores by course code."
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#e3e9f1" strokeDasharray="4 4" />
            <XAxis dataKey="courseCode" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 12 }} width={36} />
            <Tooltip />
            <Bar dataKey="score" name="Score" fill="#b8452a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default CourseScoreChart;
