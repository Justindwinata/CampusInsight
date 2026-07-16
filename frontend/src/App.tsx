import { useEffect, useId, useState } from "react";
import type { CSSProperties, FormEvent, PointerEvent } from "react";

import {
  AcademicRecordsAnalysisResult,
  analyzeAcademicRecordsFile,
} from "./services/academicRecordsService";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import heroCoverUrl from "../../assets/thumbnail.png";
import {
  deleteSavedAnalysis,
  getSavedAnalysis,
  getSavedAnalysisReportUrl,
  listSavedAnalyses,
  SavedAnalysisSummary,
} from "./services/savedAnalysesService";

type AppView = "home" | "analyze" | "dashboard" | "saved" | "report";

const productHighlights = [
  {
    icon: "CSV",
    title: "Structured inputs",
    body: "Analyze academic records from CSV files or text-based transcript PDFs.",
  },
  {
    icon: "GPA",
    title: "Deterministic review",
    body: "Review GPA, grade distribution, course performance, and risk signals without prediction.",
  },
  {
    icon: "HTML",
    title: "Saved workspace",
    body: "Keep local analysis history organized and open HTML reports from saved results.",
  },
];

const productSignals = [
  {
    label: "Input coverage",
    value: "CSV + PDF",
    detail: "Structured records and selectable transcript text feed the same analytics schema.",
  },
  {
    label: "Analysis model",
    value: "Deterministic",
    detail: "Metrics are calculated from uploaded records using transparent rules.",
  },
  {
    label: "Output flow",
    value: "Dashboard + report",
    detail: "Review current results, saved details, and standalone HTML reports.",
  },
];

const heroMetrics = [
  ["Inputs", "CSV + PDF"],
  ["Charts", "3 views"],
  ["Reports", "HTML"],
];

const navItems: Array<{ view: AppView; label: string }> = [
  { view: "home", label: "Home" },
  { view: "analyze", label: "Analyze" },
  { view: "dashboard", label: "Dashboard" },
  { view: "saved", label: "Saved Analyses" },
  { view: "report", label: "Report" },
];

