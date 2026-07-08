type ChartEmptyStateProps = {
  message: string;
};

function ChartEmptyState({ message }: ChartEmptyStateProps) {
  return (
    <div className="chart-empty-state" role="status">
      <strong>No chart data available.</strong>
      <p>{message}</p>
    </div>
  );
}

export default ChartEmptyState;
