import { requestJson } from './http';

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

export const searchTrails = async (query = {}) => {
  return requestJson({
    path: '/search/trails',
    query,
    fallbackMessage: 'Unable to load trails',
  });
};

export const getTrailBySlug = async (slug) => {
  const trail = await requestJson({
    path: `/trails/${slug}`,
    fallbackMessage: 'Unable to load trail details',
  });

  const routeCoordinates = normalizeRouteCoordinates(
    trail?.map?.routeCoordinates || trail?.map?.polylineCoordinates,
  );

  return {
    ...trail,
    location: {
      ...trail?.location,
      start: normalizeCoordinate(trail?.location?.start),
    },
    map: {
      ...trail?.map,
      routeCoordinates,
    },
  };
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
