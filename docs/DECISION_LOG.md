# CampusInsight Decision Log

## 2026-07-06: Initial Foundation Decisions

- Use React + TypeScript for the frontend to show a modern portfolio-grade UI foundation.
- Use Vite for fast local frontend development and production builds.
- Use FastAPI for the backend because it provides clear API contracts, Python ergonomics, and simple testability.
- Plan Pandas for future analytics because academic records are naturally tabular.
- Use SQLite for local saved analysis persistence so the portfolio project can support history without introducing cloud infrastructure.
- Store canonical analysis response JSON, not uploaded CSV files, to preserve the computed result while avoiding raw file retention.
- Reuse stored canonical analysis JSON for saved detail dashboards so saved history does not require CSV re-upload or analytics recalculation.
- Generate standalone HTML reports on the backend from stored canonical JSON to avoid frontend-side report generation and avoid PDF complexity at this stage.
- Add PDF transcript input support with `pypdf` text extraction and deterministic rule-based parsing. The PDF pipeline normalizes parsed transcript records into the existing `AcademicRecord` schema so the analytics engine, saved analyses, dashboard, and reports do not need source-specific formulas.
- Do not add OCR yet; scanned PDFs remain future work.
- For PDF transcripts without raw score columns, derive a deterministic normalized score from grade point for compatibility with the existing analytics schema.
- Polish the frontend for local portfolio demos with responsive layout, accessible state messaging, visible focus behavior, and table fallbacks for charted data.
- Redesign the frontend presentation around a professional SaaS-style app shell, clear navigation, consistent design tokens, polished dashboard cards, and clearer saved-analysis report actions without adding backend capability.
- Refine the SaaS UI again using modern product structure as inspiration only. Do not copy third-party branding, assets, colors, or text; keep the CampusInsight identity original and grounded in academic analytics.
- Commit verified demo screenshots and README preview assets from the running local application, using fictional sample data only.
- Refresh demo screenshots after PDF support using fictional CSV data and a synthetic text-based PDF transcript; real transcript PDFs remain ignored and must not be committed.
- Ignore local database files under `data/database/` so personal local history is not committed to Git.
- Do not add Docker initially to keep the first bootstrap simple for local development.
- Do not add authentication initially because the first portfolio version is focused on local academic analytics workflows.
- Do not add cloud database persistence, deployment, AI, prediction logic, authentication, or PDF export during the current portfolio-ready scope.
