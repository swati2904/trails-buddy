# Trails Buddy

Trails Buddy is a React single-page application for exploring U.S. National Parks, discovering nearby parks, and maintaining a personal digital passbook of park visits.

The frontend uses a v1 API contract (auth, parks, nearby discovery, autocomplete, trails, reviews, and user passbook endpoints) and includes map-based discovery with Leaflet.

## What Is Implemented

- National parks search across name, state, city, ZIP, and nearby location.
- Search autocomplete with keyboard-accessible suggestion lists.
- Split/list/map exploration views with query-string driven state.
- Park detail pages with nearby recommendations.
- Digital passbook flow: mark parks visited, save notes, display stamp codes.
- Auth flows: sign up, sign in, token refresh, and sign out.
- Trail detail pages with route map preview, reviews, and favorites.
- i18n setup with English and Spanish resources.

## Route Map

The current route configuration is defined in `src/components/App.js`.

| Route | Page |
| --- | --- |
| `/` | Home page |
| `/explore` | Explore page |
| `/search` | Explore page (search intent) |
| `/nearby` | Explore page (nearby intent) |
| `/parks` | Parks listing |
| `/parks/:slug` | Park details |
| `/passbook` | Profile/passbook page |
| `/signin` | Sign in |
| `/signup` | Sign up |
| `/pricing` | Pricing |
| `/about` | About |
| `/help` | Help |
| `/press` | Press |
| `/profile` | Profile |
| `/settings` | Settings |
| `/404` | Not found |

## Tech Stack

- React 19
- React Router DOM 7
- React Scripts 5 (CRA build system)
- Leaflet + React Leaflet
- Bootstrap + Bootstrap Icons
- i18next + react-i18next
- React Spectrum packages
- React Testing Library + Jest DOM

See exact package versions in `package.json`.

## API Integration

HTTP requests are centralized in `src/api/v1/http.js` through `requestJson`.

### Base URL Resolution

The API base URL is resolved in this order:

1. `REACT_APP_API_URL` (full URL override)
2. `REACT_APP_API_ORIGIN` + `REACT_APP_API_BASE_PATH` + `REACT_APP_API_VERSION`
3. Relative fallback (`/<basePath>/<version>`), which works with CRA proxy in local dev

Default version fallback is `v1`.

### Local Proxy

Local development uses the CRA proxy in `package.json`:

- `proxy: http://localhost:8080`

So frontend requests can resolve to backend API endpoints without CORS setup during local development.

### API Modules

- `src/api/v1/auth.js` - sign in/up/out, refresh
- `src/api/v1/parks.js` - park search, nearby parks, park by slug
- `src/api/v1/discovery.js` - nearby search endpoint and autocomplete
- `src/api/v1/trails.js` - trail search/details/reviews
- `src/api/v1/user.js` - visited parks, passbook stamps, favorites helpers
- `src/api/v1/contracts.js` - response and pagination normalization
- `src/api/v1/errorMessages.js` - API error mapping and forced sign-out rules

## Authentication and Session Handling

- Session is stored in localStorage key: `tb.auth.session`.
- `AuthProvider` in `src/state/AuthContext.js` exposes `user`, `tokens`, and auth actions.
- On `401` or auth-expired codes, the HTTP layer can trigger refresh token flow.
- Session update/invalid events are dispatched and consumed in auth context to keep UI state synced.

## Internationalization

i18n is initialized in `src/i18n.js` with:

- Fallback language: English (`en`)
- Supported resources: English and Spanish
- Browser language detection enabled

Translation files:

- `src/locales/en/translation.json`
- `src/locales/es/translation.json`

## Installation and Run

### Prerequisites

- Node.js 18+
- npm 9+
- Running backend API on `http://localhost:8080` (or set environment overrides)

### Setup

```bash
git clone https://github.com/swati2904/trails-buddy
cd trails-buddy
npm install
```

If your environment has peer dependency conflicts with test libraries, install with:

```bash
npm install --legacy-peer-deps
```

### Start Development Server

```bash
npm start
```

App runs at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Environment Variables

Create a `.env` file in the project root when you need custom API routing:

```env
REACT_APP_API_URL=
REACT_APP_API_ORIGIN=
REACT_APP_API_BASE_PATH=
REACT_APP_API_VERSION=v1
```

Typical use:

- Set only `REACT_APP_API_URL` for a single explicit API base.
- Or set `REACT_APP_API_ORIGIN`, `REACT_APP_API_BASE_PATH`, and `REACT_APP_API_VERSION` for composed URLs.

## Project Structure

