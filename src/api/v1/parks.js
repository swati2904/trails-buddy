import { requestJson } from './http';
import { normalizeListResponse } from './contracts';
import { normalizeImageUrl } from './media';

const toNumber = (value, fallback = null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeParkCategory = (value) => {
  const raw = String(value || '').trim();
  if (!raw) {
    return 'National Park';
  }

  return raw
    .toLowerCase()
    .split(/[_\s]+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
};

export const normalizePark = (park) => {
  return {
    ...park,
    id: String(park?.id || park?._id || park?.slug || park?.name || ''),
    slug: park?.slug || '',
    name: park?.name || 'Unnamed Park',
    summary: park?.summary || park?.overview || '',
    category: normalizeParkCategory(park?.category || park?.parkCategory),
    sourceDataset: park?.sourceDataset || '',
    city: park?.city || park?.location?.city || '',
    state: park?.state || park?.location?.state || '',
    zipCode: park?.zipCode || park?.zip || '',
    lat: toNumber(park?.lat ?? park?.latitude, null),
    lon: toNumber(park?.lon ?? park?.lng ?? park?.longitude, null),
    heroImageUrl: normalizeImageUrl(park?.heroImageUrl),
  };
};

export const searchParks = async (query = {}) => {
  const response = await requestJson({
    path: '/parks',
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

export const searchNearbyParks = async (query = {}) => {
  const response = await requestJson({
    path: '/parks/nearby',
    query,
    fallbackMessage: 'Unable to load nearby parks',
  });

  return normalizeListResponse({
    response,
    itemNormalizer: normalizePark,
    fallbackPage: query?.page || 1,
    fallbackSize: query?.pageSize || 20,
  });
};
