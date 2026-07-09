import { CoursePerformanceItem } from "../../services/academicRecordsService";
import ChartCard from "./ChartCard";
import ChartEmptyState from "./ChartEmptyState";
import { toCourseScoreChartData } from "./chartUtils";

type CourseScoreChartProps = {
  courses: CoursePerformanceItem[];
};

function CourseScoreChart({ courses }: CourseScoreChartProps) {
  const data = toCourseScoreChartData(courses);
  const width = 760;
  const height = 340;
  const padding = { top: 30, right: 30, bottom: 74, left: 48 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const step = chartWidth / Math.max(data.length, 1);

  return (
    <ChartCard
      title="Course Score Overview"
      description="Shows course scores from the analyzed records, limited to the first twelve courses for readability."
    >
      {data.length === 0 ? (
        <ChartEmptyState message="Course score charts will appear after the analysis includes course performance records." />
      ) : (
        <svg
          className="chart-canvas chart-canvas-wide chart-svg"
          role="img"
          aria-label="Course score overview chart showing scores by course code."
          viewBox={`0 0 ${width} ${height}`}
        >
          <title>Course score overview</title>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
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
            const barHeight = (item.score / 100) * chartHeight;
            const barWidth = Math.min(42, step * 0.58);
            const x = padding.left + step * index + step / 2 - barWidth / 2;
            const y = padding.top + chartHeight - barHeight;
            return (
              <g key={`${item.courseCode}-${index}`}>
                <rect
                  className="chart-bar chart-bar-warm"
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
                  {item.score}
                </text>
                <text
                  className="chart-axis-label chart-axis-label-rotated"
                  textAnchor="end"
                  transform={`translate(${x + barWidth / 2}, ${height - 28}) rotate(-36)`}
                >
                  {item.courseCode}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </ChartCard>
  );
}

export default CourseScoreChart;
