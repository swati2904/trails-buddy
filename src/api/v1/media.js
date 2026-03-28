const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const isAbsoluteUrl = (value) => /^(?:https?:)?\/\//i.test(value);

const buildAssetOrigin = () => {
  const apiOrigin = trimTrailingSlash(process.env.REACT_APP_API_ORIGIN || '');
  if (apiOrigin) {
    return apiOrigin;
  }

  const apiUrl = String(process.env.REACT_APP_API_URL || '').trim();
  if (isAbsoluteUrl(apiUrl)) {
    try {
      return trimTrailingSlash(new URL(apiUrl).origin);
    } catch (error) {
      // Fall through to window origin.
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return '';
};

export const normalizeImageUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  if (
    isAbsoluteUrl(raw) ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw;
  }

  const origin = buildAssetOrigin();
  if (!origin) {
    return raw;
  }

  if (raw.startsWith('/')) {
    return `${origin}${raw}`;
  }

  return `${origin}/${raw}`;
};
