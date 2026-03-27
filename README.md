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


