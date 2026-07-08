# CampusInsight Showcase Checklist

Use this checklist before sharing CampusInsight on GitHub, LinkedIn, or in a portfolio review.

## Pre-Demo Validation

Run from the repository root:

```bash
make backend-test
make frontend-test
make lint
make format-check
make frontend-build
make check
```

Expected result: all commands pass. The frontend build may print a non-blocking Vite chunk-size warning.

## Local Demo Flow

1. Start the backend:

   ```bash
   source .venv/bin/activate
   uvicorn campusinsight_api.main:app --app-dir backend/src --reload
   ```

2. Start the frontend:

   ```bash
   cd frontend
   npm run dev
   ```

3. Open the frontend URL printed by Vite.
4. Upload `data/sample/academic_records_sample.csv`.
5. Confirm validation passes.
6. Upload a synthetic or privacy-safe text-based transcript PDF.
7. Confirm PDF extraction and analysis pass.
8. Review GPA summary, credit summary, charts, analytics tables, and course risk review.
9. Load saved analyses.
10. Open a saved analysis detail dashboard.
11. Open the standalone HTML report.

## Features to Demonstrate

- Strict CSV schema validation with safe row-level errors.
- Text-based PDF transcript extraction and deterministic transcript parsing.
- Deterministic academic analytics from validated records.
- Responsive dashboard cards, charts, and accessible tables.
- Local SQLite saved-analysis history.
- Saved analysis detail rendered from stored canonical JSON.
- Standalone HTML report generated from saved analysis data.
- Fictional demo dataset and verified screenshots.
- Privacy-safe PDF demo flow without committing real transcript PDFs.

## Screenshot Inventory

Desktop:

- `assets/screenshots/home-desktop.png`
- `assets/screenshots/upload-csv-pdf-desktop.png`
- `assets/screenshots/pdf-analysis-dashboard-desktop.png`
- `assets/screenshots/dashboard-charts-desktop.png`
- `assets/screenshots/saved-analyses-desktop.png`
- `assets/screenshots/saved-detail-desktop.png`
- `assets/screenshots/html-report-desktop.png`

Mobile:

- `assets/screenshots/home-mobile.png`
- `assets/screenshots/upload-csv-pdf-mobile.png`
- `assets/screenshots/dashboard-mobile.png`
- `assets/screenshots/saved-detail-mobile.png`

## GitHub README Checklist

- Product preview images resolve.
- Product preview images match the current visual baseline or are marked for refresh.
- Quick start commands are visible.
- Tech stack is current.
- API overview is current.
- Limitations are explicit.
- Demo data is identified as fictional.
- No fake deployment links or fake badges are shown.

## LinkedIn Post Checklist

- Present CampusInsight as a local full-stack portfolio project.
- Mention FastAPI, React, TypeScript, Vite, Recharts, SQLite, pytest, and Vitest.
- Mention the professional dashboard redesign only as frontend UI polish, not as a new backend capability.
- Mention deterministic analytics and saved HTML reports.
- Mention text-based PDF transcript support as deterministic parsing, not OCR or AI.
- Mention that screenshots use fictional sample data.
- Link to the GitHub repository.
- Avoid claiming production deployment, cloud infrastructure, or AI.

## Limitations to Mention Honestly

- Local SQLite persistence only.
- Uploaded CSV files are not stored.
- Uploaded PDF files are not stored.
- OCR for scanned PDFs is not implemented.
- No authentication.
- No cloud database.
- No deployment configuration.
- No Docker setup.
- No PDF export.
- No AI or prediction logic.
- Not positioned as production-ready software.

## Safety Boundaries

Do not show real student records, private academic data, real NIM/student IDs, birth dates, raw CSV contents, local database files, stack traces, local absolute paths, or SQLite internals in screenshots or posts.

Do not claim academic failure prediction, guaranteed improvement, AI insights, OCR, PDF export, authentication, deployment, cloud database, or production readiness.
