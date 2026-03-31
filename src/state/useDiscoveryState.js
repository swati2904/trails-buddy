import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const SETTINGS_KEY = 'tb.ui.settings';
const ALLOWED_VIEWS = new Set(['list', 'map', 'split']);
const ALLOWED_RADII = new Set(['25', '50', '100', '200', '300']);

const getStoredDiscoveryDefaults = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    const view = String(parsed?.defaultExploreView || '');
    const radiusKm = String(parsed?.defaultRadiusKm || '');

    return {
      view: ALLOWED_VIEWS.has(view) ? view : undefined,
      radiusKm: ALLOWED_RADII.has(radiusKm) ? radiusKm : undefined,
    };
  } catch {
    return {};
  }
};

const DEFAULTS = {
  q: '',
  state: '',
  city: '',
  zipCode: '',
  radiusKm: '50',
  sort: 'relevance',
  page: '1',
  view: 'split',
  ...getStoredDiscoveryDefaults(),
};

export const useDiscoveryState = () => {
  const [params, setParams] = useSearchParams();

  const state = useMemo(() => {
    return {
      query: params.get('q') || DEFAULTS.q,
      stateCode: params.get('state') || DEFAULTS.state,
      city: params.get('city') || DEFAULTS.city,
      zipCode: params.get('zip') || DEFAULTS.zipCode,
      radiusKm: params.get('radiusKm') || DEFAULTS.radiusKm,
      sort: params.get('sort') || DEFAULTS.sort,
      page: Number(params.get('page') || DEFAULTS.page),
      view: params.get('view') || DEFAULTS.view,
      latitude: params.get('lat') || '',
      longitude: params.get('lon') || '',
      placeLabel: params.get('place') || '',
    };
  }, [params]);

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params);
      const normalizedValue =
        value === undefined || value === null ? '' : value;

      if (
        String(normalizedValue).trim() === '' ||
        normalizedValue === DEFAULTS[key]
      ) {
        next.delete(key);
      } else {
        next.set(key, String(normalizedValue));
      }

      if (key !== 'page') {
        next.delete('page');
      }

      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const patchParams = useCallback(
    (updates = {}) => {
      const next = new URLSearchParams(params);

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          String(value).trim() === ''
        ) {
          next.delete(key);
          return;
        }

        if (DEFAULTS[key] && String(value) === DEFAULTS[key]) {
          next.delete(key);
          return;
        }

        next.set(key, String(value));
      });

      if (!Object.prototype.hasOwnProperty.call(updates, 'page')) {
        next.delete('page');
      }

      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams();
    if (state.query.trim()) {
      next.set('q', state.query.trim());
    }
    if (state.placeLabel) {
      next.set('place', state.placeLabel);
    }
    if (state.latitude && state.longitude) {
      next.set('lat', state.latitude);
      next.set('lon', state.longitude);
    }
    setParams(next, { replace: true });
  }, [
    setParams,
    state.latitude,
    state.longitude,
    state.placeLabel,
    state.query,
  ]);

  return {
    state,
    setParam,
    patchParams,
    clearFilters,
  };
};
