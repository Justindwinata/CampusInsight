# CampusInsight

CampusInsight is a full-stack student performance analytics dashboard built as a portfolio project. It validates academic record CSV files, calculates deterministic academic metrics, displays responsive analytics dashboards, saves analysis history locally, and generates standalone HTML reports from saved results.

The project is designed for local demos and GitHub review. It uses fictional sample data only and does not implement authentication, cloud persistence, deployment, PDF export, AI, or prediction logic.

## Product Preview

### Desktop

![CampusInsight desktop home](assets/screenshots/home-desktop.png)

![CampusInsight desktop dashboard charts](assets/screenshots/dashboard-charts-desktop.png)

![CampusInsight standalone HTML report](assets/screenshots/html-report-desktop.png)

### Mobile

![CampusInsight mobile home](assets/screenshots/home-mobile.png)

![CampusInsight mobile dashboard](assets/screenshots/dashboard-mobile.png)

## Core Features

- Strict academic record CSV validation with safe structured errors.
- Deterministic GPA, credit, semester, grade, course, and course-risk analytics.
- Responsive React dashboard with summary cards, charts, and accessible tables.
- Local SQLite saved-analysis history.
- Saved analysis detail view rendered from stored canonical JSON.
- Standalone HTML report generation for saved analyses.
- Fictional sample dataset for local demo and screenshots.

## Tech Stack

- Frontend: React, TypeScript, Vite, Recharts
- Backend: FastAPI, Python
- Persistence: local SQLite
- Testing: pytest, Vitest, React Testing Library
- Quality: ruff, eslint, prettier

## Architecture Summary

```text
Academic CSV
  -> FastAPI upload validation
  -> deterministic analytics service
  -> canonical analysis JSON
  -> local SQLite saved history
  -> React dashboard and HTML report
```

Uploaded CSV files are not stored. Successful analyses are saved as canonical JSON responses in local SQLite so saved details and reports do not require CSV re-upload or frontend recalculation.

## Demo Data

Use the fictional sample CSV:

```text
data/sample/academic_records_sample.csv
```

The sample data contains synthetic student identifiers and fictional names. Do not use real student records in screenshots, commits, or public demos.

## Quick Start

Run these commands from a fresh clone before using the Makefile targets.

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e "backend[dev]"
uvicorn campusinsight_api.main:app --app-dir backend/src --reload
```

Backend health check:

```text
http://127.0.0.1:8000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server prints the local frontend URL.

The app creates `data/database/campusinsight.sqlite3` automatically after the first successful saved analysis. Local database files are ignored by Git.

## Developer Commands

From the repository root:

```bash
make backend-test
make frontend-test
make test
make lint
make format-check
make frontend-build
make check
```

`make check` runs backend tests, frontend tests, linting, formatting checks, and the production frontend build.

The current Vite production build may print a chunk-size warning because charting dependencies are bundled into the demo app. The warning is non-blocking; the build still succeeds.

## Local Demo Flow

1. Start the backend.
2. Start the frontend.
3. Upload `data/sample/academic_records_sample.csv`.
4. Review validation status, summary cards, charts, tables, and course risk review.
5. Load saved analyses.
6. Open a saved analysis detail dashboard.
7. Open the standalone HTML report.

## API Overview

- `GET /health`
- `GET /`
- `POST /academic-records/validate`
- `POST /academic-records/analyze`
- `GET /analyses`
- `GET /analyses/{analysis_id}`
- `DELETE /analyses/{analysis_id}`
- `GET /analyses/{analysis_id}/report.html`

## Documentation

- [Roadmap](docs/ROADMAP.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Decision Log](docs/DECISION_LOG.md)
- [Demo Assets](docs/DEMO_ASSETS.md)

## Limitations and Safety Boundaries

- Local SQLite persistence only.
- No cloud database.
- No authentication.
- No deployment configuration.
- No PDF export.
- No AI or prediction logic.
- No academic failure prediction or guaranteed outcome claims.
- Not positioned as production-ready software.
