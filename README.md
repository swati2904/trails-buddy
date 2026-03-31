# Trails Buddy

Frontend for a U.S. National Parks explorer: search and browse parks, open a park page with a map (including a driving route from your location when coordinates exist), and keep a **passbook** of visits with stamps. It talks to the Trails Buddy backend over a v1 JSON API—auth, parks, discovery/autocomplete, trails, reviews, passbook.

Stack is React (CRA), React Router, Leaflet maps, Bootstrap-ish styling mostly driven from `src/index.css` (CSS variables + shared layout classes). English/Spanish strings live under `src/locales/`.

**Backend:** [trails-buddy-services](https://github.com/swati2904/trails-buddy-services) — run it on port **8080** for local dev unless you point the app elsewhere with env vars.

---

## Running it locally

Need Node 18+ and npm. Clone, install, start:

```bash
git clone https://github.com/swati2904/trails-buddy
cd trails-buddy
npm install
# if peer deps complain:
npm install --legacy-peer-deps
npm start
```

App: `http://localhost:3000`. API: default CRA **proxy** in `package.json` sends API calls to `http://localhost:8080` so you avoid CORS pain while developing.

```bash
npm run build   # production bundle
npm test        # tests
```

Optional `.env` in the repo root:

```env
REACT_APP_API_URL=
REACT_APP_API_ORIGIN=
REACT_APP_API_BASE_PATH=
REACT_APP_API_VERSION=v1
```

Either set a full `REACT_APP_API_URL`, or compose origin + path + version. See `src/api/v1/http.js` for how the base URL is built.

---

## What you’ll see in the UI

- **Explore** (`/explore`, also `/search` and `/nearby` for different entry intents): list / map / split, radius and filters—state is mostly in the URL so links are shareable. Default layout/radius can be saved under **Settings** (stored in `localStorage` as `tb.ui.settings`).
- **Park** (`/parks/:slug`): detail + recommendations; map may show a **driving route** from you to the park. Routing uses the public **OSRM** demo (`router.project-osrm.org`)—fine for a demo, not a SLA; if it fails, you still get the map without the line.
- **Passbook** (`/passbook`) vs **Profile** (`/profile`): passbook is stamps/visits; profile is account-ish stuff and shortcuts (sign out, etc.).
- Auth is JWT in `localStorage` (`tb.auth.session`), refresh handled in the HTTP layer when the API says you’re expired.

---

## Routes

Defined in `src/components/App.js`. Quick reference:

`/`, `/explore`, `/search`, `/nearby` · `/parks` · `/parks/:slug` · `/passbook` · `/profile` · `/settings` · `/signin` · `/signup` · `/pricing` · `/about` · `/help` · `/press` · `/404` · anything else → redirect to `/404`.

---

## Code layout (rough)

```
src/
  api/v1/          requestJson + feature modules (auth, parks, discovery, trails, user, …)
  components/      Shell (nav/layout), Map (Leaflet), ui/ primitives
  pages/           route screens
  state/           AuthContext, discovery URL state, etc.
  locales/         i18n JSON
  index.css        global theme + page patterns
```

If you change routes or API shapes, update this file and the `api/v1` modules together so nobody has to guess.

---

## Docker

There’s a multi-stage `Dockerfile` (Node build → Nginx). Example:

```bash
docker build -t trails-buddy-frontend:local .
docker run --rm -p 3000:80 --name trails-buddy-frontend trails-buddy-frontend:local
```

Proxy rules for `/v1`, `/api`, and `/actuator` are in `nginx/default.conf` (the image bakes that in). The checked-in config targets **`host.docker.internal:8081`** so your API can run on the host while the container serves static files on port 80—adjust the file if your setup differs (e.g. another hostname in Docker Compose).

**Smoke / host API on 8081:**

```bash
docker build -t trails-buddy:smoke -f Dockerfile .
docker run --rm -it -p 8080:80 trails-buddy:smoke
```

Then hit something like `http://localhost:8080/v1/parks?page=1&pageSize=6` if your backend is wired the way the image expects (`host.docker.internal:8081` in that flow).

---

## CI and optional GCP push

`.github/workflows/frontend-ci-cd.yml` — on push/PR: install, build, test if present, build Docker image (no push by default). Manual `workflow_dispatch` can push to Artifact Registry when you flip the flag; secrets are the usual GCP OIDC trio (`GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`, `GCP_PROJECT_ID`). Region/repo defaults are in the workflow.

Pushing an image by hand is optional; only do it when you actually want a registry tag.

---

## Vercel

Import the GitHub repo, preset **Create React App**, deploy. Set `REACT_APP_API_URL` to your public API if the backend isn’t same-origin.

---

## i18n

`src/i18n.js` — fallback `en`, also `es`, browser detection on. Files: `src/locales/en/translation.json`, `src/locales/es/translation.json`.