function App() {
  const fileInputId = useId();
  const [activeView, setActiveView] = useState<AppView>("home");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AcademicRecordsAnalysisResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMotionReady, setIsMotionReady] = useState(false);

  useEffect(() => {
    const motionFrame = window.requestAnimationFrame(() => setIsMotionReady(true));
    return () => window.cancelAnimationFrame(motionFrame);
  }, []);

  function navigateTo(view: AppView) {
    setActiveView(view);
    if (window.navigator.userAgent.includes("jsdom")) {
      return;
    }
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnalysisResult(null);
    setUploadError(null);

    if (!selectedFile) {
      setUploadError("Choose an academic records CSV or PDF file before analyzing.");
      setActiveView("dashboard");
      return;
    }

    setIsAnalyzing(true);
    setActiveView("dashboard");
    try {
      const result = await analyzeAcademicRecordsFile(selectedFile);
      setAnalysisResult(result);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "The academic records file could not be analyzed. Please retry.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className={isMotionReady ? "app-root app-root-motion-ready" : "app-root"}>
      <header className="app-header">
        <div className="app-header-inner">
          <button
            className="brand-mark brand-button"
            type="button"
            onClick={() => navigateTo("home")}
            aria-label="CampusInsight home"
          >
            <span className="brand-symbol">CI</span>
            <span>
              <strong>CampusInsight</strong>
              <small>Academic analytics dashboard</small>
            </span>
          </button>

          <nav className="app-nav" aria-label="Primary navigation">
            {navItems.map(({ view, label }) => (
              <button
                className={activeView === view ? "app-nav-active" : undefined}
                key={view}
                type="button"
                aria-current={activeView === view ? "page" : undefined}
                onClick={() => navigateTo(view)}
              >
                <span aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          <div className="app-header-status" aria-label="Local demo status">
            <span />
            Local demo ready
          </div>
        </div>
      </header>

      <main className="app-shell">
        {activeView === "home" ? <HomeView onNavigate={navigateTo} /> : null}
        {activeView === "analyze" ? (
          <AnalyzeView
            fileInputId={fileInputId}
            handleSubmit={handleSubmit}
            isAnalyzing={isAnalyzing}
            selectedFile={selectedFile}
            setAnalysisResult={setAnalysisResult}
            setSelectedFile={setSelectedFile}
            setUploadError={setUploadError}
          />
        ) : null}
        {activeView === "dashboard" ? (
          <DashboardView
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
            selectedFileName={selectedFile?.name}
            uploadError={uploadError}
            onAnalyze={() => navigateTo("analyze")}
          />
        ) : null}
        {activeView === "saved" ? <SavedAnalysesPanel /> : null}
        {activeView === "report" ? <ReportView onNavigate={navigateTo} /> : null}
      </main>
    </div>
  );
}

function HomeView({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  function handleHeroPointerMove(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const x = ((event.clientY - centerY) / bounds.height) * -8;
    const y = ((event.clientX - centerX) / bounds.width) * 10;
    setHeroTilt({ x, y });
  }

  function resetHeroTilt() {
    setHeroTilt({ x: 0, y: 0 });
  }

  const heroVisualStyle = {
    "--hero-tilt-x": `${heroTilt.x.toFixed(2)}deg`,
    "--hero-tilt-y": `${heroTilt.y.toFixed(2)}deg`,
  } as CSSProperties;

  return (
    <>
      <section id="overview" className="hero product-intro" aria-labelledby="page-title">
        <div className="hero-content">
          <div className="hero-kicker-row">
            <p className="eyebrow">Academic analytics workspace</p>
            <span>CSV and PDF transcript support</span>
          </div>
          <h1 id="page-title">
            CampusInsight turns academic records into review-ready dashboards.
          </h1>
          <p className="intro">
            Analyze academic records from CSV files and text-based transcript PDFs. Review GPA,
            grade distribution, course performance, saved history, and HTML reports in one local
            workspace.
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => onNavigate("analyze")}>
              Analyze academic records
            </button>
            <button
              className="secondary-button hero-secondary-link"
              type="button"
              onClick={() => onNavigate("saved")}
            >
              View saved analyses
            </button>
          </div>
          <div className="input-badge-row" aria-label="Supported academic document inputs">
            <span>CSV academic records</span>
            <span>PDF transcript text</span>
            <span>Local saved history</span>
          </div>
          <p className="demo-note">
            Built for deterministic academic review with fictional demo data and transparent scoring
            rules.
          </p>
          <div className="hero-metric-strip" aria-label="CampusInsight product capabilities">
            {heroMetrics.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div
          className="hero-visual"
          aria-label="CampusInsight dashboard preview"
          onPointerLeave={resetHeroTilt}
          onPointerMove={handleHeroPointerMove}
          style={heroVisualStyle}
        >
          <div className="hero-cover-frame">
            <img
              src={heroCoverUrl}
              alt="CampusInsight interface preview showing the academic analytics dashboard"
            />
            <div className="hero-cover-sheen" aria-hidden="true" />
            <div className="hero-cover-depth" aria-hidden="true" />
            <div className="hero-cover-chip hero-cover-chip-top" aria-hidden="true">
              <span>Live dashboard</span>
              <strong>Charts ready</strong>
            </div>
            <div className="hero-cover-chip hero-cover-chip-bottom" aria-hidden="true">
              <span>Inputs</span>
              <strong>CSV + PDF</strong>
            </div>
          </div>
          <div className="hero-floating-card hero-floating-card-top">
            <span>Product status</span>
            <strong>CSV and PDF analysis ready</strong>
          </div>
        </div>
      </section>

      <section className="overview-grid" aria-label="CampusInsight product summary">
        {productHighlights.map((highlight) => (
          <article className="overview-card" key={highlight.title}>
            <div className="overview-card-header">
              <span className="visual-icon" aria-hidden="true">
                {highlight.icon}
              </span>
              <span>{highlight.title}</span>
            </div>
            <p>{highlight.body}</p>
          </article>
        ))}
      </section>

      <section className="product-signal-strip" aria-label="CampusInsight workflow highlights">
        <div className="signal-strip-visual" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        {productSignals.map((signal) => (
          <article className="signal-card" key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <p>{signal.detail}</p>
          </article>
        ))}
      </section>
    </>
  );
}

type AnalyzeViewProps = {
  fileInputId: string;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isAnalyzing: boolean;
  selectedFile: File | null;
  setAnalysisResult: (result: AcademicRecordsAnalysisResult | null) => void;
  setSelectedFile: (file: File | null) => void;
  setUploadError: (error: string | null) => void;
};

function AnalyzeView({
  fileInputId,
  handleSubmit,
  isAnalyzing,
  selectedFile,
  setAnalysisResult,
  setSelectedFile,
  setUploadError,
}: AnalyzeViewProps) {
  return (
    <section id="analyze" className="upload-section app-view" aria-labelledby="upload-title">
      <div className="section-heading">
        <p className="eyebrow">CSV and PDF analysis</p>
        <h2 id="upload-title">Validate academic records</h2>
        <p className="section-copy">
          Upload an academic records CSV or supported transcript PDF to prepare deterministic
          analytics.
        </p>
      </div>

      <div className="page-insight-row" aria-label="Analyze workflow summary">
        <article>
          <span>Step 01</span>
          <strong>Select file</strong>
          <p>Choose a CSV schema file or selectable transcript PDF.</p>
        </article>
        <article>
          <span>Step 02</span>
          <strong>Validate</strong>
          <p>Records are checked before metrics are calculated.</p>
        </article>
        <article>
          <span>Step 03</span>
          <strong>Review</strong>
          <p>Successful analyses open in the dashboard workspace.</p>
        </article>
      </div>

      <div className="upload-layout">
        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="upload-form-heading">
            <span className="form-kicker">Document intake</span>
            <h3>Upload academic records</h3>
            <p>
              Choose one CSV or text-based transcript PDF. CampusInsight validates the file,
              prepares the records, and returns the analytics dashboard.
            </p>
          </div>

          <label className="file-label" htmlFor={fileInputId}>
            Academic records CSV or PDF file
          </label>
          <input
            id={fileInputId}
            type="file"
            accept=".csv,.pdf,text/csv,application/pdf"
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] ?? null);
              setAnalysisResult(null);
              setUploadError(null);
            }}
          />

          <div className="selected-file-card" aria-live="polite">
            <span>{selectedFile ? getAcademicFileType(selectedFile) : "Waiting for file"}</span>
            <strong>
              {selectedFile ? selectedFile.name : "No academic records file selected."}
            </strong>
            <p>
              {selectedFile
                ? "Ready to submit for validation and analytics."
                : "Accepted formats: .csv academic records or text-based .pdf transcript."}
            </p>
            {selectedFile ? (
              <dl className="selected-file-meta" aria-label="Selected file metadata">
                <div>
                  <dt>Size</dt>
                  <dd>{formatFileSize(selectedFile.size)}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{getAcademicFileType(selectedFile)} intake</dd>
                </div>
              </dl>
            ) : null}
          </div>

          <button className="primary-button" type="submit" disabled={!selectedFile || isAnalyzing}>
            {isAnalyzing ? "Analyzing file..." : "Analyze file"}
          </button>
        </form>

        <aside className="schema-hint" aria-label="Accepted academic document formats">
          <h3>Accepted formats</h3>
          <div className="intake-visual-card" aria-hidden="true">
            <span className="intake-node intake-node-csv">CSV</span>
            <span className="intake-line" />
            <span className="intake-node intake-node-pdf">PDF</span>
            <span className="intake-line intake-line-long" />
            <span className="intake-node intake-node-core">Schema</span>
          </div>
          <div className="format-list">
            <article>
              <span className="format-icon" aria-hidden="true">
                CSV
              </span>
              <strong>Structured academic records</strong>
              <p>
                Use <code>data/sample/academic_records_sample.csv</code> or the documented schema
                columns.
              </p>
            </article>
            <article>
              <span className="format-icon format-icon-pdf" aria-hidden="true">
                PDF
              </span>
              <strong>Text-based academic transcript</strong>
              <p>
                The transcript text must be selectable. Scanned image-only documents are outside
                this demo scope.
              </p>
            </article>
          </div>
          <details className="schema-details">
            <summary>CSV schema columns</summary>
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
          </details>
        </aside>
      </div>
    </section>
  );
}

