# Stock Finder

Hyperlocal inventory and lead-gen marketplace. OTP-authenticated owner dashboards over a geospatial item search backed by PostGIS, with a React + MapLibre buyer experience.

## Repo layout

```
stock-finder/
├── backend/          # Django 5 REST monolith (split into owner / shop / inventory / lead sub-apps)
├── frontend/         # React 19 + TypeScript + Vite SPA
├── deploy/k8s/       # Helm charts
├── docker-compose.yml
├── docker-compose.debug.yml
├── .pre-commit-config.yaml
└── .github/workflows/
```

## Prerequisites

- Docker (with compose v2)
- pnpm 9+ and Node 22+ (for local frontend dev)
- Python 3.12 (only if running pre-commit / tests outside Docker)

## Quickstart (full stack via Docker)

```bash
cp .env.sample .env
# Edit .env to set SF_JWT_SECRET, MSG91 keys, etc.

docker compose up --build
```

Services (default ports):

- `web`        — Django + Uvicorn at http://localhost:8000
- `worker`     — Celery worker
- `beat`       — Celery beat scheduler
- `db`         — PostGIS 17 at localhost:5431
- `redis`      — Redis 7 at localhost:6379
- `seaweedfs`  — S3 API at localhost:8333
- `frontend`   — nginx-served SPA at http://localhost (port 80), proxies `/api/` to `web:8000`

First-time DB setup:

```bash
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
```

## Local frontend dev (hot reload)

Run backend services in Docker, frontend on host:

```bash
docker compose up db redis seaweedfs web worker beat
cd frontend
pnpm install
pnpm dev   # http://localhost:3000 → backend at http://localhost:8000
```

## Common commands

### Backend (run inside the `web` container)

```bash
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
docker compose exec web python manage.py shell
docker compose exec web pip install <pkg>   # then update backend/requirements.txt
docker compose exec web pytest              # if tests are configured
```

### Frontend (`cd frontend`)

```bash
pnpm dev          # Vite dev server (port 3000)
pnpm build        # tsc -b && vite build
pnpm lint         # type-check + eslint --fix + prettier --write
pnpm lint:ci      # type-check + eslint (no fix) — used by CI
pnpm test:e2e     # Playwright
pnpm storybook    # port 6006
```

### Pre-commit (Python hooks)

```bash
pre-commit install
pre-commit run --all-files
```

## Debugging Django

```bash
docker compose -f docker-compose.debug.yml up --build web
# attach VS Code to localhost:5678
```

## Deployment

Helm charts under `deploy/k8s/{backend,frontend,shared}`. Update `values.yaml` per environment (image tag, ingress hostname, secrets) before `helm upgrade --install`.

CI workflows in `.github/workflows/` run lint, type-check, build, migration sanity check, and (on `main`) push images to GHCR.
