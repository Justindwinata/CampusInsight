# CampusInsight System Architecture

## Current Foundation

CampusInsight currently contains two independent application foundations:

- `backend/`: FastAPI service with health and root status endpoints.
- `backend/src/campusinsight_api/api/`: API routes, including CSV upload validation and analysis.
- `backend/src/campusinsight_api/domain/`: academic record schema and analytics contract definitions.
- `backend/src/campusinsight_api/services/`: CSV validation and deterministic analytics services.
- `frontend/`: React + TypeScript + Vite application shell with CSV validation UI.

No chart rendering, database persistence, authentication, AI prediction, or report generation is implemented yet.

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

The frontend owns the current CSV selection and validation workflow. It displays validation summaries and row-level errors returned by the backend, while analytics review, dashboard charts, and report actions remain future work.

## Future Work Markers

- Full frontend-to-backend analytics workflow is future work.
- Pandas-based expansion is future work.
- SQLite local persistence is future work.
- Dashboard charts are future work.
- Downloadable reports are future work.
