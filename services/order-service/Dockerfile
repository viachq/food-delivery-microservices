#syntax=docker/dockerfile:1

# === Build stage: Install dependencies ===
FROM python:3.13-slim AS builder

ENV LANG=C.UTF-8
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy requirements first for better caching
COPY requirements.txt .

# Create virtual environment and install dependencies using uv
# services/auth-service/Dockerfile
RUN uv venv /app/venv --seed && \
    /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# === Final stage: Runtime image ===
FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/app/venv/bin:$PATH"

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/venv /app/venv

# Copy application code
COPY backend ./backend

# Create directory for database
RUN mkdir -p /app/data

# Set PYTHONPATH to include the service directory
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8003

# Run uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8003"]
