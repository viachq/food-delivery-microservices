.PHONY: help install test test-cov test-unit test-integration lint clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make install         - Install dependencies"
	@echo "  make test            - Run all tests"
	@echo "  make test-cov        - Run tests with coverage report"
	@echo "  make test-unit       - Run only unit tests"
	@echo "  make test-integration - Run only integration tests"
	@echo "  make test-html       - Generate HTML coverage report"
	@echo "  make lint            - Run code linting"
	@echo "  make clean           - Remove test artifacts"
	@echo "  make run             - Run the auth service"

install:
	pip install -r requirements.txt

test:
	PYTHONPATH=. pytest tests/ -v

test-cov:
	PYTHONPATH=. pytest tests/ -v --cov=backend --cov-report=term-missing

test-html:
	PYTHONPATH=. pytest tests/ -v --cov=backend --cov-report=html
	@echo "Open htmlcov/index.html to view the coverage report"

test-unit:
	PYTHONPATH=. pytest tests/test_security.py tests/test_models.py -v

test-integration:
	PYTHONPATH=. pytest tests/test_auth_endpoints.py tests/test_user_endpoints.py tests/test_admin_endpoints.py tests/test_app.py -v

test-fast:
	PYTHONPATH=. pytest tests/ -v -x  # Stop on first failure

lint:
	flake8 backend --count --select=E9,F63,F7,F82 --show-source --statistics
	flake8 backend --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

clean:
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -f .coverage
	rm -f coverage.xml
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

run:
	PYTHONPATH=. uvicorn backend.main:app --reload --port 8001
