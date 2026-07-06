# CampusInsight System Architecture

## Current Foundation

CampusInsight currently contains two independent application foundations:

- `backend/`: FastAPI service with health and root status endpoints.
- `frontend/`: React + TypeScript + Vite application shell.

No analytics, file upload, chart rendering, database persistence, authentication, or report generation is implemented in this bootstrap contract.

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

The backend will own API contracts, validation, academic metric computation, and future persistence. The current package layout reserves clear locations for route modules, core configuration, domain objects, and services.

## Frontend Boundary

The frontend will own the user workflow for upload, analysis review, dashboard exploration, and report actions. The current app displays only future capability placeholders and does not present fake analytics.

## Future Work Markers

- Upload handling is future work.
- Pandas data cleaning and academic metric computation are future work.
- SQLite local persistence is future work.
- Dashboard charts are future work.
- Downloadable reports are future work.
