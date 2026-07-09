import { SemesterPerformance } from "../../services/academicRecordsService";
import ChartCard from "./ChartCard";
import ChartEmptyState from "./ChartEmptyState";
import { toSemesterChartData } from "./chartUtils";

type SemesterPerformanceChartProps = {
  semesters: SemesterPerformance[];
};

function SemesterPerformanceChart({ semesters }: SemesterPerformanceChartProps) {
  const data = toSemesterChartData(semesters);
  const width = 720;
  const height = 320;
  const padding = { top: 34, right: 44, bottom: 58, left: 52 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxCredits = Math.max(...data.map((item) => item.credits), 1);
  const step = chartWidth / Math.max(data.length, 1);
  const points = data.map((item, index) => {
    const x = padding.left + step * index + step / 2;
    return {
      ...item,
      x,
      gpaY: padding.top + chartHeight - (item.gpa / 4) * chartHeight,
      scoreY: padding.top + chartHeight - (item.averageScore / 100) * chartHeight,
      creditHeight: (item.credits / maxCredits) * chartHeight,
    };
  });
  const gpaPath = buildLinePath(points.map((point) => ({ x: point.x, y: point.gpaY })));
  const scorePath = buildLinePath(points.map((point) => ({ x: point.x, y: point.scoreY })));

  return (
    <ChartCard
      title="Semester Performance Chart"
      description="Shows weighted GPA, average score, and completed credits for each semester."
    >
      {points.length === 0 ? (
        <ChartEmptyState message="Semester performance will appear after the analysis includes semester records." />
      ) : (
        <svg
          className="chart-canvas chart-svg"
          role="img"
          aria-label="Semester performance chart comparing GPA, average score, and credits."
          viewBox={`0 0 ${width} ${height}`}
        >
          <title>Semester performance</title>
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
          {points.map((point) => (
            <g key={point.label}>
              <rect
                className="chart-bar chart-bar-muted"
                x={point.x - Math.min(28, step * 0.26)}
                y={padding.top + chartHeight - point.creditHeight}
                width={Math.min(56, step * 0.52)}
                height={point.creditHeight}
                rx="8"
              />
              <text className="chart-axis-label" textAnchor="middle" x={point.x} y={height - 24}>
                {point.label}
              </text>
            </g>
          ))}
          <path className="chart-line chart-line-primary" d={gpaPath} />
          <path className="chart-line chart-line-accent" d={scorePath} />
          {points.map((point) => (
            <g key={`${point.label}-points`}>
              <circle className="chart-dot chart-dot-primary" cx={point.x} cy={point.gpaY} r="5" />
              <circle className="chart-dot chart-dot-accent" cx={point.x} cy={point.scoreY} r="5" />
            </g>
          ))}
          <g className="chart-legend" transform={`translate(${padding.left}, 18)`}>
            {[
              { color: "#17494d", label: "Weighted GPA", x: 0 },
              { color: "#b8452a", label: "Average score", x: 132 },
              { color: "#8c6d1f", label: "Credits", x: 270 },
            ].map((item) => (
              <g key={item.label} transform={`translate(${item.x}, 0)`}>
                <circle fill={item.color} r="5" />
                <text x="12" y="4">
                  {item.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      )}
    </ChartCard>
  );
}

function buildLinePath(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export default SemesterPerformanceChart;
