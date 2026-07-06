# CampusInsight Roadmap

## 1. Foundation

- Establish full-stack repository structure.
- Provide FastAPI health and welcome endpoints.
- Provide React + TypeScript + Vite frontend shell.
- Add initial tests, linting, formatting, sample data, and documentation.

## 2. Data Upload and Validation

- Define the canonical academic record schema.
- Add backend CSV validation for required columns, unknown columns, required values, and safe row-level errors.
- Add backend CSV upload validation endpoint.
- Add frontend CSV validation UI for selecting a file and displaying structured validation results.
- Add CSV and Excel upload flow.
- Return clear row-level validation errors.
- Keep uploaded data local during development.

Current status: the schema, CSV validation service, backend CSV validation endpoint, and frontend CSV validation UI exist. Excel handling remains future work.

## 3. Analytics Engine

- Add deterministic backend analytics from validated academic records.
- Calculate GPA summary, semester trends, credit totals, grade distribution, course performance, and course risk indicators.
- Design test coverage around academic metric rules.

Current status: backend deterministic analytics endpoint and frontend analytics summary UI exist. Pandas expansion, AI, and prediction are not implemented.

## 4. Dashboard Visualizations

- Connect frontend to backend analytics endpoint with summary cards and tables.
- Add accessible charts for GPA trends, grade mix, credits, and course performance.
- Keep visualizations honest by displaying only user-provided or sample-derived data.

Current status: frontend summary cards, tables, and accessible charts exist for deterministic analytics results. Tables remain available as a fallback. Reports, AI, and prediction remain future work.

## 5. History and Reports

- Add SQLite persistence for local project history.
- Add backend APIs for listing, retrieving, and deleting saved analyses.
- Add minimal frontend saved analyses panel.
- Add saved analysis detail dashboard from stored canonical JSON.
- Add standalone HTML reports generated from saved canonical JSON.
- Generate downloadable academic insight reports.
- Track analysis runs and report metadata.

Current status: local SQLite persistence, saved analysis history APIs, frontend saved analyses foundation, saved analysis detail dashboard, and standalone HTML reports exist. Saved detail and reports use stored canonical analysis JSON, not CSV recalculation. Uploaded CSV files are not stored, local database files are ignored by Git, and PDF export remains future work.

## 6. Release Readiness

- Harden validation, errors, logging, and documentation.
- Add deployment notes.
- Prepare portfolio-ready screenshots and project narrative.
