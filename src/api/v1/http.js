const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');
const trimLeadingSlash = (value) => String(value || '').replace(/^\/+/, '');

const buildBaseUrl = () => {
  const exactUrl = process.env.REACT_APP_API_URL;
  if (exactUrl && exactUrl.trim()) {
    return trimTrailingSlash(exactUrl);
  }

  const origin = trimTrailingSlash(
    process.env.REACT_APP_API_ORIGIN || 'http://localhost:8080',
  );
  const basePath = trimLeadingSlash(
    process.env.REACT_APP_API_BASE_PATH || 'api',
  );
  const version = trimLeadingSlash(process.env.REACT_APP_API_VERSION || 'v1');

  return `${origin}/${basePath}/${version}`;
};

const API_BASE_URL = buildBaseUrl();

export const USE_MOCK_API =
  String(process.env.REACT_APP_USE_MOCK_API || 'true').toLowerCase() !==
  'false';

const getErrorMessage = (payload, fallbackMessage) => {
  if (payload && typeof payload === 'object') {
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (
      payload.error &&
      typeof payload.error === 'object' &&
      typeof payload.error.message === 'string' &&
      payload.error.message.trim()
    ) {
      return payload.error.message;
    }
  }

  return fallbackMessage;
};

const buildUrl = (path, query) => {
  const normalizedPath = trimLeadingSlash(path);
  const url = new URL(`${API_BASE_URL}/${normalizedPath}`);

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          url.searchParams.append(key, String(item));
        });
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

export const requestJson = async ({
  path,
  method = 'GET',
  query,
  body,
  token,
  fallbackMessage = 'Request failed',
}) => {
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(getErrorMessage(payload, fallbackMessage));
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    Object.prototype.hasOwnProperty.call(payload, 'data')
  ) {
    return payload.data;
  }

  return payload;
};
