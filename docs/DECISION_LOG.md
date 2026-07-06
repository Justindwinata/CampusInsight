# CampusInsight Decision Log

## 2026-07-06: Initial Foundation Decisions

- Use React + TypeScript for the frontend to show a modern portfolio-grade UI foundation.
- Use Vite for fast local frontend development and production builds.
- Use FastAPI for the backend because it provides clear API contracts, Python ergonomics, and simple testability.
- Plan Pandas for future analytics because academic records are naturally tabular.
- Use SQLite for local saved analysis persistence so the portfolio project can support history without introducing cloud infrastructure.
- Store canonical analysis response JSON, not uploaded CSV files, to preserve the computed result while avoiding raw file retention.
- Reuse stored canonical analysis JSON for saved detail dashboards so saved history does not require CSV re-upload or analytics recalculation.
- Ignore local database files under `data/database/` so personal local history is not committed to Git.
- Do not add Docker initially to keep the first bootstrap simple for local development.
- Do not add authentication initially because the first portfolio version is focused on local academic analytics workflows.
- Do not add cloud database persistence, AI, prediction logic, or report generation during the local history foundation.
