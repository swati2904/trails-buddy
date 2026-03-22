import { requestJson } from './http';
import { normalizeFiltersMetadata, normalizeListResponse } from './contracts';
import { normalizeTrail } from './trails';

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
    itemNormalizer: normalizeTrail,
    fallbackPage: query?.page || 1,
    fallbackSize: query?.pageSize || 20,
  });
};

export const searchDiscovery = async (query = {}) => {
  const response = await requestJson({
    path: '/search/global',
    query,
    fallbackMessage: 'Unable to run global search',
  });

  return normalizeDiscoveryResults(response, query);
};

export const searchNearbyTrails = async (query = {}) => {
  const response = await requestJson({
    path: '/search/nearby',
    query,
    fallbackMessage: 'Unable to load nearby trails',
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

export const getFiltersMetadata = async (query = {}) => {
  const response = await requestJson({
    path: '/metadata/filters',
    query,
    fallbackMessage: 'Unable to load search filters',
  });

  return normalizeFiltersMetadata(response);
};
