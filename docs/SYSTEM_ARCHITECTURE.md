# CampusInsight System Architecture

## Current Foundation

CampusInsight currently contains two independent application foundations:

- `backend/`: FastAPI service with health and root status endpoints.
- `backend/src/campusinsight_api/domain/`: academic record schema definitions.
- `backend/src/campusinsight_api/services/`: CSV validation service for academic records.
- `frontend/`: React + TypeScript + Vite application shell.

No analytics, file upload endpoint, frontend upload UI, chart rendering, database persistence, authentication, or report generation is implemented yet.

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

The backend owns API contracts, validation, academic metric computation, and future persistence. The current implementation includes service-layer CSV validation, but it is not exposed through an upload endpoint yet.

## Frontend Boundary

The frontend will own the user workflow for upload, analysis review, dashboard exploration, and report actions. The current app displays only future capability placeholders and does not present fake analytics.

## Future Work Markers

- Upload handling is future work.
- Frontend upload UI is future work.
- Pandas data cleaning and academic metric computation are future work.
- SQLite local persistence is future work.
- Dashboard charts are future work.
- Downloadable reports are future work.
