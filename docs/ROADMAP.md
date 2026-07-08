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
- Add CSV upload flow.
- Add rule-based PDF transcript text extraction, transcript metadata parsing, course parsing, and normalization into the academic analytics schema.
- Add Excel upload handling.
- Add OCR for scanned transcript PDFs.
- Return clear row-level validation errors.
- Keep uploaded data local during development.

Current status: the schema, CSV validation service, backend CSV validation endpoint, frontend upload UI, and supported text-based PDF transcript analysis flow exist. PDF parsing is deterministic and rule-based for recognizable transcript text. Excel handling and OCR for scanned PDFs remain future work.

## 3. Analytics Engine

- Add deterministic backend analytics from validated academic records.
- Calculate GPA summary, semester trends, credit totals, grade distribution, course performance, and course risk indicators.
- Design test coverage around academic metric rules.

Current status: backend deterministic analytics endpoints and frontend analytics summary UI exist for CSV records and normalized supported PDF transcript records. Pandas expansion, AI, and prediction are not implemented.

## 4. Dashboard Visualizations

- Connect frontend to backend analytics endpoint with summary cards and tables.
- Add accessible charts for GPA trends, grade mix, credits, and course performance.
- Keep visualizations honest by displaying only user-provided or sample-derived data.

Current status: frontend summary cards, tables, and accessible charts exist for deterministic analytics results. Tables remain available as a fallback. PDF export, AI, and prediction remain future work.

## 5. History and Reports

- Add SQLite persistence for local project history.
- Add backend APIs for listing, retrieving, and deleting saved analyses.
- Add minimal frontend saved analyses panel.
- Add saved analysis detail dashboard from stored canonical JSON.
- Add standalone HTML reports generated from saved canonical JSON.
- Add PDF export or additional downloadable report formats beyond standalone HTML.
- Track analysis runs and report metadata.

Current status: local SQLite persistence, saved analysis history APIs, frontend saved analyses foundation, saved analysis detail dashboard, and standalone HTML reports exist. Saved detail and HTML reports use stored canonical analysis JSON, not CSV recalculation. Uploaded CSV files are not stored, local database files are ignored by Git, and PDF export or additional report formats remain future work.

## 6. Release Readiness

- Harden validation, errors, logging, and documentation.
- Add deployment notes.
- Prepare portfolio-ready screenshots and project narrative.

Current status: the frontend has a professional SaaS-style app shell, responsive layout polish, clearer state messaging, and local demo-ready interaction flow for upload, analytics, saved history, saved detail, and HTML reports. Deployment, authentication, cloud database persistence, PDF export, AI, and prediction remain future work.

Portfolio presentation status: verified desktop and mobile screenshots exist, the README includes product preview images, and demo documentation identifies the fictional sample dataset and screenshot safety policy. Screenshots should be refreshed after the CI-0014 professional UI redesign when a new visual baseline is needed.
