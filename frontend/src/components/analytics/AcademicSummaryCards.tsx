import { AcademicAnalytics } from "../../services/academicRecordsService";

type AcademicSummaryCardsProps = {
  analytics: AcademicAnalytics;
};

function AcademicSummaryCards({ analytics }: AcademicSummaryCardsProps) {
  const { gpa_summary: gpaSummary, credit_summary: creditSummary } = analytics;
  const cards = [
    ["Total courses", gpaSummary.total_courses],
    ["Total credits", gpaSummary.total_credits],
    ["Weighted GPA", gpaSummary.weighted_gpa],
    ["Average score", gpaSummary.average_score],
    ["Highest score", gpaSummary.highest_score],
    ["Lowest score", gpaSummary.lowest_score],
    ["Best course", gpaSummary.best_course ?? "Not available"],
    ["Weakest course", gpaSummary.weakest_course ?? "Not available"],
    ["Attempted courses", creditSummary.attempted_courses],
    ["Average credits", creditSummary.average_credits_per_course],
  ];

  return (
    <section className="analytics-section" aria-labelledby="academic-summary-title">
      <div className="section-heading">
        <p className="eyebrow">Academic Summary</p>
        <h2 id="academic-summary-title">GPA and credit summary</h2>
      </div>

      <div className="metric-grid">
        {cards.map(([label, value]) => (
          <article
            className={
              label === "Weighted GPA" ? "metric-card metric-card-featured" : "metric-card"
            }
            key={label}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AcademicSummaryCards;
