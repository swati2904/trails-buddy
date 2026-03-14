# Trails Buddy Product Rebuild Plan

## Goal
Replace the existing Trails Buddy frontend with a new trail discovery product that delivers an AllTrails-style experience using original implementation, branding, and assets.

## Scope
- Full replacement of current user-facing routes and feature modules.
- New design system, navigation model, and page architecture.
- New frontend data layer aligned to a dedicated backend repository.
- Removal of legacy map/context flows from active runtime paths.

## Phase 1 - Foundation And Cutover (Completed In This Repo)
- Replaced app routing with a full platform route scaffold:
  - `/`
  - `/explore`
  - `/trail/:slug`
  - `/parks/:slug`
  - `/search`
  - `/nearby`
  - `/signin`
  - `/signup`
  - `/pricing`
  - `/about`
  - `/help`
  - `/press`
  - `/my-favorites`
  - `/my-lists`
  - `/profile`
  - `/settings`
  - `/404`
- Added shell layout with primary and account navigation.
- Replaced global styles with design tokens and responsive layout rules.
- Removed legacy runtime bootstrapping dependencies from app entrypoint (old map/toast/onboarding bootstrap wiring).

## Phase 2 - Page Implementation
- Build production components for:
  - Home discovery feed
  - Explore map/list workspace
  - Trail detail page
  - Park detail page
  - Search and nearby feeds
- Introduce reusable UI primitives:
  - Button, chip, tab, card, filter group, badge, skeleton, empty state, modal, drawer.

### Current Status (March 14, 2026)
- Home, Explore, Trail Detail, and Park pages are now implemented as real route modules under `src/pages`.
- Shared UI primitives are in `src/components/ui` and used by page modules.
- Legacy frontend modules were removed (`src/components/Auth`, `src/components/Map`, `src/components/Trail`, old `src/api/*`, and `src/contexts/*`).

## Phase 3 - Domain Data Layer
- Introduce frontend domain modules:
  - `auth`
  - `search`
  - `trail`
  - `reviews`
  - `favorites`
  - `lists`
- Normalize API responses at a single transport layer.
- Add in-memory cache + stale-while-revalidate strategy for search and trail detail.

## Phase 4 - Account And Social Features
- Favorites management.
- Saved lists CRUD.
- Review and conditions submission flow.
- Profile and settings screens.

## Phase 5 - Quality And Release
- Unit tests: API client, formatters, reducers/state transitions.
- Integration tests: route-level loading and submit flows.
- E2E smoke tests: signin, search, favorite, review submit.
- Performance pass for map render and list virtualization.
- Staging validation and production cutover.

## Frontend Deliverables
- New route-driven shell and component architecture.
- New style token system.
- Route modules connected to backend contract.
- Test suite updates with CI-ready commands.

## Backend Coordination
- Use `docs/API_CONTRACT.md` as the implementation source for endpoint shape and payloads.
- Version API as `/v1` and maintain backward-compatible response envelopes once frontend integration starts.
