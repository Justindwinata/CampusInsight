import { FormEvent, useId, useState } from "react";

import {
  AcademicRecordsValidationResult,
  validateAcademicRecordsCsv,
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
  const [validationResult, setValidationResult] = useState<AcademicRecordsValidationResult | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationResult(null);
    setUploadError(null);

    if (!selectedFile) {
      setUploadError("Choose an academic records CSV file before validating.");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateAcademicRecordsCsv(selectedFile);
      setValidationResult(result);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "The CSV file could not be validated. Please retry.",
      );
    } finally {
      setIsValidating(false);
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
          <p>Academic record CSV files can now be validated through the backend endpoint.</p>
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
                setValidationResult(null);
                setUploadError(null);
              }}
            />

            <div className="selected-file" aria-live="polite">
              {selectedFile ? selectedFile.name : "No CSV file selected."}
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={!selectedFile || isValidating}
            >
              {isValidating ? "Validating CSV..." : "Validate CSV"}
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
          isLoading={isValidating}
          result={validationResult}
          uploadError={uploadError}
        />
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
  result: AcademicRecordsValidationResult | null;
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
        <h3>Validating CSV...</h3>
        <p>CampusInsight is checking the selected file against the academic record schema.</p>
      </section>
    );
  }

  if (uploadError) {
    return (
      <section className="result-panel result-panel-error" role="alert">
        <h3>CSV upload could not be validated.</h3>
        <p>{uploadError}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="result-panel result-panel-empty" aria-live="polite">
        <h3>Validation result</h3>
        <p>Select a CSV file and submit it to see schema and row-level validation results.</p>
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
            <dd>{result.row_count}</dd>
          </div>
          <div>
            <dt>Records accepted</dt>
            <dd>{result.records.length}</dd>
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
          <dd>{result.row_count}</dd>
        </div>
        <div>
          <dt>Error count</dt>
          <dd>{result.errors.length}</dd>
        </div>
      </dl>

      <div className="error-list" aria-label="Validation errors">
        {result.errors.map((error, index) => (
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
