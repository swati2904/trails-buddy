import { requestJson } from './http';
import { normalizeListResponse } from './contracts';

const PARK_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=60';

const normalizeParkCategory = (value) => {
  const raw = String(value || '').toLowerCase();

  if (raw.includes('national')) {
    return 'National Parks';
  }
  if (raw.includes('regional')) {
    return 'Regional Parks';
  }
  if (raw.includes('state')) {
    return 'State Parks';
  }

  return value || 'Park';
};

export const normalizePark = (park) => {
  const topTrails = Array.isArray(park?.topTrails)
    ? park.topTrails
    : Array.isArray(park?.trails)
      ? park.trails
      : [];

  return {
    ...park,
    id: String(park?.id || park?._id || park?.slug || park?.name || ''),
    slug: park?.slug || '',
    name: park?.name || 'Unnamed Park',
    summary: park?.summary || park?.overview || '',
    category: normalizeParkCategory(park?.category || park?.parkCategory),
    state: park?.state || park?.location?.state || '',
    heroImageUrl:
      park?.heroImageUrl || park?.media?.heroImageUrl || PARK_FALLBACK_IMAGE,
    topTrails,
    mapArea:
      park?.mapArea ||
      park?.map?.boundary ||
      park?.geojson ||
      park?.boundary ||
      null,
    nearbyTrails: Array.isArray(park?.nearbyTrails) ? park.nearbyTrails : [],
  };
};

export const searchParks = async (query = {}) => {
  const response = await requestJson({
    path: '/search/parks',
    query,
    fallbackMessage: 'Unable to load parks',
  });

  return normalizeListResponse({
    response,
    itemNormalizer: normalizePark,
    fallbackPage: query?.page || 1,
    fallbackSize: query?.pageSize || 20,
  });
};

export const getParkBySlug = async (slug) => {
  const response = await requestJson({
    path: `/parks/${slug}`,
    fallbackMessage: 'Unable to load park details',
  });

  return normalizePark(response);
};