function DashboardView({
  analysisResult,
  isAnalyzing,
  selectedFileName,
  uploadError,
  onAnalyze,
}: {
  analysisResult: AcademicRecordsAnalysisResult | null;
  isAnalyzing: boolean;
  selectedFileName?: string;
  uploadError: string | null;
  onAnalyze: () => void;
}) {
  return (
    <section id="dashboard" className="dashboard-page app-view" aria-labelledby="dashboard-title">
      <div className="section-heading dashboard-heading">
        <p className="eyebrow">Academic Dashboard</p>
        <h2 id="dashboard-title">Current analysis dashboard</h2>
        <p className="section-copy">
          Review validation status, GPA summary, charts, tables, and course review for the latest
          processed academic file.
        </p>
      </div>

      <div className="dashboard-command-strip" aria-label="Dashboard context">
        <span>Current source</span>
        <strong>{selectedFileName ?? "No active file"}</strong>
        <p>
          Charts and tables appear only after a CSV or supported PDF has been processed
          successfully.
        </p>
        <div className="dashboard-command-visual" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>

      {!analysisResult && !isAnalyzing && !uploadError ? (
        <section className="result-panel result-panel-empty dashboard-empty" role="status">
          <h3>No analysis loaded yet.</h3>
          <p>Go to Analyze to upload a CSV or supported transcript PDF.</p>
          <button className="primary-button" type="button" onClick={onAnalyze}>
            Analyze academic records
          </button>
        </section>
      ) : (
        <>
          <ValidationResultPanel
            fileName={selectedFileName}
            isLoading={isAnalyzing}
            result={analysisResult}
            uploadError={uploadError}
          />
          {analysisResult?.is_valid && analysisResult.analytics ? (
            <AnalyticsDashboard analytics={analysisResult.analytics} />
          ) : null}
        </>
      )}
    </section>
  );
}

