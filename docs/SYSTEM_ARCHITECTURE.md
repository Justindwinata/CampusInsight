# CampusInsight System Architecture

## Current Foundation

CampusInsight currently contains two independent application foundations:

- `backend/`: FastAPI service with health and root status endpoints.
- `backend/src/campusinsight_api/api/`: API routes, including CSV upload validation.
- `backend/src/campusinsight_api/domain/`: academic record schema definitions.
- `backend/src/campusinsight_api/services/`: CSV validation service for academic records.
- `frontend/`: React + TypeScript + Vite application shell with CSV validation UI.

No analytics, chart rendering, database persistence, authentication, or report generation is implemented yet.

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

The backend owns API contracts, validation, academic metric computation, and future persistence. The current implementation includes service-layer CSV validation and `POST /academic-records/validate`, which accepts one CSV upload and returns the structured validation result without storing records.

## Frontend Boundary

The frontend owns the current CSV selection and validation workflow. It displays validation summaries and row-level errors returned by the backend, while analytics review, dashboard exploration, and report actions remain future work.

## Future Work Markers

- Full frontend-to-backend analytics workflow is future work.
- Pandas data cleaning and academic metric computation are future work.
- SQLite local persistence is future work.
- Dashboard charts are future work.
- Downloadable reports are future work.
