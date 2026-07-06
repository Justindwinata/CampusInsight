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
- Add CSV and Excel upload flow.
- Return clear row-level validation errors.
- Keep uploaded data local during development.

Current status: the schema, CSV validation service, and backend CSV validation endpoint exist. Frontend upload UI, Excel handling, and analytics remain future work.

## 3. Analytics Engine

- Add Pandas-based data processing.
- Calculate GPA summary, semester trends, credit totals, and grade distribution.
- Design test coverage around academic metric rules.

## 4. Dashboard Visualizations

- Connect frontend to backend analytics endpoints.
- Add accessible charts for GPA trends, grade mix, credits, and course performance.
- Keep visualizations honest by displaying only user-provided or sample-derived data.

## 5. History and Reports

- Add SQLite persistence for local project history.
- Generate downloadable academic insight reports.
- Track analysis runs and report metadata.

## 6. Release Readiness

- Harden validation, errors, logging, and documentation.
- Add deployment notes.
- Prepare portfolio-ready screenshots and project narrative.
