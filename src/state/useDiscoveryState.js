import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULTS = {
  q: '',
  category: '',
  difficulty: '',
  activity: '',
  routeType: '',
  state: '',
  radiusKm: '50',
  sort: 'most-relevant',
  page: '1',
  view: 'split',
};

export const useDiscoveryState = () => {
  const [params, setParams] = useSearchParams();

  const state = useMemo(() => {
    return {
      query: params.get('q') || DEFAULTS.q,
      category: params.get('category') || DEFAULTS.category,
      difficulty: params.get('difficulty') || DEFAULTS.difficulty,
      activity: params.get('activity') || DEFAULTS.activity,
      routeType: params.get('routeType') || DEFAULTS.routeType,
      stateCode: params.get('state') || DEFAULTS.state,
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
