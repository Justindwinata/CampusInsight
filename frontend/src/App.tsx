import { FormEvent, useId, useState } from "react";

import {
  AcademicRecordsAnalysisResult,
  analyzeAcademicRecordsCsv,
} from "./services/academicRecordsService";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import {
  deleteSavedAnalysis,
  getSavedAnalysis,
  getSavedAnalysisReportUrl,
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
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <a className="brand-mark" href="#page-title" aria-label="CampusInsight home">
            <span className="brand-symbol">CI</span>
            <span>
              <strong>CampusInsight</strong>
              <small>Academic analytics dashboard</small>
            </span>
          </a>

          <nav className="app-nav" aria-label="Primary navigation">
            <a href="#analyze">Analyze</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#saved-analyses-title">Saved Analyses</a>
            <a href="#report">Report</a>
          </nav>
        </div>
      </header>

      <main className="app-shell">
      <section className="hero product-intro" aria-labelledby="page-title">
        <div className="hero-content">
          <p className="eyebrow">Student Performance Analytics Dashboard</p>
          <h1 id="page-title">CampusInsight</h1>
          <p className="intro">
            Analyze academic records from CSV files, review GPA trends and course performance, and
            keep saved reports for local academic review.
          </p>
          <div className="hero-actions">
            <a className="primary-link-button" href="#analyze">
              Analyze Academic Records
            </a>
            <p className="status-note">This product is under active development.</p>
          </div>
          <p className="demo-note">Demo assets use fictional sample data only.</p>
        </div>

        <aside className="status-panel" aria-label="Backend status">
          <span className="status-label">Backend status</span>
          <strong>CSV validation API ready</strong>
          <p>Academic record CSV files can now be validated and analyzed through the backend.</p>
        </aside>
      </section>

      <section id="analyze" className="upload-section page-section" aria-labelledby="upload-title">
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

        <div id="dashboard" className="dashboard-anchor">
          <ValidationResultPanel
            fileName={selectedFile?.name}
            isLoading={isAnalyzing}
            result={analysisResult}
            uploadError={uploadError}
          />
          {analysisResult?.is_valid && analysisResult.analytics ? (
            <AnalyticsDashboard analytics={analysisResult.analytics} />
          ) : null}
        </div>
      </section>

      <SavedAnalysesPanel />

      <section className="capability-section page-section" aria-labelledby="capabilities-title">
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
    </>
  );
}

function SavedAnalysesPanel() {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysisSummary[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysisSummary | null>(null);
  const [savedDetail, setSavedDetail] = useState<AcademicRecordsAnalysisResult | null>(null);
  const [savedDetailError, setSavedDetailError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSavedDetail, setIsLoadingSavedDetail] = useState(false);

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
      setSavedDetail((currentDetail) =>
        response.analyses.some((analysis) => analysis.analysis_id === currentDetail?.analysis_id)
          ? currentDetail
          : null,
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
      setSavedDetail((currentDetail) =>
        currentDetail?.analysis_id === analysisId ? null : currentDetail,
      );
      setSavedDetailError((currentError) =>
        selectedAnalysis?.analysis_id === analysisId ? null : currentError,
      );
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Saved analysis could not be deleted. Please retry.",
      );
    }
  }

  function clearSavedDetail() {
    setSelectedAnalysis(null);
    setSavedDetail(null);
    setSavedDetailError(null);
    setIsLoadingSavedDetail(false);
  }

  async function openSavedAnalysisDetail(analysis: SavedAnalysisSummary) {
    setSelectedAnalysis(analysis);
    setSavedDetail(null);
    setSavedDetailError(null);
    setIsLoadingSavedDetail(true);

    try {
      const detail = await getSavedAnalysis(analysis.analysis_id);
      setSavedDetail(detail);
    } catch (error) {
      setSavedDetailError(
        error instanceof Error
          ? error.message
          : "Saved analysis detail could not be loaded. Please retry.",
      );
    } finally {
      setIsLoadingSavedDetail(false);
    }
  }

  return (
    <section className="saved-analyses-section page-section" aria-labelledby="saved-analyses-title">
      <div className="section-heading">
        <p className="eyebrow">Saved Analyses</p>
        <h2 id="saved-analyses-title">Saved analyses</h2>
        <p className="section-copy">
          Review locally saved analysis history, open the stored dashboard, and download a
          standalone HTML report.
        </p>
      </div>

      <div id="report" className="saved-history-actions">
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
                <div className="saved-history-item-heading">
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
                    onClick={() => void openSavedAnalysisDetail(analysis)}
                  >
                    Open detail
                  </button>
                  <button
                    className="danger-button"
                    aria-label={`Delete saved analysis ${analysis.source_filename}`}
                    type="button"
                    onClick={() => void handleDelete(analysis.analysis_id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <SavedAnalysisDetailShell
            detail={savedDetail}
            error={savedDetailError}
            isLoading={isLoadingSavedDetail}
            onClear={clearSavedDetail}
            onRetry={() => {
              if (selectedAnalysis) {
                void openSavedAnalysisDetail(selectedAnalysis);
              }
            }}
            selectedAnalysis={selectedAnalysis}
          />
        </div>
      ) : null}

      {selectedAnalysis && savedDetail && !isLoadingSavedDetail && !savedDetailError ? (
        <SavedAnalysisDashboardSection detail={savedDetail} onClear={clearSavedDetail} />
      ) : null}
    </section>
  );
}

