/**
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} size
 * @property {number} totalElements
 * @property {number} totalPages
 */

/**
 * @typedef {Object} SearchFiltersMetadata
 * @property {Array<string>} categories
 * @property {Array<string>} difficulties
 * @property {Array<string>} activities
 * @property {Array<string>} routeTypes
 * @property {Array<string>} states
 * @property {Array<number>} radiusOptionsKm
 */

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizePagination = (response = {}, fallback = {}) => {
  const totalElements = toNumber(
    response.totalElements ?? response.total ?? response.count,
    toNumber(fallback.totalElements, 0),
  );

  const size = Math.max(
    1,
    toNumber(response.size ?? response.pageSize, toNumber(fallback.size, 20)),
  );
  const page = Math.max(
    1,
    toNumber(response.page ?? response.pageNumber, toNumber(fallback.page, 1)),
  );

  const calculatedTotalPages = Math.max(1, Math.ceil(totalElements / size));

  return {
    page,
    size,
    totalElements,
    totalPages: Math.max(
      1,
      toNumber(response.totalPages, calculatedTotalPages),
    ),
  };
};

export const normalizeListResponse = ({
  response,
  itemNormalizer,
  fallbackPage = 1,
  fallbackSize = 20,
}) => {
  const items = Array.isArray(response?.items)
    ? response.items.map((item) => itemNormalizer(item))
    : [];

  const pagination = normalizePagination(response, {
    page: fallbackPage,
    size: fallbackSize,
    totalElements: items.length,
  });

  return {
    ...response,
    items,
    page: pagination.page,
    pageSize: pagination.size,
    total: pagination.totalElements,
    pagination,
  };
};

export const normalizeFiltersMetadata = (response = {}) => {
  const source = response.filters || response;

  return {
    categories: Array.isArray(source?.categories) ? source.categories : [],
    difficulties: Array.isArray(source?.difficulties)
      ? source.difficulties
      : [],
    activities: Array.isArray(source?.activities) ? source.activities : [],
    routeTypes: Array.isArray(source?.routeTypes) ? source.routeTypes : [],
    states: Array.isArray(source?.states) ? source.states : [],
    radiusOptionsKm: Array.isArray(source?.radiusOptionsKm)
      ? source.radiusOptionsKm
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value))
      : [10, 25, 50, 100],
  };
};
