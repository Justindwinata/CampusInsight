# CampusInsight System Architecture

## Current Foundation

CampusInsight currently contains a local full-stack application with separate backend and frontend layers:

- `backend/`: FastAPI service with health and root status endpoints.
- `backend/src/campusinsight_api/api/`: API routes, including CSV upload validation, CSV/PDF analysis, and saved analysis history.
- `backend/src/campusinsight_api/domain/`: academic record schema, analytics contracts, and saved analysis summary contracts.
- `backend/src/campusinsight_api/services/`: CSV validation, PDF text extraction, transcript parsing, transcript normalization, deterministic analytics, SQLite saved analysis repository, and HTML report rendering services.
- `frontend/`: React + TypeScript + Vite application shell with multi-view navigation, SaaS-style landing structure, hero cover integration, CSV/PDF upload support, analytics summary UI, tables, charts with empty states, saved analyses panel, saved analysis detail dashboard, responsive layout polish, reduced-motion-aware interactions, and HTML report action.

Local SQLite persistence exists for saved analysis results, and standalone HTML reports exist for saved analyses. The app is demo-ready for local portfolio walkthroughs, but deployment, authentication, cloud database persistence, AI, prediction logic, OCR, and PDF export are not implemented. The current UI polish is frontend presentation work only; it did not add backend capability, change analytics formulas, or change persistence schema.

Demo screenshots under `assets/screenshots/` are captured from the actual local application using fictional CSV data and a synthetic text-based transcript PDF. They do not include raw CSV contents, real transcript data, local database paths, terminal windows, or browser developer tools. CI-0017 refreshed the screenshot set after the CI-0016 app shell and dashboard redesign; screenshots should be refreshed again after the CI-0018 multi-page hero/navigation update.

## Intended Future Pipeline

```text
CSV Upload
  -> Validation
  -> Cleaning
  -> Academic Metrics
  -> Risk Detection
  -> Dashboard
  -> Local Saved Analysis History
  -> Standalone HTML Report

Text-based Transcript PDF Upload
  -> PDF Text Extraction
  -> Rule-Based Metadata Parser
  -> Rule-Based Course Parser
  -> AcademicRecord Normalization
  -> Cleaning
  -> Academic Metrics
  -> Risk Detection
  -> Dashboard
  -> Local Saved Analysis History
  -> Standalone HTML Report
```

## Backend Boundary

The backend owns API contracts, validation, academic metric computation, local persistence, and HTML report rendering. The current implementation includes service-layer CSV validation, PDF text extraction, rule-based transcript metadata and course parsing, transcript normalization, `POST /academic-records/validate`, `POST /academic-records/analyze`, `POST /academic-records/analyze-pdf`, `GET /analyses`, `GET /analyses/{analysis_id}`, `DELETE /analyses/{analysis_id}`, and `GET /analyses/{analysis_id}/report.html`. CSV analysis validates the CSV first. PDF analysis extracts text, parses supported transcript fields, normalizes parsed courses into the existing `AcademicRecord` schema, and then uses the same deterministic analytics service as CSV.

Successful analyses are stored as canonical JSON responses in local SQLite at `data/database/campusinsight.sqlite3`. Saved detail retrieval and HTML report generation use that stored canonical response. Uploaded CSV files, uploaded PDF files, absolute local file paths, and raw local database files are not stored in Git.

## Frontend Boundary

The frontend owns the current CSV/PDF selection, validation/extraction status, analytics summary workflow, saved analyses history foundation, saved detail dashboard, HTML report action, multi-view navigation, and responsive presentation layer. Its SaaS-style layout uses original CampusInsight copy and styling inspired by modern product structure without copying third-party branding, assets, colors, or text. It displays a dedicated home experience with the project hero cover image, validation status, GPA and credit summary cards, semester and course tables, grade distribution, course score visualizations, safe course risk review, saved analysis metadata summaries, full saved dashboards from stored JSON, and a report link for loaded saved details. Charts use deterministic backend analytics only, render explicit empty states when chart data is unavailable, and tables remain available as an accessible fallback.

The frontend does not generate reports itself, recalculate saved metrics, or require CSV re-upload for saved detail or report access.

## Future Work Markers

- Pandas-based expansion is future work.
- OCR for scanned transcript PDFs is future work.
- Broader transcript layout support is future work.
- PDF export is future work.
- Authentication is future work.
- Cloud database persistence is future work.
- Deployment configuration is future work.