type SavedAnalysisDetailShellProps = {
  detail: AcademicRecordsAnalysisResult | null;
  error: string | null;
  isLoading: boolean;
  onClear: () => void;
  onRetry: () => void;
  selectedAnalysis: SavedAnalysisSummary | null;
};

function SavedAnalysisDetailShell({
  detail,
  error,
  isLoading,
  onClear,
  onRetry,
  selectedAnalysis,
}: SavedAnalysisDetailShellProps) {
  return (
    <aside className="metadata-preview" aria-labelledby="saved-detail-title">
      <h3 id="saved-detail-title">Saved Analysis Detail</h3>

      {!selectedAnalysis ? <p>Select a saved analysis to load stored detail metadata.</p> : null}

      {selectedAnalysis ? <SavedAnalysisMetadata analysis={selectedAnalysis} /> : null}

      {isLoading ? (
        <div className="saved-detail-status" role="status" aria-live="polite" aria-busy="true">
          Loading saved detail...
        </div>
      ) : null}

      {error ? (
        <div className="saved-detail-status saved-detail-status-error" role="alert">
          <strong>Saved detail could not be loaded.</strong>
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={onRetry}>
            Retry saved detail
          </button>
        </div>
      ) : null}

      {detail && !isLoading && !error ? (
        <div className="saved-detail-status saved-detail-status-success" aria-live="polite">
          <div>
            <strong>Saved detail loaded.</strong>
            <p>
              Validation status: {detail.is_valid ? "valid" : "invalid"}. The saved dashboard is
              displayed below when analytics data is available.
            </p>
          </div>
          <div className="saved-detail-actions">
            <button className="secondary-button" type="button" onClick={onClear}>
              Clear saved detail
            </button>
            {detail.analysis_id ? (
              <a
                className="secondary-link-button"
                aria-label={`Download HTML report for saved analysis ${detail.analysis_id}`}
                href={getSavedAnalysisReportUrl(detail.analysis_id)}
                rel="noreferrer"
                target="_blank"
              >
                Download HTML Report
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function SavedAnalysisDashboardSection({
  detail,
  onClear,
}: {
  detail: AcademicRecordsAnalysisResult;
  onClear: () => void;
}) {
  if (!detail.is_valid || !detail.analytics) {
    return (
      <section className="saved-dashboard-section" aria-labelledby="saved-dashboard-title">
        <div className="result-panel result-panel-warning">
          <h3 id="saved-dashboard-title">Saved analysis cannot be displayed.</h3>
          <p>The stored response does not include displayable analytics data.</p>
          <button className="secondary-button" type="button" onClick={onClear}>
            Return to saved analyses
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="saved-dashboard-section" aria-labelledby="saved-dashboard-title">
      <div className="section-heading">
        <p className="eyebrow">Viewing saved analysis</p>
        <h2 id="saved-dashboard-title">Saved analysis dashboard</h2>
        <p className="section-copy">
          This dashboard uses the stored canonical analysis JSON from local history.
        </p>
      </div>
      <div className="saved-dashboard-actions">
        <button className="secondary-button" type="button" onClick={onClear}>
          Return to saved analyses
        </button>
      </div>
      <ValidationResultPanel
        fileName="Saved analysis"
        isLoading={false}
        result={detail}
        uploadError={null}
      />
      <AnalyticsDashboard analytics={detail.analytics} />
    </section>
  );
}

function SavedAnalysisMetadata({ analysis }: { analysis: SavedAnalysisSummary }) {
  return (
    <dl className="metadata-list">
      <div>
        <dt>Analysis ID</dt>
        <dd>{analysis.analysis_id}</dd>
      </div>
      <div>
        <dt>Source file</dt>
        <dd>{analysis.source_filename}</dd>
      </div>
      <div>
        <dt>Created at</dt>
        <dd>{analysis.created_at}</dd>
      </div>
      <div>
        <dt>Rows</dt>
        <dd>{analysis.row_count}</dd>
      </div>
      <div>
        <dt>Total courses</dt>
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
      <section className="result-panel" role="status" aria-live="polite" aria-busy="true">
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
      <section className="result-panel result-panel-empty" role="status" aria-live="polite">
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
      <section className="result-panel result-panel-success" role="status" aria-live="polite">
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
    <section className="result-panel result-panel-warning" role="status" aria-live="polite">
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

export default App;
