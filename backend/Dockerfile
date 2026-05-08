# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# Stage 1: builder — install Python dependencies into a venv so only the
#          venv is copied into the final image, keeping it lean.
# ---------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS builder

ARG DEBIAN_FRONTEND=noninteractive

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        libgdal-dev \
        gdal-bin \
        libpq-dev \
    ; \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create and activate virtualenv so the installed packages are self-contained.
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

COPY requirements.txt ./

RUN --mount=type=cache,target=/root/.cache/pip \
    set -eux; \
    pip install --upgrade pip setuptools wheel; \
    pip install -r requirements.txt; \
    if command -v gdal-config >/dev/null 2>&1; then \
        GDAL_VERSION=$(gdal-config --version); \
        pip install "GDAL==${GDAL_VERSION}" || true; \
    fi

# ---------------------------------------------------------------------------
# Stage 2: runtime — minimal image that runs the application.
# ---------------------------------------------------------------------------
FROM python:3.12-slim-bookworm

ARG DEBIAN_FRONTEND=noninteractive

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/venv/bin:$PATH" \
    DJANGO_SETTINGS_MODULE=stock_finder.settings

# Install only the runtime system libraries (no build tools).
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libgdal32 \
        gdal-bin \
        libpq5 \
    ; \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy venv from the builder stage.
COPY --from=builder /venv /venv

# Copy application source.
COPY . .

# Ensure the entrypoint is executable.
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["uvicorn", "stock_finder.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
