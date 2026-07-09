import { GradeDistributionItem } from "../../services/academicRecordsService";
import ChartCard from "./ChartCard";
import ChartEmptyState from "./ChartEmptyState";
import { toGradeDistributionChartData } from "./chartUtils";

type GradeDistributionChartProps = {
  grades: GradeDistributionItem[];
};

function GradeDistributionChart({ grades }: GradeDistributionChartProps) {
  const data = toGradeDistributionChartData(grades);
  const width = 560;
  const height = 280;
  const padding = { top: 28, right: 24, bottom: 52, left: 42 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const step = chartWidth / Math.max(data.length, 1);

  return (
    <ChartCard
      title="Grade Distribution Chart"
      description="Compares how many courses received each grade letter in the analyzed records."
    >
      {data.length === 0 ? (
        <ChartEmptyState message="Grade distribution will appear after the analysis includes graded courses." />
      ) : (
        <svg
          className="chart-canvas chart-canvas-compact chart-svg"
          role="img"
          aria-label="Grade distribution chart showing course counts by grade letter."
          viewBox={`0 0 ${width} ${height}`}
        >
          <title>Grade distribution</title>
          {[0, 0.5, 1].map((ratio) => {
            const y = padding.top + chartHeight * ratio;
            return (
              <line
                className="chart-grid-line"
                key={ratio}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
            );
          })}
          {data.map((item, index) => {
            const barHeight = (item.count / maxCount) * chartHeight;
            const barWidth = Math.min(54, step * 0.58);
            const x = padding.left + step * index + step / 2 - barWidth / 2;
            const y = padding.top + chartHeight - barHeight;
            return (
              <g key={item.grade}>
                <rect
                  className="chart-bar"
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="8"
                />
                <text
                  className="chart-value-label"
                  textAnchor="middle"
                  x={x + barWidth / 2}
                  y={y - 8}
                >
                  {item.count}
                </text>
                <text
                  className="chart-axis-label"
                  textAnchor="middle"
                  x={x + barWidth / 2}
                  y={height - 24}
                >
                  {item.grade}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </ChartCard>
  );
}

export default GradeDistributionChart;