```text
src/
  api/v1/               # API clients, transport, contracts, normalization
  components/
    Map/                # Explore and route maps (React Leaflet)
    Shell/              # Global app shell and navigation layout
    ui/                 # Reusable UI primitives
  data/                 # Static app datasets
  locales/              # i18n translation resources
  pages/                # Route-level pages
  state/                # Auth context and URL-driven discovery state hooks
  i18n.js               # i18next configuration
  index.js              # App entrypoint
  index.css             # Global styles
```

## Backend Service

This frontend expects the Trails Buddy services backend.

- Services repository: https://github.com/swati2904/trails-buddy-services

## Notes for Contributors

- Keep route docs in this README in sync with `src/components/App.js`.
- Keep API docs in this README aligned with `src/api/v1/*` modules.
- Prefer updating normalization contracts before adding page-level response parsing.

## DevOps Architecture (Zero-Cost First)

- Frontend runtime: Docker container with Nginx serving static React build.
- Frontend-to-backend integration in container mode: Nginx reverse proxy to backend service `http://backend:8080`.
- Backend routes proxied by frontend container:
  - `/v1 -> http://backend:8080/v1`
  - `/api -> http://backend:8080/api`
  - `/actuator -> http://backend:8080/actuator`
- Local developer mode remains unchanged and free:
  - Run backend locally at `http://localhost:8080`
  - Run frontend via CRA dev server at `http://localhost:3000`
- Optional cloud usage is manual opt-in only:
  - Store built image in GCP Artifact Registry (no always-on compute)

## Local Run (Non-Container Developer Path)

1. Install dependencies:

  ```bash
  npm install
  ```

2. Start frontend dev server:

  ```bash
  npm start
  ```

3. Ensure backend is running at `http://localhost:8080`.

4. Optional: customize backend URL with environment variables in `.env`:

  ```env
  REACT_APP_API_URL=
  REACT_APP_API_ORIGIN=
  REACT_APP_API_BASE_PATH=
  REACT_APP_API_VERSION=v1
  ```

## Docker Build and Run

This repo includes a production multi-stage Dockerfile:

- Build stage: Node 20
- Runtime stage: Nginx Alpine
- Supports build output folder detection for both `dist` and `build`

Build image:

```bash
docker build -t trails-buddy-frontend:local .
```

Run container (attached to the same Docker network as backend container named/service `backend`):

```bash
docker run --rm -p 3000:80 --name trails-buddy-frontend trails-buddy-frontend:local
```

In container mode, API calls are reverse-proxied by Nginx and do not require frontend environment variable overrides.

## GitHub Actions CI/CD Flow

Workflow file: `.github/workflows/frontend-ci-cd.yml`

### On push and pull_request

- Install dependencies
- Build frontend
- Run tests if test script is present
- Build Docker image only (no push)

### On manual workflow_dispatch

- Same CI build/test/image-build steps
- Optional image push to GCP Artifact Registry only when `enable_gcp_push=true`
- Uses OIDC authentication only (no static key JSON files)

Required GitHub Secrets:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`
- `GCP_PROJECT_ID`

Optional GitHub Variables:

- `GCP_REGION` (default: `us-central1`)
- `GAR_REPOSITORY` (default: `trailservices`)

## Manual Image Push to Artifact Registry (Optional)

This is optional and should only be done when you intentionally want to store images remotely.

1. Authenticate with gcloud locally:

  ```bash
  gcloud auth login
  gcloud config set project YOUR_PROJECT_ID
  ```

2. Configure Docker auth for GAR:

  ```bash
  gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
  ```

3. Build and tag image:

  ```bash
  docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/trailservices/frontend:latest .
  docker tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/trailservices/frontend:latest us-central1-docker.pkg.dev/YOUR_PROJECT_ID/trailservices/frontend:sha-$(git rev-parse --short HEAD)
  ```

4. Push tags:

  ```bash
  docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/trailservices/frontend:latest
  docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/trailservices/frontend:sha-$(git rev-parse --short HEAD)
  ```

## Docker Smoke Test (Frontend)

To verify the frontend build and API contract in a containerized environment:

1. Ensure your backend API is running on your host at http://localhost:8081
2. Build and run the frontend smoke container:

```bash
docker build -t trails-buddy:smoke -f Dockerfile .
docker run --rm -it -p 8080:80 trails-buddy:smoke
```

- The app will be available at http://localhost:8080
- The container is preconfigured to proxy API requests to http://host.docker.internal:8081
- Parks endpoint is validated with: http://localhost:8080/v1/parks?page=1&pageSize=6

To stop the container:

```bash
docker ps # find the container ID if running detached
docker stop <container_id>
```

This flow ensures your frontend is always aligned with backend contract in local Docker.


