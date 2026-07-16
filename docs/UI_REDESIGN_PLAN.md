# CampusInsight UI Redesign Plan

## Product Audit

CampusInsight is a local full-stack academic analytics workspace for portfolio demos. It accepts academic record CSV files and supported text-based transcript PDFs, validates or extracts records through FastAPI, calculates deterministic academic metrics, saves canonical analysis JSON in local SQLite, and opens saved HTML reports.

The primary user is a reviewer, recruiter, instructor, or student demoing an academic analytics workflow. The main workflow is:

1. Open the product overview.
2. Upload a CSV or supported transcript PDF.
3. Review validation, extraction, and analytics status.
4. Inspect summary metrics, charts, detailed tables, and course risk signals.
5. Load saved analyses.
6. Open saved detail dashboards and standalone HTML reports.

## Current Strengths

- The backend/frontend boundaries are clear and documented.
- CSV and PDF inputs use the same analytics schema after validation or normalization.
- Uploaded files are not stored.
- Saved detail and report flows use stored canonical JSON instead of frontend recalculation.
- The frontend already has a multi-view shell, custom SVG charts, accessible tables, empty states, and responsive intent.

## UI Weaknesses To Address

- The global palette leans warm and ornamental, which can make a data product feel less precise.
- The shell uses a top navigation only; the page hierarchy can feel more like a landing page than an operational workspace.
- Several surfaces use large decorative gradients, orbit elements, floating chips, and oversized rounded panels that risk an AI-generated look.
- Upload, dashboard, saved history, and report sections need stronger product-specific hierarchy and more disciplined density.
- Loading and error states exist but can feel visually detached from the rest of the system.
- Tables are readable but need more professional density, sticky-ish visual framing, safer mobile scroll, and clearer status labels.
- Mobile navigation and compact-page rhythm can be tightened for 320px to 390px widths.
- Demo-readiness docs exist but should explicitly describe the redesign, limitations, and local validation commands.

## Reference Research

These references were used only for layout, hierarchy, density, and interaction inspiration. No third-party branding, assets, copy, logos, or exact UI compositions should be copied.

- [Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/) - reinforces dashboards as curated at-a-glance lenses over complex data, with patterns that balance overview, detail, and task flow.
- [Tableau](https://www.tableau.com/products/tableau) - useful for analytics hierarchy: trusted data foundation, KPI monitoring, and insight-to-action framing.
- [Amplitude](https://amplitude.com/) - useful for product analytics storytelling: clear navigation categories, insight/action/data grouping, and concise value hierarchy.
- [Retool](https://retool.com/) - useful for internal tool density: app grids, admin-style workflows, import/build flows, and practical enterprise surfaces.
- [Hex](https://hex.tech/) - useful for data workspace presentation: notebook/app-builder/data-source patterns, published report framing, and chart/table composition.
- [Linear Customers](https://linear.app/customers) - useful for refined SaaS polish: restrained navigation, compact metric storytelling, segmented content, and high-trust spacing.

## Adapted Design Direction

- Shift CampusInsight toward a quieter academic analytics product identity: clean ivory/white surfaces, ink text, teal status, blue analytics, amber caution, and red danger.
- Keep the product-specific first impression but reduce decorative excess in favor of a credible dashboard preview and workflow context.
- Treat Analyze, Dashboard, Saved Analyses, and Report as real workspace views with consistent page headers, command strips, status panels, and responsive grids.
- Use cards for repeated items and framed tools only; keep section layout unframed and dense enough for repeated demo use.
- Improve status badges for local demo state, input type, validation, risk level, selected analysis, and report availability.
- Make tables scroll inside their own containers on small screens and preserve readable minimum widths.
- Preserve all existing APIs, saved-analysis behavior, report URLs, and deterministic analytics semantics.

## Implementation Plan

1. Create this audit and direction document.
2. Refine global design tokens, typography, reset, focus states, and component-level utility classes.
3. Polish the app shell and mobile navigation without changing route/view state behavior.
4. Redesign the upload and current-analysis workflow around clear intake, validation, loading, error, and success states.
5. Polish dashboard cards, chart panels, tables, risk review, saved-history detail, and report callouts.
6. Add responsive/accessibility refinements for 1280px, 1024px, 768px, 390px, and 320px.
7. Update README, changelog, and demo documentation for local deploy-readiness and honest limitations.

## Validation Plan

- `git diff --check`
- `npm run test`
- `npm run lint`
- `npm run build`
- `pytest`

Backend validation should be run if frontend changes touch API assumptions or if final full-project validation is required. The redesign should not require deployment and must not claim deployment.
