import { FormEvent, useId, useState } from "react";

import {
  AcademicRecordsAnalysisResult,
  analyzeAcademicRecordsCsv,
} from "./services/academicRecordsService";

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
      </section>

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
          Select a CSV file and submit it to see validation status and academic summary metrics.
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

export default App;
