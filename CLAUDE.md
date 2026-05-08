# CLAUDE.md

Guidance for Claude Code working in this repository.

## Repo layout

Monorepo with three top-level concerns:

- `backend/`  — Django 5 REST API split into domain sub-apps under `backend/apps/`.
- `frontend/` — React 19 + TypeScript + Vite SPA.
- `deploy/k8s/` — Helm charts for backend, frontend, and shared resources.

Each subproject may have its own `CLAUDE.md` / `AGENTS.md`. Read them when working inside.

## Architecture

### Backend (`backend/`)

Domain-split Django monolith. Sub-apps under `backend/apps/`:

- `owner_manager`     — OTP auth (MSG91), JWT issuance, owner profile/onboarding.
- `shop_manager`      — Shop model (PostGIS Point), nearby-shop search with Redis cache.
- `inventory_manager` — Category, InventoryItem, ItemImage; geospatial + trigram + FTS search; Celery image variants.
- `lead_manager`      — Buyer-to-owner leads, search analytics, abuse reports.

Django project package: `backend/stock_finder/` (settings, urls, asgi, wsgi, celery).

Shared building blocks under `backend/shared/`:

- `shared/models/base_models.py` — `BaseModel`, `BaseModelWithoutUser` (UUID PK + timestamps). All app models inherit.
- `shared/infrastructure/`       — `InfraManager` singleton + S3 adapter for SeaweedFS.
- `shared/utils/redis.py`        — `get_notifications_channel(user_id)` for SSE pub/sub.
- `shared/auth/jwt_authentication.py` — `JWTBearerAuthentication` DRF auth class. Imported by every app's protected views.

**Cross-app dependency rule (load-bearing):** sub-apps must NOT import each other's Python directly. They reference each other via string FKs only (e.g. `"shop_manager.Shop"`). Cross-app behaviour is mediated by Django signals + Redis pub/sub.

URL mounting (in `stock_finder/urls.py`):

```
/api/auth/        → owner_manager
/api/shops/       → shop_manager
/api/categories/  → inventory_manager.urls.categories
/api/items/       → inventory_manager.urls.items
/api/search/      → inventory_manager.urls.search
/api/leads/       → lead_manager.urls.leads
/api/reports/     → lead_manager.urls.reports
/api/ping/        → health
/admin/
```

Celery: `inventory_manager.tasks.sweep_stale_items` runs hourly via beat. Image variants generated async on upload.

Real-time: model save signals publish to Redis channels via `get_notifications_channel`; frontend consumes through SSE.

### Frontend (`frontend/`)

- React 19, React Router 7, Chakra UI 3, TanStack Query, Axios, Zod, react-hook-form, MapLibre GL.
- Path aliases: `api/*`, `app/*`, `design-system/*`, `shared/*`. Features use relative imports.
- API hooks live in `src/api/<domain>/`, NOT inside feature folders. Centralized query keys in `src/api/query-keys.ts`.
- Axios client in `src/api/api.ts` auto-converts request bodies to snake_case and responses to camelCase.
- Auth: OTP -> JWT. Token in localStorage, attached as `Authorization: Bearer <token>`.
- Routes mounted at `/` (this is a single-product repo, not a sub-feature).

State management:

- TanStack Query for all server state.
- Local component state for UI. No MobX in this repo (it was atlas-only for the GIS subsystem).

## Commands

### Backend — always via Docker

```bash
docker compose up --build
docker compose exec web python manage.py migrate
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py shell
docker compose exec web pip install <pkg>   # then update backend/requirements.txt
```

Never run Django commands against host Python — the venv inside the container is the source of truth.

### Frontend — pnpm only (never npm or yarn)

```bash
cd frontend
pnpm dev            # port 3000
pnpm build          # tsc -b && vite build
pnpm lint           # type-check + eslint --fix + prettier --write
pnpm lint:ci        # type-check + eslint (CI variant)
pnpm test:e2e       # Playwright
pnpm storybook      # port 6006
```

Unit/component tests run through Storybook (`@storybook/addon-vitest`), not a standalone script.

## Code style

- Comments start with a capital letter and end with a period.
- Backend: blank line before each `if` / `for`. No unnecessary comments.
- Frontend: Chakra UI for all styling — no raw CSS, no styled-components. One component per file.
- Feature-based folder structure on the frontend; no cross-feature imports.
- API response envelope: `{ "meta": { "status_code", "success", "message" }, "data": ... }`.

## Environment variables

Loaded from `.env` at repo root (gitignored; sample in `.env.sample`). Key vars:

- `SF_JWT_SECRET`, `SF_JWT_TTL_SECONDS` — JWT signing.
- `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID` — OTP delivery (blank in dev prints OTP to logs).
- `DB_*`, `REDIS_*`, `S3_*` — infra.
- `VITE_API_BASE_URL` — frontend build-time API base.

## Don'ts

- Don't import one sub-app's Python from another sub-app. Use string FKs and signals.
- Don't run host-Python `manage.py` — use `docker compose exec web`.
- Don't add npm/yarn lockfiles; pnpm is the package manager.
- Don't introduce raw CSS; use Chakra props / theme tokens.
