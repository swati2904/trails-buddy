import { mockReviewsByTrailId, mockTrails } from '../../data/mockTrails';
import { requestJson, USE_MOCK_API } from './http';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const EXTERNAL_TRAIL_CACHE = new Map();

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const haversineDistanceKm = (from, to) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const parseNominatimCoordinate = (result) => {
  const lat = Number(result?.lat);
  const lon = Number(result?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return {
    lat,
    lon,
    locationName: result?.display_name || '',
  };
};

const geocodeUnitedStatesLocation = async (query) => {
  const params = new URLSearchParams({
    format: 'jsonv2',
    countrycodes: 'us',
    limit: '1',
    q: String(query || '').trim(),
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  return parseNominatimCoordinate(payload[0]);
};

const fetchOpenStreetMapTrails = async ({ lat, lon, radiusMeters = 50000 }) => {
  const overpassQuery = `
    [out:json][timeout:25];
    (
      way["highway"~"path|footway|track"]["name"](around:${Math.round(
        radiusMeters,
      )},${lat},${lon});
    );
    out tags center geom 120;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: new URLSearchParams({ data: overpassQuery }).toString(),
  });

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  const elements = Array.isArray(payload?.elements) ? payload.elements : [];

  return elements
    .filter((item) => item?.tags?.name && item?.center)
    .map((item) => {
      const center = {
        lat: Number(item.center.lat),
        lon: Number(item.center.lon),
      };
      const geometry = Array.isArray(item.geometry)
        ? item.geometry
            .map((point) => [Number(point.lat), Number(point.lon)])
            .filter(
              (point) => Number.isFinite(point[0]) && Number.isFinite(point[1]),
            )
        : [];

      return {
        id: `osm_${item.type}_${item.id}`,
        slug: `osm-${item.id}-${toSlug(item.tags.name)}`,
        name: item.tags.name,
        location: item.tags['addr:city'] || item.tags['addr:state'] || 'United States',
        difficulty: 'moderate',
        activity: ['hiking'],
        distanceKm: Number(
          haversineDistanceKm({ lat, lon }, center).toFixed(1),
        ),
        elevationGainM: 0,
        rating: 4.3,
        reviewCount: 0,
        thumbnailUrl:
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        summary: `OpenStreetMap trail near ${lat.toFixed(3)}, ${lon.toFixed(3)}.`,
        routeType: 'out-and-back',
        durationMin: 120,
        map: {
          start: center,
          bounds: null,
          routeCoordinates: geometry,
        },
        conditions: ['OpenStreetMap data source'],
      };
    });
};

const normalizeCoordinate = (coordinate) => {
  if (!coordinate) {
    return null;
  }

  if (Array.isArray(coordinate) && coordinate.length >= 2) {
    const lat = Number(coordinate[0]);
    const lon = Number(coordinate[1]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon };
    }
  }

  const lat = coordinate.lat ?? coordinate.latitude;
  const lon = coordinate.lon ?? coordinate.lng ?? coordinate.longitude;
  if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))) {
    return { lat: Number(lat), lon: Number(lon) };
  }

  return null;
};

const normalizeRouteCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates)) {
    return [];
  }

  return coordinates
    .map((coordinate) => normalizeCoordinate(coordinate))
    .filter(Boolean)
    .map((coordinate) => [coordinate.lat, coordinate.lon]);
};

const applySearchFilters = (items, query) => {
  const q = (query.q || '').trim().toLowerCase();
  const difficulty = query.difficulty || null;
  const sort = query.sort || 'relevance';

  let result = items.filter((trail) => {
    if (difficulty && trail.difficulty !== difficulty) {
      return false;
    }

    if (!q) {
      return true;
    }

    return (
      trail.name.toLowerCase().includes(q) ||
      trail.location.toLowerCase().includes(q)
    );
  });

  if (sort === 'distance') {
    result = result.slice().sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (sort === 'rating' || sort === 'popular') {
    result = result.slice().sort((a, b) => b.rating - a.rating);
  } else {
    result = result.slice().sort((a, b) => b.reviewCount - a.reviewCount);
  }

  return result;
};

export const searchTrails = async (query = {}) => {
  if (!USE_MOCK_API) {
    const backendResult = await requestJson({
      path: '/search/trails',
      query,
      fallbackMessage: 'Unable to load trails',
    });

    const backendItems = Array.isArray(backendResult?.items)
      ? backendResult.items
      : [];

    if (backendItems.length > 0 || !(query?.q || '').trim()) {
      return backendResult;
    }

    const geocoded = await geocodeUnitedStatesLocation(query.q);
    if (!geocoded) {
      return backendResult;
    }

    const fallbackTrails = await fetchOpenStreetMapTrails({
      lat: geocoded.lat,
      lon: geocoded.lon,
    });

    if (!fallbackTrails.length) {
      return backendResult;
    }

    const normalized = applySearchFilters(fallbackTrails, {
      ...query,
      q: '',
    });
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 20);
    const start = (page - 1) * pageSize;
    const paged = normalized.slice(start, start + pageSize).map((trail) => ({
      id: trail.id,
      slug: trail.slug,
      name: trail.name,
      location: geocoded.locationName || trail.location,
      difficulty: trail.difficulty,
      activity: trail.activity,
      distanceKm: trail.distanceKm,
      elevationGainM: trail.elevationGainM,
      rating: trail.rating,
      reviewCount: trail.reviewCount,
      thumbnailUrl: trail.thumbnailUrl,
      coordinate: trail.map.start,
    }));

    normalized.forEach((trail) => {
      EXTERNAL_TRAIL_CACHE.set(trail.slug, trail);
    });

    return {
      items: paged,
      pagination: {
        page,
        pageSize,
        total: normalized.length,
      },
    };
  }

  await sleep(120);
  const page = Number(query.page || 1);
  const pageSize = Number(query.pageSize || 20);

  const filtered = applySearchFilters(mockTrails, query);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((trail) => ({
    id: trail.id,
    slug: trail.slug,
    name: trail.name,
    location: trail.location,
    difficulty: trail.difficulty,
    activity: trail.activity,
    distanceKm: trail.distanceKm,
    elevationGainM: trail.elevationGainM,
    rating: trail.rating,
    reviewCount: trail.reviewCount,
    thumbnailUrl: trail.thumbnailUrl,
    coordinate: trail.map.start,
  }));

  return {
    items,
    pagination: {
      page,
      pageSize,
      total: filtered.length,
    },
  };
};

export const getTrailBySlug = async (slug) => {
  if (!USE_MOCK_API) {
    if (EXTERNAL_TRAIL_CACHE.has(slug)) {
      const cachedTrail = EXTERNAL_TRAIL_CACHE.get(slug);

      return {
        id: cachedTrail.id,
        slug: cachedTrail.slug,
        name: cachedTrail.name,
        summary: cachedTrail.summary,
        difficulty: cachedTrail.difficulty,
        activities: cachedTrail.activity,
        stats: {
          distanceKm: cachedTrail.distanceKm,
          elevationGainM: cachedTrail.elevationGainM,
          durationMin: cachedTrail.durationMin,
          routeType: cachedTrail.routeType,
        },
        location: {
          city: cachedTrail.location,
          region: '',
          country: 'USA',
          start: cachedTrail.map.start,
        },
        media: {
          heroImageUrl: cachedTrail.thumbnailUrl,
          gallery: [cachedTrail.thumbnailUrl],
        },
        map: {
          polyline: '',
          bounds: cachedTrail.map.bounds,
          routeCoordinates: normalizeRouteCoordinates(
            cachedTrail.map.routeCoordinates,
          ),
        },
        conditions: {
          updatedAt: new Date().toISOString(),
          highlights: cachedTrail.conditions,
        },
        rating: {
          average: cachedTrail.rating,
          count: cachedTrail.reviewCount,
        },
        isFavorite: false,
      };
    }

    const trail = await requestJson({
      path: `/trails/${slug}`,
      fallbackMessage: 'Unable to load trail details',
    });

    const routeCoordinates = normalizeRouteCoordinates(
      trail?.map?.routeCoordinates || trail?.map?.polylineCoordinates,
    );

    return {
      ...trail,
      map: {
        ...trail?.map,
        routeCoordinates,
      },
      location: {
        ...trail?.location,
        start: normalizeCoordinate(trail?.location?.start),
      },
    };
  }

  await sleep(100);
  const trail = mockTrails.find((item) => item.slug === slug);
  if (!trail) {
    return null;
  }

  return {
    id: trail.id,
    slug: trail.slug,
    name: trail.name,
    summary: trail.summary,
    difficulty: trail.difficulty,
    activities: trail.activity,
    stats: {
      distanceKm: trail.distanceKm,
      elevationGainM: trail.elevationGainM,
      durationMin: trail.durationMin,
      routeType: trail.routeType,
    },
    location: {
      city: trail.location.split(',')[0],
      region: trail.location.split(',')[1]?.trim() || '',
      country: 'USA',
      start: trail.map.start,
    },
    media: {
      heroImageUrl: trail.thumbnailUrl,
      gallery: [trail.thumbnailUrl],
    },
    map: {
      polyline: '',
      bounds: trail.map.bounds,
      routeCoordinates: normalizeRouteCoordinates(trail.map.routeCoordinates),
    },
    conditions: {
      updatedAt: new Date().toISOString(),
      highlights: trail.conditions,
    },
    rating: {
      average: trail.rating,
      count: trail.reviewCount,
    },
    isFavorite: false,
  };
};

export const getTrailReviews = async (trailId, page = 1, pageSize = 20) => {
  if (!USE_MOCK_API) {
    return requestJson({
      path: `/trails/${trailId}/reviews`,
      query: { page, pageSize, sort: 'recent' },
      fallbackMessage: 'Unable to load trail reviews',
    });
  }

  await sleep(80);
  const items = mockReviewsByTrailId[trailId] || [];
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    pagination: {
      page,
      pageSize,
      total: items.length,
    },
  };
};

export const createTrailReview = async (trailId, payload, token) => {
  if (!USE_MOCK_API) {
    return requestJson({
      path: `/trails/${trailId}/reviews`,
      method: 'POST',
      body: payload,
      token,
      fallbackMessage: 'Unable to submit review',
    });
  }

  await sleep(140);
  if (!trailId || !payload?.comment) {
    throw new Error('Invalid review payload');
  }

  return {
    id: `rvw_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
};
