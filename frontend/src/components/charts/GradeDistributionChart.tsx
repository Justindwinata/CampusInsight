import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GradeDistributionItem } from "../../services/academicRecordsService";
import ChartCard from "./ChartCard";
import { toGradeDistributionChartData } from "./chartUtils";

type GradeDistributionChartProps = {
  grades: GradeDistributionItem[];
};

function GradeDistributionChart({ grades }: GradeDistributionChartProps) {
  const data = toGradeDistributionChartData(grades);

  return (
    <ChartCard
      title="Grade Distribution Chart"
      description="Compares how many courses received each grade letter in the analyzed CSV."
    >
      <div
        className="chart-canvas chart-canvas-compact"
        role="img"
        aria-label="Grade distribution chart showing course counts by grade letter."
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 12, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#e3e9f1" strokeDasharray="4 4" />
            <XAxis dataKey="grade" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} width={36} />
            <Tooltip />
            <Bar dataKey="count" name="Course count" fill="#17494d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export default GradeDistributionChart;
