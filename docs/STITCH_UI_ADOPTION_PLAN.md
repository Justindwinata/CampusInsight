# Stitch UI Adoption Plan

## Stitch Package

- Package name: `stitch_campusinsight_analytics_platform.zip`
- Repository location inspected: `/Users/justindwinata/Documents/CampusInsight/stitch_campusinsight_analytics_platform.zip`
- Temporary extraction path: `/private/tmp/campusinsight_stitch_inspect/stitch_campusinsight_analytics_platform`
- Decision: use the ZIP as a visual and UX reference only. Do not commit the ZIP contents or generated screenshots.

## Files and Screens Found

The Stitch package contains seven screen folders. Each folder includes a `code.html` mock and a `screen.png` preview:

- `campusinsight_home`
- `analyze_campusinsight`
- `analytics_dashboard_campusinsight`
- `analysis_detail_campusinsight`
- `saved_analyses_campusinsight`
- `reports_hub_campusinsight`
- `ux_states_campusinsight`

## Suitability Analysis

The design is suitable as a high-level direction for CampusInsight because it targets an academic analytics platform, uses a calm blue academic palette, emphasizes dashboard cards and tables, and includes screens that map closely to the current app views. Its strongest fit is the platform structure: Home, Analyze, Dashboard, Saved Analyses, Reports, and system states.

The package is not suitable for direct code adoption. The mockups are static HTML/Tailwind-style screens with placeholder charts and sample student data. Some copy and actions conflict with current CampusInsight scope, so implementation must adapt the visual language while preserving existing React state, API calls, deterministic analytics, CSV support, text-based PDF support, saved analyses, and HTML reports.

## UI Concepts Suitable for CampusInsight

- Academic blue/indigo primary palette with white and pale-blue surfaces.
- Clean top navigation plus dashboard-style active states.
- Large page titles with compact supporting metadata.
- Rounded dashboard cards with subtle borders and light shadows.
- KPI cards for GPA, credits, scores, and course summaries.
- Chart cards grouped into clear dashboard sections.
- Scroll-safe table containers with uppercase headers and subtle row hover.
- Report action panel placed beside or near dashboard context.
- Saved analyses list with file type badges, score/GPA metadata, and actions.
- Detail pages with metadata header, analytics summary, report access, and data table sections.
- System states for processing, upload errors, empty data, and safe not-found behavior.

## UI Concepts Rejected or Adjusted

- External profile/avatar images are rejected; the portfolio app does not need user accounts.
- Notification/user account controls are rejected because authentication is not implemented.
- `Download PDF` actions are rejected; CampusInsight only supports standalone HTML reports.
- `Major Rank`, cohort rank, and institution-wide comparisons are rejected because the backend does not calculate them.
- Placeholder chart boxes are rejected; CampusInsight must render real SVG charts from processed analytics data or clear empty states.
- Copy implying prediction, intervention forecasting, or guaranteed outcomes must be avoided.
- Any mock data shown in Stitch screenshots must not appear as real analytics in the app.
- Dark mode config from the static mock is not adopted in this contract unless the current app already supports it.

## Mapping to CampusInsight

| Stitch screen | CampusInsight target | Adoption notes |
| --- | --- | --- |
| `campusinsight_home` | Home view | Adopt academic SaaS hero, workflow summary, supported format badges, and footer structure. Replace broad claims with deterministic analytics copy. |
| `analyze_campusinsight` | Analyze view | Adopt upload workflow cards, input guidance, state surfaces, and CSV/PDF limitation copy. Preserve existing multipart upload behavior. |
| `analytics_dashboard_campusinsight` | Dashboard view and analytics components | Adopt KPI/card hierarchy, chart grouping, course table polish, and report action placement. Use existing real chart components. |
| `analysis_detail_campusinsight` | Saved analysis detail | Adopt metadata header, saved report panel, summary cards, and detail table layout. Continue using stored canonical JSON. |
| `saved_analyses_campusinsight` | Saved Analyses view | Adopt saved analysis cards/list styling, source badges, metadata, and action grouping. Preserve delete/open-detail behavior. |
| `reports_hub_campusinsight` | Report view and saved detail report action | Adopt report repository framing only for HTML reports. Remove PDF/password/email concepts. |
| `ux_states_campusinsight` | Empty/loading/error states | Adopt clearer loading, invalid upload, insufficient data, and not-found state presentation. |

## Implementation Plan

1. Extract a Stitch-inspired design system into the existing CSS tokens: academic blue, pale surface containers, border/shadow scale, buttons, cards, badges, tables, focus states, and responsive containers.
2. Redesign the app shell and navigation using the current single-page React view model, with clear Home, Analyze, Dashboard, Saved Analyses, and Report areas.
3. Redesign Home with a stronger academic SaaS hero, dashboard preview, workflow steps, supported inputs, features, limitations, and footer.
4. Redesign Analyze around a clear upload-to-dashboard sequence while preserving existing upload and analysis service calls.
5. Redesign Dashboard cards, chart containers, tables, risk review, and report/save context without changing analytics formulas.
6. Redesign Saved Analyses and saved detail to better reflect stored canonical JSON, local history, and HTML report access.
7. Polish report panels and HTML report CTAs, keeping PDF export out of scope.
8. Run responsive and accessibility QA at 1280, 1024, 768, 390, and 320 px.
9. Update documentation after implementation and run full validation.

## Risks

- The Stitch package contains static placeholder charts; copying them would regress real chart behavior.
- Some mock actions imply unsupported features such as PDF export, profile/account controls, email advisor, and ranking.
- The current app uses one React component for several views, so visual polish must be incremental to avoid breaking tests.
- Mobile navigation needs careful handling because the Stitch desktop sidebar pattern could consume too much width.
- The ZIP is untracked and intentionally ignored to avoid committing large reference artifacts.

## Limitations

- CampusInsight remains a local-first portfolio app.
- CSV academic records and text-based PDF transcripts are supported.
- OCR is not implemented.
- No authentication, cloud database, deployment, AI/LLM prediction, guaranteed academic outcome prediction, or PDF export is implemented.
- Saved analyses use local persistence unless project documentation states otherwise.

## Assets Usage Decision

The static Stitch screenshots are useful for visual inspection only. They should not be committed or used as runtime assets. Existing project-owned assets, including `assets/thumbnail.png`, remain the preferred hero/product visual source.
