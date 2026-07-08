import { AcademicAnalytics } from "../../services/academicRecordsService";

type CourseRiskReviewProps = {
  analytics: AcademicAnalytics;
};

function CourseRiskReview({ analytics }: CourseRiskReviewProps) {
  const risks = analytics.course_risks;

  return (
    <section className="analytics-section" aria-labelledby="risk-review-title">
      <div className="section-heading dashboard-heading">
        <p className="eyebrow">Course Review</p>
        <h2 id="risk-review-title">Courses that may need attention</h2>
        <p className="section-copy">
          These deterministic indicators highlight lower performance signals for review and should
          be used as advisory context only.
        </p>
      </div>

      {risks.length === 0 ? (
        <div className="result-panel result-panel-success">
          <h3>No at-risk courses detected.</h3>
          <p>No lower performance signals were returned by the analytics service.</p>
        </div>
      ) : (
        <div className="risk-grid">
          {risks.map((risk, index) => (
            <article className="risk-card" key={`${risk.course_code}-${index}`}>
              <span className="risk-level">Risk level: {risk.risk_level}</span>
              <h3>{risk.course_name}</h3>
              <p className="risk-code">{risk.course_code}</p>
              <strong>Review recommended</strong>
              <ul>
                {risk.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <p className="attention-note">This course may need attention.</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CourseRiskReview;
