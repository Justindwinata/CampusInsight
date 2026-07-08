# CampusInsight

CampusInsight is a full-stack student performance analytics dashboard built as a portfolio project. It analyzes academic record CSV files and supported text-based academic transcript PDFs, calculates deterministic academic metrics, displays responsive dashboards, saves analysis history locally, and generates standalone HTML reports from saved results.

The project is designed for local demos and GitHub review. It uses fictional sample data only and does not implement authentication, cloud persistence, deployment, PDF export, AI, or prediction logic.

The frontend now uses a professional SaaS-style app shell with top navigation, structured dashboard sections, polished analytics cards, clearer saved-analysis flow, and responsive layouts for local demos.

## Product Preview

The screenshots below show the current local demo flow after the professional UI redesign and PDF transcript support.

### Desktop

![CampusInsight desktop home](assets/screenshots/home-desktop.png)

![CampusInsight CSV and PDF upload](assets/screenshots/upload-csv-pdf-desktop.png)

![CampusInsight PDF analysis dashboard](assets/screenshots/pdf-analysis-dashboard-desktop.png)

![CampusInsight desktop dashboard charts](assets/screenshots/dashboard-charts-desktop.png)

![CampusInsight standalone HTML report](assets/screenshots/html-report-desktop.png)

### Mobile

![CampusInsight mobile home](assets/screenshots/home-mobile.png)

![CampusInsight mobile CSV and PDF upload](assets/screenshots/upload-csv-pdf-mobile.png)

![CampusInsight mobile dashboard](assets/screenshots/dashboard-mobile.png)

## Core Features

- Academic record CSV upload and validation with safe structured errors.
- Text-based academic transcript PDF upload with rule-based extraction, metadata parsing, course parsing, and normalization into the same analytics schema.
- Deterministic GPA, credit, semester, grade, course, and course-risk analytics.
- Responsive React dashboard with summary cards, charts, and accessible tables.
- Local SQLite saved-analysis history.
- Saved analysis history and detail views rendered from stored canonical JSON.
- Standalone HTML report generation for saved analyses.
- Fictional sample dataset for local demo and screenshots.

## Tech Stack

- Frontend: React, TypeScript, Vite, Recharts
- Backend: FastAPI, Python, pypdf
- Persistence: local SQLite
- Testing: pytest, Vitest, React Testing Library
- Quality: ruff, eslint, prettier

## Architecture Summary

```text
Academic CSV or supported transcript PDF
  -> FastAPI upload validation or PDF text extraction
  -> normalized academic record schema
  -> deterministic analytics service
  -> canonical analysis JSON
  -> local SQLite saved history
  -> React dashboard and HTML report
```

Uploaded CSV and PDF files are not stored. Successful analyses are saved as canonical JSON responses in local SQLite so saved details and reports do not require file re-upload or frontend recalculation.

## Demo Data

Use the fictional sample CSV:

```text
data/sample/academic_records_sample.csv
```

The sample data contains synthetic student identifiers and fictional names. Do not use real student records in screenshots, commits, or public demos.

For PDF demos, use only a synthetic or privacy-safe text-based transcript PDF. Real transcript PDFs must not be committed or shown in public screenshots. Local transcript PDFs under `data/sample/*.pdf` are ignored by Git to reduce the risk of exposing private academic documents.

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
4. Upload a synthetic or privacy-safe text-based academic transcript PDF.
5. Review validation/extraction status, summary cards, charts, tables, and course risk review.
6. Load saved analyses.
7. Open a saved analysis detail dashboard.
8. Open the standalone HTML report.

## API Overview

- `GET /health`
- `GET /`
- `POST /academic-records/validate`
- `POST /academic-records/analyze`
- `POST /academic-records/analyze-pdf`
- `GET /analyses`
- `GET /analyses/{analysis_id}`
- `DELETE /analyses/{analysis_id}`
- `GET /analyses/{analysis_id}/report.html`

## Documentation

- [Roadmap](docs/ROADMAP.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Decision Log](docs/DECISION_LOG.md)
- [Demo Assets](docs/DEMO_ASSETS.md)
- [Showcase Checklist](docs/SHOWCASE_CHECKLIST.md)

## Limitations and Safety Boundaries

- Local SQLite persistence only.
- PDF transcript processing supports text-based transcript PDFs with recognizable student metadata and course rows; OCR is not implemented.
- PDF-derived score values are normalized deterministically from grade points because transcript PDFs may not include raw score columns.
- No cloud database.
- No authentication.
- No deployment configuration.
- No PDF export.
- No AI or prediction logic.
- No academic failure prediction or guaranteed outcome claims.
- Not positioned as production-ready software.
