.PHONY: backend-test frontend-test test check format format-check lint frontend-build

backend-test:
	cd backend && ../.venv/bin/python -m pytest

frontend-test:
	cd frontend && npm test

test: backend-test frontend-test

lint:
	cd backend && ../.venv/bin/python -m ruff check .
	cd frontend && npm run lint

format:
	cd backend && ../.venv/bin/python -m ruff check --fix .
	cd backend && ../.venv/bin/python -m ruff format .
	cd frontend && npm run format

format-check:
	cd backend && ../.venv/bin/python -m ruff format --check .
	cd frontend && npm run format:check

frontend-build:
	cd frontend && npm run build

check: test lint format-check frontend-build
