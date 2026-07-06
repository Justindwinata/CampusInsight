import { FormEvent, useId, useState } from "react";

import {
  AcademicRecordsAnalysisResult,
  analyzeAcademicRecordsCsv,
} from "./services/academicRecordsService";
import CourseScoreChart from "./components/charts/CourseScoreChart";
import GradeDistributionChart from "./components/charts/GradeDistributionChart";
import SemesterPerformanceChart from "./components/charts/SemesterPerformanceChart";
import {
  deleteSavedAnalysis,
  listSavedAnalyses,
  SavedAnalysisSummary,
} from "./services/savedAnalysesService";

const capabilities = [
  "Academic Analytics Dashboard",
  "Upload Academic Records",
  "GPA and Semester Trends",
  "Course Risk Detection",
  "Report Generation",
];

function App() {
  const fileInputId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AcademicRecordsAnalysisResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnalysisResult(null);
    setUploadError(null);

    if (!selectedFile) {
      setUploadError("Choose an academic records CSV file before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeAcademicRecordsCsv(selectedFile);
      setAnalysisResult(result);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "The CSV file could not be analyzed. Please retry.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-content">
          <p className="eyebrow">Student Performance Analytics Dashboard</p>
          <h1 id="page-title">CampusInsight</h1>
          <p className="intro">
            A full-stack portfolio project for exploring academic records, learning patterns, and
            student performance workflows.
          </p>
          <p className="status-note">This product is under active development.</p>
        </div>

        <aside className="status-panel" aria-label="Backend status">
          <span className="status-label">Backend status</span>
          <strong>CSV validation API ready</strong>
          <p>Academic record CSV files can now be validated and analyzed through the backend.</p>
        </aside>
      </section>

      <section className="upload-section" aria-labelledby="upload-title">
        <div className="section-heading">
          <p className="eyebrow">CSV validation</p>
          <h2 id="upload-title">Validate academic records</h2>
          <p className="section-copy">
            Upload an academic records CSV to verify that it matches the CampusInsight schema.
          </p>
        </div>

        <div className="upload-layout">
          <form className="upload-form" onSubmit={handleSubmit}>
            <label className="file-label" htmlFor={fileInputId}>
              Academic records CSV file
            </label>
            <input
              id={fileInputId}
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null);
                setAnalysisResult(null);
                setUploadError(null);
              }}
            />

            <div className="selected-file" aria-live="polite">
              {selectedFile ? selectedFile.name : "No CSV file selected."}
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={!selectedFile || isAnalyzing}
            >
              {isAnalyzing ? "Analyzing CSV..." : "Analyze CSV"}
            </button>
          </form>

          <aside className="schema-hint" aria-label="Required CSV schema">
            <h3>Required columns</h3>
            <p>
              Use the sample file at <code>data/sample/academic_records_sample.csv</code>.
            </p>
            <ul>
              <li>student_id</li>
              <li>student_name</li>
              <li>semester</li>
              <li>academic_year</li>
              <li>course_code</li>
              <li>course_name</li>
              <li>credits</li>
              <li>grade_letter</li>
              <li>grade_point</li>
              <li>score</li>
            </ul>
          </aside>
        </div>

        <ValidationResultPanel
          fileName={selectedFile?.name}
          isLoading={isAnalyzing}
          result={analysisResult}
          uploadError={uploadError}
        />
        <AnalyticsSummary result={analysisResult} />
        <AcademicVisualizations result={analysisResult} />
        <AnalyticsTables result={analysisResult} />
        <CourseRiskReview result={analysisResult} />
      </section>

      <SavedAnalysesPanel />

      <section className="capability-section" aria-labelledby="capabilities-title">
        <div className="section-heading">
          <p className="eyebrow">Planned foundation</p>
          <h2 id="capabilities-title">Future analytics capabilities</h2>
        </div>

        <div className="capability-grid">
          {capabilities.map((capability) => (
            <article className="capability-card" key={capability}>
              <h3>{capability}</h3>
              <p>Planned for a later contract.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function SavedAnalysesPanel() {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysisSummary[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysisSummary | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  async function loadHistory() {
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const response = await listSavedAnalyses();
      setSavedAnalyses(response.analyses);
      setSelectedAnalysis(
        (currentSelection) =>
          response.analyses.find(
            (analysis) => analysis.analysis_id === currentSelection?.analysis_id,
          ) ?? null,
      );
      setHasLoadedHistory(true);
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Saved analyses are currently unavailable. Please retry.",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function handleDelete(analysisId: string) {
    setHistoryError(null);

    try {
      await deleteSavedAnalysis(analysisId);
      setSavedAnalyses((currentAnalyses) =>
        currentAnalyses.filter((analysis) => analysis.analysis_id !== analysisId),
      );
      setSelectedAnalysis((currentSelection) =>
        currentSelection?.analysis_id === analysisId ? null : currentSelection,
      );
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Saved analysis could not be deleted. Please retry.",
      );
    }
  }

  return (
    <section className="saved-analyses-section" aria-labelledby="saved-analyses-title">
      <div className="section-heading">
        <p className="eyebrow">Saved Analyses</p>
        <h2 id="saved-analyses-title">Saved analyses</h2>
        <p className="section-copy">
          Review saved analysis metadata from local history. Full saved result detail remains future
          work.
        </p>
      </div>

      <div className="saved-history-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={loadHistory}
          disabled={isLoadingHistory}
        >
          {isLoadingHistory ? "Loading saved analyses..." : "Load saved analyses"}
        </button>
      </div>

      {historyError ? (
        <section className="result-panel result-panel-error" role="alert">
          <h3>Saved analyses could not be loaded.</h3>
          <p>{historyError}</p>
        </section>
      ) : null}

      {hasLoadedHistory && savedAnalyses.length === 0 && !historyError ? (
        <section className="result-panel result-panel-empty" aria-live="polite">
          <h3>No saved analyses yet.</h3>
          <p>Run a valid CSV analysis to save a local history entry.</p>
        </section>
      ) : null}

      {savedAnalyses.length > 0 ? (
        <div className="saved-history-layout">
          <div className="saved-history-list" aria-label="Saved analysis summaries">
            {savedAnalyses.map((analysis) => (
              <article className="saved-history-item" key={analysis.analysis_id}>
                <div>
                  <h3>{analysis.source_filename}</h3>
                  <p>{analysis.created_at}</p>
                </div>
                <dl>
                  <div>
                    <dt>Rows</dt>
                    <dd>{analysis.row_count}</dd>
                  </div>
                  <div>
                    <dt>Courses</dt>
                    <dd>{analysis.total_courses}</dd>
                  </div>
                  <div>
                    <dt>Weighted GPA</dt>
                    <dd>{analysis.weighted_gpa}</dd>
                  </div>
                  <div>
                    <dt>Average score</dt>
                    <dd>{analysis.average_score}</dd>
                  </div>
                </dl>
                <div className="saved-history-controls">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    Select metadata
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => void handleDelete(analysis.analysis_id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="metadata-preview" aria-labelledby="metadata-preview-title">
            <h3 id="metadata-preview-title">Selected metadata preview</h3>
            {selectedAnalysis ? (
              <dl className="metadata-list">
                <div>
                  <dt>Analysis ID</dt>
                  <dd>{selectedAnalysis.analysis_id}</dd>
                </div>
                <div>
                  <dt>Source file</dt>
                  <dd>{selectedAnalysis.source_filename}</dd>
                </div>
                <div>
                  <dt>Rows</dt>
                  <dd>{selectedAnalysis.row_count}</dd>
                </div>
                <div>
                  <dt>Total courses</dt>
                  <dd>{selectedAnalysis.total_courses}</dd>
                </div>
                <div>
                  <dt>Weighted GPA</dt>
                  <dd>{selectedAnalysis.weighted_gpa}</dd>
                </div>
                <div>
                  <dt>Average score</dt>
                  <dd>{selectedAnalysis.average_score}</dd>
                </div>
              </dl>
            ) : (
              <p>Select a saved analysis to preview metadata only.</p>
            )}
          </aside>
        </div>
      ) : null}
    </section>
  );
}

type ValidationResultPanelProps = {
  fileName?: string;
  isLoading: boolean;
  result: AcademicRecordsAnalysisResult | null;
  uploadError: string | null;
};

function ValidationResultPanel({
  fileName,
  isLoading,
  result,
  uploadError,
}: ValidationResultPanelProps) {
  if (isLoading) {
    return (
      <section className="result-panel" aria-live="polite" aria-busy="true">
        <h3>Analyzing CSV...</h3>
        <p>CampusInsight is validating the selected file and preparing deterministic analytics.</p>
      </section>
    );
  }

  if (uploadError) {
    return (
      <section className="result-panel result-panel-error" role="alert">
        <h3>CSV upload could not be analyzed.</h3>
        <p>{uploadError}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="result-panel result-panel-empty" aria-live="polite">
        <h3>Validation result</h3>
        <p>
          Select a CSV file and submit it to see validation status and academic summary metrics. You
          can run analysis again with another file at any time.
        </p>
      </section>
    );
  }

  if (result.is_valid) {
    return (
      <section className="result-panel result-panel-success" aria-live="polite">
        <h3>CSV validation passed.</h3>
        <dl className="result-summary">
          <div>
            <dt>File</dt>
            <dd>{fileName ?? "Uploaded CSV"}</dd>
          </div>
          <div>
            <dt>Rows checked</dt>
            <dd>{result.validation.row_count}</dd>
          </div>
          <div>
            <dt>Analytics status</dt>
            <dd>Ready</dd>
          </div>
        </dl>
      </section>
    );
  }

  return (
    <section className="result-panel result-panel-warning" aria-live="polite">
      <h3>CSV validation found issues.</h3>
      <p>Review the listed validation errors, update the CSV, then retry the analysis.</p>
      <dl className="result-summary">
        <div>
          <dt>File</dt>
          <dd>{fileName ?? "Uploaded CSV"}</dd>
        </div>
        <div>
          <dt>Rows checked</dt>
          <dd>{result.validation.row_count}</dd>
        </div>
        <div>
          <dt>Error count</dt>
          <dd>{result.validation.errors.length}</dd>
        </div>
      </dl>

      <div className="error-list" aria-label="Validation errors">
        {result.validation.errors.map((error, index) => (
          <article className="error-item" key={`${error.row_number}-${error.field}-${index}`}>
            <span>Row {error.row_number ?? "file"}</span>
            <strong>{error.field ?? "file"}</strong>
            <p>{error.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AnalyticsSummary({ result }: { result: AcademicRecordsAnalysisResult | null }) {
  if (!result?.is_valid || !result.analytics) {
    return null;
  }

  const { gpa_summary: gpaSummary, credit_summary: creditSummary } = result.analytics;
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
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function AcademicVisualizations({ result }: { result: AcademicRecordsAnalysisResult | null }) {
  if (!result?.is_valid || !result.analytics) {
    return null;
  }

  return (
    <section className="analytics-section" aria-labelledby="visualizations-title">
      <div className="section-heading">
        <p className="eyebrow">Academic Visualizations</p>
        <h2 id="visualizations-title">Analytics charts</h2>
        <p className="section-copy">
          Visual summaries use the same deterministic backend analytics shown in the tables below.
        </p>
      </div>

      <div className="chart-grid">
        <SemesterPerformanceChart semesters={result.analytics.semester_performance} />
        <GradeDistributionChart grades={result.analytics.grade_distribution} />
        <CourseScoreChart courses={result.analytics.course_performance} />
      </div>
    </section>
  );
}

function AnalyticsTables({ result }: { result: AcademicRecordsAnalysisResult | null }) {
  if (!result?.is_valid || !result.analytics) {
    return null;
  }

  const { semester_performance, grade_distribution, course_performance } = result.analytics;

  return (
    <section className="analytics-section" aria-labelledby="analytics-tables-title">
      <div className="section-heading">
        <p className="eyebrow">Detailed Analytics</p>
        <h2 id="analytics-tables-title">Academic analytics tables</h2>
      </div>

      <div className="table-section" aria-labelledby="semester-performance-title">
        <h3 id="semester-performance-title">Semester Performance</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Semester</th>
                <th scope="col">Academic year</th>
                <th scope="col">GPA</th>
                <th scope="col">Average score</th>
                <th scope="col">Credits</th>
              </tr>
            </thead>
            <tbody>
              {semester_performance.map((semester) => (
                <tr key={`${semester.academic_year}-${semester.semester}`}>
                  <td>{semester.semester}</td>
                  <td>{semester.academic_year}</td>
                  <td>{semester.weighted_gpa}</td>
                  <td>{semester.average_score}</td>
                  <td>{semester.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section" aria-labelledby="grade-distribution-title">
        <h3 id="grade-distribution-title">Grade Distribution</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Grade letter</th>
                <th scope="col">Count</th>
                <th scope="col">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {grade_distribution.map((grade) => (
                <tr key={grade.grade_letter}>
                  <td>{grade.grade_letter}</td>
                  <td>{grade.count}</td>
                  <td>{grade.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-section" aria-labelledby="course-performance-title">
        <h3 id="course-performance-title">Course Performance</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Course code</th>
                <th scope="col">Course name</th>
                <th scope="col">Credits</th>
                <th scope="col">Grade letter</th>
                <th scope="col">Grade point</th>
                <th scope="col">Score</th>
              </tr>
            </thead>
            <tbody>
              {course_performance.map((course, index) => (
                <tr key={`${course.course_code}-${index}`}>
                  <td>{course.course_code}</td>
                  <td>{course.course_name}</td>
                  <td>{course.credits}</td>
                  <td>{course.grade_letter}</td>
                  <td>{course.grade_point}</td>
                  <td>{course.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CourseRiskReview({ result }: { result: AcademicRecordsAnalysisResult | null }) {
  if (!result?.is_valid || !result.analytics) {
    return null;
  }

  const risks = result.analytics.course_risks;

  return (
    <section className="analytics-section" aria-labelledby="risk-review-title">
      <div className="section-heading">
        <p className="eyebrow">Course Risk Review</p>
        <h2 id="risk-review-title">Courses that may need attention</h2>
        <p className="section-copy">
          These deterministic indicators highlight lower performance signals for review. They do not
          predict outcomes.
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

export default App;
