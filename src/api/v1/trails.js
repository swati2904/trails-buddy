import { mockReviewsByTrailId, mockTrails } from '../../data/mockTrails';
import { requestJson, USE_MOCK_API } from './http';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    return requestJson({
      path: '/search/trails',
      query,
      fallbackMessage: 'Unable to load trails',
    });
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
