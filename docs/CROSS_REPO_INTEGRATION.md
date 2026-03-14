# Cross-Repo Integration Playbook

## 1) Contract Sync Ritual (Frontend + Backend)

Use this checklist for every backend DTO/API change.

- Update OpenAPI spec in backend repo in same sprint.
- Regenerate or update frontend API adapter/normalizer in this repo (`src/api/*`, `src/api/normalizers.js`).
- Add/adjust adapter contract tests (`src/api/*.test.js`).
- Run compatibility check in PR:
  - Backend contract diff reviewed.
  - Frontend adapter tests pass.
- PR cannot merge unless both backend and frontend owners approve.

Recommended PR template gate:

- [ ] OpenAPI updated (or no contract changes)
- [ ] Frontend adapter updated for changed contract
- [ ] Contract tests added/updated
- [ ] Smoke pipeline passed

## 2) Versioned API + Environment Strategy

This frontend supports versioned API routing without code edits.

Preferred environment variables:

- `REACT_APP_API_ORIGIN` (example: `http://localhost:8080`)
- `REACT_APP_API_BASE_PATH` (example: `/api`)
- `REACT_APP_API_VERSION` (example: `v1`)

Effective base URL becomes:

- `${REACT_APP_API_ORIGIN}${REACT_APP_API_BASE_PATH}/${REACT_APP_API_VERSION}`

Backward compatibility:

- `REACT_APP_API_URL` still works as an exact override for legacy environments.

Environment examples:

- Dev: `http://localhost:8080/api/v1`
- Stage: `https://trails-stage.example.com/api/v1`
- Prod: `https://trails.example.com/api/v1`

## 3) CI Smoke Pipeline (Frontend + Backend + Postgres)

Goal: block merges when core user journey fails.

Minimum smoke flow:

- Start Postgres service.
- Start backend service pointing to Postgres.
- Start frontend pointing to backend base URL.
- Execute smoke tests for:
  - map loads trails
  - trail detail route opens
  - login + submit review works

Suggested CI stages:

1. `contract-check`
- Validate OpenAPI change and compatibility checklist.

2. `integration-smoke`
- Provision Postgres container.
- Boot backend and run migrations.
- Boot frontend with stage-like env vars.
- Run smoke tests.

3. `merge-gate`
- Require both stages green.

Example shell sequence (runner-agnostic):

```bash
# backend
./gradlew test
./gradlew bootRun &

# frontend
npm ci --legacy-peer-deps
npm run build
npm test -- --watchAll=false
# add browser smoke command here (Playwright/Cypress) once present
```

## 4) Ownership Model

- Backend owner: OpenAPI + DTO source-of-truth.
- Frontend owner: adapter + normalizers + UI compatibility.
- Shared responsibility: smoke pipeline green before merge.
