const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');
const trimLeadingSlash = (value) => String(value || '').replace(/^\/+/, '');

const AUTH_SESSION_KEY = 'tb.auth.session';
const REFRESHABLE_AUTH_CODES = new Set([
  'AUTH_TOKEN_EXPIRED',
  'AUTH_TOKEN_INVALID',
]);

const normalizeAccessToken = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.replace(/^Bearer\s+/i, '').trim();
};

const createCorrelationId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `tb-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const decodeJwtPayload = (token) => {
  if (typeof token !== 'string' || !token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch (error) {
    return null;
  }
};

const buildBaseUrl = () => {
  const exactUrl = process.env.REACT_APP_API_URL;
  if (exactUrl && exactUrl.trim()) {
    return trimTrailingSlash(exactUrl);
  }

  const origin = trimTrailingSlash(process.env.REACT_APP_API_ORIGIN || '');
  const basePath = trimLeadingSlash(process.env.REACT_APP_API_BASE_PATH || '');
  const version = trimLeadingSlash(process.env.REACT_APP_API_VERSION || 'v1');

  const pathParts = [basePath, version].filter(Boolean);
  if (!origin) {
    return `/${pathParts.join('/')}`;
  }

  const parts = [origin, ...pathParts];
  return trimTrailingSlash(parts.join('/'));
};

const API_BASE_URL = buildBaseUrl();

let refreshInFlightPromise = null;

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const writeStoredSession = (session) => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

const clearStoredSession = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};

const readPayload = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const unwrapEnvelope = (payload) => {
  if (
    payload &&
    typeof payload === 'object' &&
    Object.prototype.hasOwnProperty.call(payload, 'data')
  ) {
    return payload.data;
  }

  return payload;
};

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

const createRequestError = (response, payload, fallbackMessage) => {
  const requestId = payload?.meta?.requestId || null;
  const correlationId = response.headers.get('X-Correlation-Id') || null;
  const message = getErrorMessage(payload, fallbackMessage);

  const error = new Error(message);
  error.status = response.status;
  error.code = payload?.error?.code || payload?.code || null;
  error.details = payload;
  error.requestId = requestId || correlationId;
  error.correlationId = correlationId;
  return error;
};

const shouldRefreshAndRetry = (error) => {
  if (!error) {
    return false;
  }

  if (error.status === 401) {
    return true;
  }

  if (REFRESHABLE_AUTH_CODES.has(String(error.code || ''))) {
    return true;
  }

  return false;
};

const refreshAccessToken = async () => {
  if (refreshInFlightPromise) {
    return refreshInFlightPromise;
  }

  refreshInFlightPromise = (async () => {
    const correlationId = createCorrelationId();
    const session = readStoredSession();
    const refreshToken = session?.tokens?.refreshToken;

    if (!refreshToken) {
      clearStoredSession();
      window.dispatchEvent(
        new CustomEvent('tb-auth-session-invalid', {
          detail: {
            reason: 'missing-refresh-token',
          },
        }),
      );
      return null;
    }

    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Correlation-Id': correlationId,
      },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = await readPayload(response);
    if (!response.ok) {
      throw createRequestError(
        response,
        payload,
        'Unable to refresh authentication session',
      );
    }

    const nextTokens = unwrapEnvelope(payload) || {};
    const nextSession = {
      user: session?.user || null,
      tokens: {
        ...session?.tokens,
        ...nextTokens,
      },
    };

    writeStoredSession(nextSession);
    window.dispatchEvent(
      new CustomEvent('tb-auth-session-updated', {
        detail: nextSession,
      }),
    );

    return nextSession?.tokens?.accessToken || null;
  })()
    .catch((error) => {
      clearStoredSession();
      window.dispatchEvent(
        new CustomEvent('tb-auth-session-invalid', {
          detail: {
            reason: error?.code || 'refresh-failed',
          },
        }),
      );
      throw error;
    })
    .finally(() => {
      refreshInFlightPromise = null;
    });

  return refreshInFlightPromise;
};

const buildUrl = (path, query) => {
  const normalizedPath = trimLeadingSlash(path);
  const normalizedBase = trimTrailingSlash(API_BASE_URL);
  const isAbsolute = /^https?:\/\//i.test(normalizedBase);
  const baseUrl = isAbsolute
    ? `${normalizedBase}/`
    : `${window.location.origin}${normalizedBase}/`;
  const url = new URL(normalizedPath, baseUrl);

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
  const debugAuth =
    process.env.NODE_ENV !== 'production' &&
    typeof window !== 'undefined' &&
    window.localStorage?.getItem('tb.debug.auth') === '1';

  const runRequest = async (authToken) => {
    const normalizedToken = normalizeAccessToken(authToken);
    const correlationId = createCorrelationId();
    const authHeader = normalizedToken ? `Bearer ${normalizedToken}` : '';
    const decodedPayload = decodeJwtPayload(normalizedToken);

    if (debugAuth) {
      console.info('[tb-auth]', {
        method,
        path,
        correlationId,
        hasAuthorizationHeader: Boolean(normalizedToken),
        tokenLength: normalizedToken.length,
        tokenPrefixLooksJwt: /^\S+\.\S+\.\S+$/.test(normalizedToken),
        hasQuote: normalizedToken.includes('"'),
        authorizationHeaderLength: authHeader.length,
        authPreview: authHeader.slice(0, 30),
        sub: decodedPayload?.sub || null,
        exp: decodedPayload?.exp || null,
        now: Math.floor(Date.now() / 1000),
      });
    }

    const hasBody = body !== undefined;
    const response = await fetch(buildUrl(path, query), {
      method,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'X-Correlation-Id': correlationId,
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(normalizedToken
          ? { Authorization: `Bearer ${normalizedToken}` }
          : {}),
      },
      ...(hasBody ? { body: JSON.stringify(body) } : {}),
    });

    const payload = await readPayload(response);

    if (!response.ok) {
      if (debugAuth && response.status === 401) {
        console.warn('[tb-auth] unauthorized', {
          method,
          path,
          correlationId,
          responseCorrelationId:
            response.headers.get('X-Correlation-Id') || null,
          hasAuthorizationHeader: Boolean(normalizedToken),
          errorCode: payload?.error?.code || payload?.code || null,
          errorMessage: payload?.error?.message || payload?.message || null,
          requestId: payload?.meta?.requestId || null,
        });
      }

      throw createRequestError(response, payload, fallbackMessage);
    }

    return unwrapEnvelope(payload);
  };

  const storedToken = readStoredSession()?.tokens?.accessToken;
  const initialToken = token || storedToken || null;

  try {
    return await runRequest(initialToken);
  } catch (error) {
    const canRetryWithRefresh = Boolean(initialToken);
    if (!canRetryWithRefresh || !shouldRefreshAndRetry(error)) {
      throw error;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      throw error;
    }

    return runRequest(refreshedToken);
  }
};
