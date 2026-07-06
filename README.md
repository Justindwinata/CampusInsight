# CampusInsight

CampusInsight is a full-stack portfolio project for a student performance analytics dashboard. The long-term goal is to help users upload academic records and explore GPA summaries, semester trends, grade distribution, course performance, credit summaries, at-risk courses, academic insights, and downloadable reports.

The current repository includes the application foundation, CSV validation workflow, backend deterministic academic analytics foundation, and frontend analytics summary UI. It does not implement dashboard charts, database persistence, authentication, history, or reports yet.

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: FastAPI, Python
- Future analytics: Pandas
- Backend testing: pytest
- Frontend testing: Vitest, React Testing Library
- Formatting and linting: ruff, eslint, prettier
- Package managers: Python venv, npm

## Project Structure

```text
backend/    FastAPI application and backend tests
frontend/   React + TypeScript + Vite application
data/       Fictional sample datasets
docs/       Roadmap, architecture, and decision log
```

## Current Backend Capability

The backend defines a canonical academic record schema, a CSV validation service, `POST /academic-records/validate` for validating uploaded academic record CSV files, and `POST /academic-records/analyze` for deterministic analytics from validated CSV records. The validator checks required columns, rejects unknown columns, validates required values and numeric ranges, verifies accepted grade letters, and returns structured user-safe validation errors.

The endpoint accepts multipart form data with a `file` field. Valid CSV structure with invalid rows returns HTTP 200 and `is_valid: false`; missing, empty, unreadable, or non-CSV uploads return HTTP 400 with a safe validation response.

The analytics endpoint calculates GPA summary, semester performance, grade distribution, course performance, credit summary, and deterministic course risk indicators. It does not use AI, does not predict failure, and does not calculate analytics from invalid CSV records.

## Current Frontend Capability

The frontend includes a CSV validation and analytics section on the home page. Users can select an academic records CSV, submit it to the backend analytics endpoint, and review validation status, GPA summary, credit summary, semester performance, grade distribution, course performance, and course risk review. Results are displayed as cards and tables only.

## Local Setup

### Backend

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e "backend[dev]"
uvicorn campusinsight_api.main:app --app-dir backend/src --reload
```

The API health endpoint is available at `http://127.0.0.1:8000/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server prints the local application URL.

## Developer Commands

From the repository root:

```bash
make backend-test
make frontend-test
make test
make lint
make format-check
make check
```

`make check` runs backend tests, frontend tests, linting, formatting checks, and the frontend production build.

## Roadmap Summary

1. Foundation
2. Data upload and validation
3. Analytics engine
4. Dashboard visualizations
5. History and reports
6. Release readiness

See [docs/ROADMAP.md](docs/ROADMAP.md) for the phased roadmap.

## Limitations

- No chart-based analytics dashboard is implemented yet.
- No database persistence exists yet.
- No charts or downloadable reports are implemented yet.
- Analytics are deterministic backend calculations only; no AI prediction exists.
