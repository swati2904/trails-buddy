import { requestJson } from './http';
import { normalizeListResponse } from './contracts';
import { normalizePark } from './parks';

const normalizeSuggestion = (item) => {
  if (!item || typeof item !== 'object') {
    return {
      id: '',
      label: '',
      type: 'query',
      value: '',
      state: '',
    };
  }

  return {
    id: String(item.id || item.value || item.label || ''),
    label: item.label || item.value || '',
    type: item.type || item.entityType || 'query',
    value: item.value || item.label || '',
    state: item.state || '',
  };
};

const normalizeDiscoveryResults = (response, query = {}) => {
  return normalizeListResponse({
    response,
    itemNormalizer: normalizePark,
    fallbackPage: query?.page || 1,
    fallbackSize: query?.pageSize || 20,
  });
};

export const searchNearbyParksBySearch = async (query = {}) => {
  const response = await requestJson({
    path: '/search/nearby-parks',
    query,
    fallbackMessage: 'Unable to load nearby parks',
  });

  return normalizeDiscoveryResults(response, query);
};

export const getSearchSuggestions = async (query = {}) => {
  const response = await requestJson({
    path: '/search/autocomplete',
    query,
    fallbackMessage: 'Unable to load search suggestions',
  });

  return {
    ...response,
    items: Array.isArray(response?.items)
      ? response.items.map((item) => normalizeSuggestion(item))
      : [],
  };
};
