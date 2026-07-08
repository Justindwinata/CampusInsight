# Changelog

All notable changes to CampusInsight will be documented in this file.

## [Unreleased]

### Added

- Add PDF academic transcript processing with text extraction, rule-based metadata/course parsing, normalization into the existing analytics schema, backend analysis endpoint, and frontend upload support.
- Refresh desktop and mobile screenshots plus README preview after the CI-0016 SaaS UI redesign, using fictional CSV data and a privacy-safe synthetic text-based transcript PDF.
- Refresh desktop and mobile demo screenshots, README preview, and showcase documentation after PDF transcript support.
- Refine the frontend into a more polished SaaS-style product experience with stronger landing structure, upload workflow, dashboard hierarchy, saved-analysis workflow, and report action placement.
- Add professional SaaS-style frontend redesign with app navigation, dashboard polish, saved-analysis UX polish, and responsive stabilization.
- Add verified desktop and mobile demo screenshots plus a portfolio-ready README preview.
- Add demo asset policy for fictional data, screenshot capture, privacy precautions, and recommended demo flow.
- Polish the product layout, responsive dashboard behavior, and accessible user-facing states for local demos.
- Add standalone HTML report generation and report action for saved academic analyses.
- Add saved analysis detail dashboard that renders stored canonical analytics JSON without CSV re-upload.
- Add local SQLite saved-analysis persistence, backend history APIs, and frontend saved analyses foundation.
- Add accessible frontend charts for semester performance, grade distribution, and course score overview.
- Add frontend analytics summary cards, tables, and course risk review for validated CSV analysis.
- Add deterministic backend academic analytics contracts, services, and CSV analysis endpoint.
- Add frontend academic records CSV validation UI and API client service.
- Add `POST /academic-records/validate` backend endpoint for multipart CSV validation.
- Add canonical academic record schema and backend CSV validation service.
- Add backend tests and invalid CSV fixtures for schema validation rules.
- Bootstrap FastAPI backend foundation with root and health endpoints.
- Bootstrap React + TypeScript + Vite frontend foundation.
- Add initial backend and frontend tests.
- Add fictional academic records sample dataset.
- Add project roadmap, system architecture, decision log, README, and Makefile.
