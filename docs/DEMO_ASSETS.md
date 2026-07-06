# Demo Assets

CampusInsight demo assets must be captured from the real local application using fictional data only.

## Demo Dataset

Use `data/sample/academic_records_sample.csv` for screenshots and portfolio walkthroughs.

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

## Screenshot Capture Policy

Screenshots must be captured from the actual running CampusInsight app. Do not use mockups, edited fake dashboards, terminal screenshots, browser developer tools, or fabricated analytics values.

Before capturing screenshots:

- Start the FastAPI backend locally.
- Start the Vite frontend locally.
- Analyze `data/sample/academic_records_sample.csv`.
- Confirm the dashboard renders real analytics returned by the backend.
- Confirm saved analysis detail and HTML report views use stored canonical analysis JSON.

Screenshots must avoid:

- real student data
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
4. Review validation status and summary cards.
5. Review charts and tables.
6. Load saved analyses.
7. Open a saved analysis detail dashboard.
8. Open the standalone HTML report.

## Recommended Viewports

- Desktop screenshots: around `1280px` wide.
- Mobile screenshots: around `390px` wide.
- Narrow validation: around `320px` wide.

## Current Screenshot Inventory

No screenshots are committed yet. CI-0012 will add verified desktop and mobile screenshots after this policy is in place.

## Safety Boundaries

CampusInsight screenshots and demo copy must not claim AI, prediction, academic failure prediction, guaranteed improvement, PDF export, authentication, deployment, cloud database, or production readiness.
