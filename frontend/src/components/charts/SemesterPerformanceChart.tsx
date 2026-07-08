import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SemesterPerformance } from "../../services/academicRecordsService";
import ChartCard from "./ChartCard";
import ChartEmptyState from "./ChartEmptyState";
import { toSemesterChartData } from "./chartUtils";

type SemesterPerformanceChartProps = {
  semesters: SemesterPerformance[];
};

function SemesterPerformanceChart({ semesters }: SemesterPerformanceChartProps) {
  const data = toSemesterChartData(semesters);

  return (
    <ChartCard
      title="Semester Performance Chart"
      description="Shows weighted GPA, average score, and completed credits for each semester."
    >
      {data.length === 0 ? (
        <ChartEmptyState message="Semester performance will appear after the analysis includes semester records." />
      ) : (
        <div
          className="chart-canvas"
          role="img"
          aria-label="Semester performance chart comparing GPA, average score, and credits."
        >
          <ResponsiveContainer width="100%" height="100%" minHeight={320}>
            <ComposedChart data={data} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#e3e9f1" strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} />
              <YAxis
                yAxisId="gpa"
                domain={[0, 4]}
                tick={{ fill: "#475569", fontSize: 12 }}
                width={36}
              />
              <YAxis
                yAxisId="score"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: "#475569", fontSize: 12 }}
                width={40}
              />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="score"
                dataKey="credits"
                name="Credits"
                fill="#8c6d1f"
                isAnimationActive={false}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="gpa"
                type="monotone"
                dataKey="gpa"
                name="Weighted GPA"
                stroke="#17494d"
                strokeWidth={3}
                isAnimationActive={false}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="averageScore"
                name="Average score"
                stroke="#b8452a"
                strokeWidth={3}
                isAnimationActive={false}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export default SemesterPerformanceChart;
