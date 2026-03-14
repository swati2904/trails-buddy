# API Contract For Rebuild (v1)

## Base
- Base URL: `/v1`
- Content type: `application/json`
- Auth: Bearer JWT access token in `Authorization` header.

## Response Envelope
Success:
```json
{
  "ok": true,
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

Error:
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Readable message",
    "details": []
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

## Authentication
### `POST /auth/signup`
Request:
```json
{
  "email": "user@example.com",
  "password": "string",
  "displayName": "string"
}
```
Response `201`:
```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "displayName": "Ava"
  },
  "tokens": {
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

### `POST /auth/signin`
Request:
```json
{
  "email": "user@example.com",
  "password": "string"
}
```
Response `200`: same schema as signup.

### `POST /auth/refresh`
Request:
```json
{
  "refreshToken": "jwt"
}
```
Response `200`:
```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt"
}
```

## Discovery And Search
### `GET /search/trails`
Query params:
- `q` string
- `bbox` string as `minLon,minLat,maxLon,maxLat`
- `difficulty` repeated value (`easy`, `moderate`, `hard`)
- `activity` repeated value (`hiking`, `running`, `bike`)
- `lengthMinKm` number
- `lengthMaxKm` number
- `ratingMin` number
- `sort` one of `relevance|distance|rating|popular|recent`
- `page` number (default `1`)
- `pageSize` number (default `20`, max `50`)

Response `200`:
```json
{
  "items": [
    {
      "id": "trl_1001",
      "slug": "eagle-ridge-loop",
      "name": "Eagle Ridge Loop",
      "location": "Denver, Colorado",
      "difficulty": "moderate",
      "activity": ["hiking"],
      "distanceKm": 8.6,
      "elevationGainM": 420,
      "rating": 4.7,
      "reviewCount": 393,
      "thumbnailUrl": "https://...",
      "coordinate": {
        "lat": 39.73,
        "lon": -104.97
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 986
  }
}
```

## Trails
### `GET /trails/:slug`
Response `200`:
```json
{
  "id": "trl_1001",
  "slug": "eagle-ridge-loop",
  "name": "Eagle Ridge Loop",
  "summary": "Scenic loop with mixed forest and ridge views.",
  "difficulty": "moderate",
  "activities": ["hiking", "trail-running"],
  "stats": {
    "distanceKm": 8.6,
    "elevationGainM": 420,
    "durationMin": 180,
    "routeType": "loop"
  },
  "location": {
    "city": "Denver",
    "region": "Colorado",
    "country": "USA",
    "start": {
      "lat": 39.73,
      "lon": -104.97
    }
  },
  "media": {
    "heroImageUrl": "https://...",
    "gallery": ["https://...", "https://..."]
  },
  "map": {
    "polyline": "encoded_polyline",
    "bounds": [-105.00, 39.70, -104.93, 39.77]
  },
  "conditions": {
    "updatedAt": "2026-03-14T15:00:00.000Z",
    "highlights": ["Muddy near mile 2", "Clear past ridge"]
  },
  "rating": {
    "average": 4.7,
    "count": 393
  },
  "isFavorite": false
}
```

### `GET /trails/:id/reviews`
Query params: `page`, `pageSize`, `sort=recent|top`

Response `200`:
```json
{
  "items": [
    {
      "id": "rvw_1",
      "user": {
        "id": "usr_15",
        "displayName": "Ava"
      },
      "rating": 5,
      "comment": "Great views and clear path.",
      "condition": "good",
      "activity": "hiking",
      "createdAt": "2026-03-13T19:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 393
  }
}
```

### `POST /trails/:id/reviews`
Request:
```json
{
  "rating": 5,
  "comment": "Great sunrise views.",
  "condition": "good",
  "activity": "hiking"
}
```
Response `201`:
```json
{
  "id": "rvw_new",
  "createdAt": "2026-03-14T15:00:00.000Z"
}
```

## Parks
### `GET /parks/:slug`
Response `200`:
```json
{
  "id": "prk_31",
  "slug": "rocky-mountain-national-park",
  "name": "Rocky Mountain National Park",
  "summary": "Popular alpine park with lakes and high elevation routes.",
  "heroImageUrl": "https://...",
  "trailCount": 215,
  "topTrails": [
    {
      "id": "trl_1001",
      "slug": "eagle-ridge-loop",
      "name": "Eagle Ridge Loop",
      "difficulty": "moderate",
      "rating": 4.7
    }
  ]
}
```

## User Favorites
### `GET /users/me/favorites`
Response `200`:
```json
{
  "items": [
    {
      "trailId": "trl_1001",
      "savedAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

### `POST /users/me/favorites/:trailId`
Response `204` no body.

### `DELETE /users/me/favorites/:trailId`
Response `204` no body.

## User Lists
### `GET /users/me/lists`
Response `200`:
```json
{
  "items": [
    {
      "id": "lst_1",
      "name": "Weekend Routes",
      "trailCount": 8,
      "updatedAt": "2026-03-10T09:00:00.000Z"
    }
  ]
}
```

### `POST /users/me/lists`
Request:
```json
{
  "name": "Spring Trails",
  "isPublic": false
}
```
Response `201`:
```json
{
  "id": "lst_2",
  "name": "Spring Trails",
  "isPublic": false
}
```

### `POST /users/me/lists/:listId/trails/:trailId`
Response `204` no body.

### `DELETE /users/me/lists/:listId/trails/:trailId`
Response `204` no body.

## Non-Functional Requirements
- P95 response time under 400 ms for `GET /search/trails` with indexed query paths.
- Rate limit authenticated writes to 60 requests per minute per user.
- Include `requestId` for every response.
- Add ETag support for `GET /trails/:slug` and `GET /parks/:slug`.
