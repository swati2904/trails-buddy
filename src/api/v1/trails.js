import { requestJson } from './http';

const TRAIL_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=60';

const toNumber = (value, fallback = null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toTitleCase = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .split(/\s+/)
    .map((part) =>
      part
        ? `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`
        : '',
    )
    .join(' ')
    .trim();
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

const getTrailCategory = (trail) => {
  const category =
    trail?.park?.category ||
    trail?.parkCategory ||
    trail?.category ||
    trail?.park_type ||
    '';

  const normalized = String(category).toLowerCase();
  if (normalized.includes('national')) {
    return 'National Parks';
  }
  if (normalized.includes('regional')) {
    return 'Regional Parks';
  }
  if (normalized.includes('state')) {
    return 'State Parks';
  }

  return category ? toTitleCase(category) : 'Park';
};

const getTrailLocationLabel = (trail) => {
  if (trail?.location && typeof trail.location === 'string') {
    return trail.location;
  }

  const city = trail?.park?.city || trail?.city || trail?.location?.city || '';
  const state =
    trail?.park?.state || trail?.state || trail?.location?.state || '';

  if (city && state) {
    return `${city}, ${state}`;
  }

  if (state) {
    return state;
  }

  return trail?.park?.name || trail?.parkName || 'Location unavailable';
};

const normalizeTrail = (trail) => {
  const normalizedCoordinate =
    normalizeCoordinate(trail?.coordinate) ||
    normalizeCoordinate(trail?.location?.start) ||
    normalizeCoordinate(trail?.startCoordinate);

  const distanceKm = toNumber(
    trail?.distanceKm ||
      trail?.distance_km ||
      trail?.stats?.distanceKm ||
      trail?.stats?.distance,
    0,
  );

  const distanceFromSearchKm = toNumber(
    trail?.distanceFromSearchKm || trail?.distance_from_search_km,
    null,
  );

  const elevationGainM = toNumber(
    trail?.elevationGainM ||
      trail?.elevation_gain_m ||
      trail?.stats?.elevationGainM,
    0,
  );

  const difficulty = String(trail?.difficulty || 'moderate').toLowerCase();
  const routeCoordinates = normalizeRouteCoordinates(
    trail?.map?.routeCoordinates || trail?.map?.polylineCoordinates,
  );

  return {
    ...trail,
    id: String(trail?.id || trail?._id || trail?.slug || trail?.name || ''),
    slug: trail?.slug || String(trail?.id || '').toLowerCase(),
    name: trail?.name || 'Unnamed Trail',
    thumbnailUrl:
      trail?.thumbnailUrl ||
      trail?.media?.thumbnailUrl ||
      trail?.media?.heroImageUrl ||
      trail?.heroImageUrl ||
      TRAIL_FALLBACK_IMAGE,
    difficulty,
    distanceKm,
    distanceFromSearchKm,
    elevationGainM,
    routeType: trail?.routeType || trail?.route_type || 'out-and-back',
    activityType: trail?.activityType || trail?.activity || 'hiking',
    rating: toNumber(trail?.rating?.average || trail?.rating || 0, 0),
    parkName:
      trail?.park?.name || trail?.parkName || trail?.park || 'Unknown Park',
    parkSlug: trail?.park?.slug || trail?.parkSlug || '',
    parkCategory: getTrailCategory(trail),
    location: getTrailLocationLabel(trail),
    state: trail?.park?.state || trail?.state || trail?.location?.state || '',
    summary: trail?.summary || trail?.description || '',
    aiSummary: trail?.aiSummary || '',
    coordinate: normalizedCoordinate,
    stats: {
      ...(trail?.stats || {}),
      distanceKm,
      elevationGainM,
    },
    map: {
      ...(trail?.map || {}),
      routeCoordinates,
    },
    locationData: {
      ...(trail?.location || {}),
      start:
        normalizeCoordinate(trail?.location?.start) || normalizedCoordinate,
    },
  };
};

export const searchTrails = async (query = {}) => {
  const response = await requestJson({
    path: '/search/trails',
    query,
    fallbackMessage: 'Unable to load trails',
  });

  const items = Array.isArray(response?.items)
    ? response.items.map((item) => normalizeTrail(item))
    : [];

  return {
    ...response,
    items,
    page: toNumber(response?.page, query?.page || 1),
    pageSize: toNumber(response?.pageSize, query?.pageSize || items.length),
    total: toNumber(response?.total, items.length),
  };
};

export const getFeaturedTrails = async ({
  sort = 'popular',
  radiusKm,
  pageSize = 6,
  ...query
} = {}) => {
  return searchTrails({
    ...query,
    sort,
    radiusKm,
    page: 1,
    pageSize,
  });
};

export const getTrailBySlug = async (slug) => {
  const response = await requestJson({
    path: `/trails/${slug}`,
    fallbackMessage: 'Unable to load trail details',
  });

  return normalizeTrail(response);
};

export const getTrailReviews = async (trailId, page = 1, pageSize = 20) => {
  return requestJson({
    path: `/trails/${trailId}/reviews`,
    query: { page, pageSize, sort: 'recent' },
    fallbackMessage: 'Unable to load trail reviews',
  });
};

export const createTrailReview = async (trailId, payload, token) => {
  return requestJson({
    path: `/trails/${trailId}/reviews`,
    method: 'POST',
    body: payload,
    token,
    fallbackMessage: 'Unable to submit review',
  });
};
