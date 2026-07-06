# CampusInsight System Architecture

## Current Foundation

CampusInsight currently contains two independent application foundations:

- `backend/`: FastAPI service with health and root status endpoints.
- `backend/src/campusinsight_api/api/`: API routes, including CSV upload validation, analysis, and saved analysis history.
- `backend/src/campusinsight_api/domain/`: academic record schema, analytics contracts, and saved analysis summary contracts.
- `backend/src/campusinsight_api/services/`: CSV validation, deterministic analytics, SQLite saved analysis repository, and HTML report rendering services.
- `frontend/`: React + TypeScript + Vite application shell with CSV validation, analytics summary UI, tables, charts, saved analyses panel, and saved analysis detail dashboard.

Local SQLite persistence exists for saved analysis results, and standalone HTML reports exist for saved analyses. Authentication, cloud database persistence, AI prediction, and PDF export are not implemented.

## Intended Future Pipeline

```text
CSV/Excel Upload
  -> Validation
  -> Cleaning
  -> Academic Metrics
  -> Risk Detection
  -> Dashboard
  -> Local Saved Analysis History
  -> Standalone HTML Report
```

## Backend Boundary

The backend owns API contracts, validation, academic metric computation, local persistence, and HTML report rendering. The current implementation includes service-layer CSV validation, `POST /academic-records/validate`, `POST /academic-records/analyze`, `GET /analyses`, `GET /analyses/{analysis_id}`, `DELETE /analyses/{analysis_id}`, and `GET /analyses/{analysis_id}/report.html`. The analytics endpoint validates the CSV first, returns validation errors for invalid input, and only calculates deterministic metrics from valid records.

Successful analyses are stored as canonical JSON responses in local SQLite at `data/database/campusinsight.sqlite3`. Saved detail retrieval and HTML report generation use that stored canonical response. Uploaded CSV files are not stored, absolute local file paths are not stored, and local database files are ignored by Git.

## Frontend Boundary

The frontend owns the current CSV selection, validation, analytics summary workflow, saved analyses history foundation, saved detail dashboard, and HTML report action. It displays validation status, GPA and credit summary cards, semester and course tables, grade distribution, course score visualizations, safe course risk review, saved analysis metadata summaries, full saved dashboards from stored JSON, and a report link for loaded saved details. Charts use deterministic backend analytics only, and tables remain available as an accessible fallback.

The frontend does not generate reports itself, recalculate saved metrics, or require CSV re-upload for saved detail or report access.

## Future Work Markers

- Pandas-based expansion is future work.
- PDF export is future work.
- Authentication is future work.
- Cloud database persistence is future work.