function ReportView({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  return (
    <section id="report" className="report-page app-view" aria-labelledby="report-title">
      <div className="section-heading dashboard-heading">
        <p className="eyebrow">Report Workspace</p>
        <h2 id="report-title">Standalone HTML reports</h2>
        <p className="section-copy">
          Reports are generated from saved canonical analysis JSON. Open a saved analysis detail to
          access its standalone HTML report.
        </p>
      </div>

      <div className="report-hero-panel">
        <div>
          <span>Report readiness</span>
          <strong>Saved analyses become standalone HTML reports.</strong>
          <p>
            Reports use stored canonical JSON, so no CSV or PDF re-upload is required after the
            analysis has been saved.
          </p>
        </div>
        <div className="report-preview-stack" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="report-guide-grid">
        <article className="overview-card">
          <div className="overview-card-header">
            <span className="visual-icon visual-icon-warm" aria-hidden="true">
              01
            </span>
            <span>1. Analyze</span>
          </div>
          <p>
            Upload a CSV or supported text-based transcript PDF and run deterministic analytics.
          </p>
        </article>
        <article className="overview-card">
          <div className="overview-card-header">
            <span className="visual-icon" aria-hidden="true">
              02
            </span>
            <span>2. Save</span>
          </div>
          <p>Successful analyses are stored locally as canonical JSON, not as uploaded files.</p>
        </article>
        <article className="overview-card">
          <div className="overview-card-header">
            <span className="visual-icon visual-icon-cool" aria-hidden="true">
              03
            </span>
            <span>3. Open report</span>
          </div>
          <p>Use the saved detail view to open a standalone HTML report in a new tab.</p>
        </article>
      </div>

      <div className="report-page-actions">
        <button className="primary-button" type="button" onClick={() => onNavigate("saved")}>
          Open saved analyses
        </button>
        <button className="secondary-button" type="button" onClick={() => onNavigate("analyze")}>
          Analyze a new file
        </button>
      </div>
    </section>
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

      <div className="page-insight-row" aria-label="Saved analysis workflow summary">
        <article>
          <span>History</span>
          <strong>Local SQLite</strong>
          <p>Successful analyses are saved locally as canonical JSON.</p>
        </article>
        <article>
          <span>Detail</span>
          <strong>Stored dashboard</strong>
          <p>Saved views reopen without recalculating from uploaded files.</p>
        </article>
        <article>
          <span>Report</span>
          <strong>HTML output</strong>
          <p>Open a standalone report when a saved detail is loaded.</p>
        </article>
      </div>

      <div id="report" className="saved-workflow-strip">
        <div>
          <span>History workspace</span>
          <p>Load local saved analyses, open a stored dashboard, then access its HTML report.</p>
        </div>
        <div className="saved-mini-visual" aria-hidden="true">
          <span />
          <span />
          <span />
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
          <p>Run a valid CSV or PDF analysis to save a local history entry.</p>
        </section>
      ) : null}

      {savedAnalyses.length > 0 ? (
        <div className="saved-history-layout">
          <div className="saved-history-list" aria-label="Saved analysis summaries">
            {savedAnalyses.map((analysis) => (
              <article
                className={
                  selectedAnalysis?.analysis_id === analysis.analysis_id
                    ? "saved-history-item saved-history-item-active"
                    : "saved-history-item"
                }
                key={analysis.analysis_id}
              >
                <div className="saved-history-item-heading">
                  <span>Saved result</span>
                  <h3>{analysis.source_filename}</h3>
                  <p>{analysis.created_at}</p>
                  {selectedAnalysis?.analysis_id === analysis.analysis_id ? (
                    <span className="selected-analysis-badge">Selected</span>
                  ) : null}
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
      <div className="metadata-preview-header">
        <span>Selected analysis</span>
        <h3 id="saved-detail-title">Saved Analysis Detail</h3>
      </div>

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
          <div className="report-callout">
            <div>
              <span>HTML report available</span>
              <p>Open a standalone report generated from this saved analysis response.</p>
            </div>
            <div className="saved-detail-actions">
              <button className="secondary-button" type="button" onClick={onClear}>
                Clear saved detail
              </button>
              {detail.analysis_id ? (
                <a
                  className="secondary-link-button report-link-button"
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
      <div className="section-heading dashboard-heading">
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
        <div className="loading-indicator" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h3>Analyzing file...</h3>
        <p>
          CampusInsight is validating or extracting the selected file and preparing deterministic
          analytics.
        </p>
      </section>
    );
  }

  if (uploadError) {
    return (
      <section className="result-panel result-panel-error" role="alert">
        <h3>Academic records upload could not be analyzed.</h3>
        <p>{uploadError}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="result-panel result-panel-empty" role="status" aria-live="polite">
        <h3>Validation result</h3>
        <p>
          Select a CSV or PDF file and submit it to see validation status and academic summary
          metrics. You can run analysis again with another file at any time.
        </p>
      </section>
    );
  }

  if (result.is_valid) {
    return (
      <section className="result-panel result-panel-success" role="status" aria-live="polite">
        <h3>Academic record validation passed.</h3>
        <dl className="result-summary">
          <div>
            <dt>File</dt>
            <dd>{fileName ?? "Uploaded file"}</dd>
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
      <h3>Academic record validation found issues.</h3>
      <p>Review the listed validation errors, update the source file, then retry the analysis.</p>
      <dl className="result-summary">
        <div>
          <dt>File</dt>
          <dd>{fileName ?? "Uploaded file"}</dd>
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

function getAcademicFileType(file: File): "CSV" | "PDF" {
  return file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf"
    ? "PDF"
    : "CSV";
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  const kilobytes = size / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

export default App;
