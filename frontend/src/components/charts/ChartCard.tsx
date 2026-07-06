import { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <article className="chart-card">
      <div className="chart-card-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="chart-frame">{children}</div>
    </article>
  );
}

export default ChartCard;
