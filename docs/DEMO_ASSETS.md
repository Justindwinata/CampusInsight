# Demo Assets

CampusInsight demo assets must be captured from the real local application using fictional data only.

## Demo Dataset

Use `data/sample/academic_records_sample.csv` for CSV screenshots and portfolio walkthroughs.

The sample dataset is fictional. It contains synthetic student identifiers, fictional student names, academic terms, course records, grades, credits, and scores. It must not be replaced with real student data, private records, exported classroom files, or personally identifiable academic information.

The sample file currently provides enough variation for:

- GPA and credit summary cards
- semester performance charts
- grade distribution charts
- course score charts
- detailed analytics tables
- course risk review
- saved analysis history
- saved analysis detail
- standalone HTML report output

## PDF Transcript Demo Policy

CampusInsight supports text-based academic transcript PDFs as an additional input source. PDF screenshots and demos must use a synthetic or privacy-safe transcript only.

Do not commit real transcript PDFs. Local private PDFs under `data/sample/*.pdf` are ignored by Git because they may contain real names, student IDs, birth dates, course history, or other private academic data.

Supported PDF demo boundaries:

- PDF text must be selectable/extractable.
- Transcript values must be fictional.
- Student name, student ID, faculty/program values, and course rows must not identify a real student.
- OCR for scanned/image-only PDFs is not implemented.
- Parsing is deterministic and rule-based, not AI-based.
- PDF-derived analytics must come from the backend parser and existing analytics engine, not from fabricated screenshot values.

## Screenshot Capture Policy

Screenshots must be captured from the actual running CampusInsight app. Do not use mockups, edited fake dashboards, terminal screenshots, browser developer tools, or fabricated analytics values.

CI-0017 refreshes the screenshot set after the CI-0016 SaaS-style UI redesign. New screenshots must show the latest neutral analytics shell, upload workflow, dashboard hierarchy, saved analyses workflow, saved detail dashboard, and report action. The redesign used modern SaaS product structure as high-level inspiration only; screenshots and documentation must not imply that CampusInsight copied third-party branding, assets, colors, or text.

Before capturing screenshots:

- Start the FastAPI backend locally.
- Start the Vite frontend locally.
- Analyze `data/sample/academic_records_sample.csv`.
- Analyze a synthetic or privacy-safe text-based transcript PDF when demonstrating PDF support.
- Confirm the dashboard renders real analytics returned by the backend.
- Confirm saved analysis detail and HTML report views use stored canonical analysis JSON.

Screenshots must avoid:

- real student data
- real NIM/student IDs
- real birth dates
- private transcript contents
- raw CSV file contents
- local absolute file paths
- local SQLite file paths or internals
- stack traces
- unsupported product claims
- browser developer tools
- terminal windows

## Recommended Demo Flow

1. Open the local frontend home page.
2. Select the fictional sample CSV.
3. Run the CSV analysis.
4. Select a synthetic or privacy-safe text-based transcript PDF.
5. Run the PDF analysis.
6. Review validation/extraction status and summary cards.
7. Review charts and tables.
8. Load saved analyses.
9. Open a saved analysis detail dashboard.
10. Open the standalone HTML report.

## Recommended Viewports

- Desktop screenshots: around `1280px` wide.
- Mobile screenshots: around `390px` wide.
- Narrow validation: around `320px` wide.

## Current Screenshot Inventory

Desktop screenshots captured from the local app after the CI-0016 SaaS UI redesign:

- `assets/screenshots/home-desktop.png`
- `assets/screenshots/upload-csv-pdf-desktop.png`
- `assets/screenshots/pdf-analysis-dashboard-desktop.png`
- `assets/screenshots/dashboard-charts-desktop.png`
- `assets/screenshots/saved-analyses-desktop.png`
- `assets/screenshots/saved-detail-desktop.png`
- `assets/screenshots/html-report-desktop.png`

Mobile screenshots captured from the local app after the CI-0016 SaaS UI redesign:

- `assets/screenshots/home-mobile.png`
- `assets/screenshots/upload-csv-pdf-mobile.png`
- `assets/screenshots/dashboard-mobile.png`
- `assets/screenshots/saved-detail-mobile.png`

The README product preview uses selected files from this inventory.

CI-0017 refreshed the screenshot baseline after the CI-0016 SaaS UI redesign. The current screenshot set represents CSV and text-based PDF transcript support using fictional CSV data and a privacy-safe synthetic transcript PDF. Real transcript PDFs remain excluded from Git and must not be used in public screenshots.

After the latest UI polish, refresh screenshots before publishing a new public showcase. The current committed screenshots may not exactly match the refined palette, navigation, card radius, table density, and responsive mobile polish.

## Safety Boundaries

CampusInsight screenshots and demo copy must not claim AI, prediction, academic failure prediction, guaranteed improvement, PDF export, authentication, deployment, cloud database, or production readiness.
