# CampusInsight System Architecture

## Current Foundation

CampusInsight currently contains two independent application foundations:

- `backend/`: FastAPI service with health and root status endpoints.
- `backend/src/campusinsight_api/api/`: API routes, including CSV upload validation and analysis.
- `backend/src/campusinsight_api/domain/`: academic record schema and analytics contract definitions.
- `backend/src/campusinsight_api/services/`: CSV validation and deterministic analytics services.
- `frontend/`: React + TypeScript + Vite application shell with CSV validation, analytics summary UI, tables, and charts.

No database persistence, authentication, AI prediction, or report generation is implemented yet.

## Intended Future Pipeline

```text
CSV/Excel Upload
  -> Validation
  -> Cleaning
  -> Academic Metrics
  -> Risk Detection
  -> Dashboard
  -> Report
```

## Backend Boundary

The backend owns API contracts, validation, academic metric computation, and future persistence. The current implementation includes service-layer CSV validation, `POST /academic-records/validate`, and `POST /academic-records/analyze`. The analytics endpoint validates the CSV first, returns validation errors for invalid input, and only calculates deterministic metrics from valid records.

## Frontend Boundary

The frontend owns the current CSV selection, validation, and analytics summary workflow. It displays validation status, GPA and credit summary cards, semester and course tables, grade distribution, course score visualizations, and safe course risk review. Charts use deterministic backend analytics only, and tables remain available as an accessible fallback. History, persistence, and report actions remain future work.

## Future Work Markers

- Pandas-based expansion is future work.
- SQLite local persistence is future work.
- Downloadable reports are future work.
