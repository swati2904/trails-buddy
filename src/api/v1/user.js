import { requestJson, USE_MOCK_API } from './http';

const FAVORITES_KEY = 'tb.v1.favorites';
const LISTS_KEY = 'tb.v1.lists';

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFavorites = async (token) => {
  if (!USE_MOCK_API) {
    return requestJson({
      path: '/users/me/favorites',
      token,
      fallbackMessage: 'Unable to load favorites',
    });
  }

  const items = readJson(FAVORITES_KEY, []);
  return { items };
};

export const addFavorite = async (trailId, token) => {
  if (!USE_MOCK_API) {
    await requestJson({
      path: `/users/me/favorites/${trailId}`,
      method: 'POST',
      token,
      fallbackMessage: 'Unable to add favorite',
    });
    return;
  }

  const items = readJson(FAVORITES_KEY, []);
  if (!items.some((item) => item.trailId === trailId)) {
    items.push({ trailId, savedAt: new Date().toISOString() });
    writeJson(FAVORITES_KEY, items);
  }
};

export const removeFavorite = async (trailId, token) => {
  if (!USE_MOCK_API) {
    await requestJson({
      path: `/users/me/favorites/${trailId}`,
      method: 'DELETE',
      token,
      fallbackMessage: 'Unable to remove favorite',
    });
    return;
  }

  const items = readJson(FAVORITES_KEY, []).filter((item) => item.trailId !== trailId);
  writeJson(FAVORITES_KEY, items);
};

export const getLists = async (token) => {
  if (!USE_MOCK_API) {
    return requestJson({
      path: '/users/me/lists',
      token,
      fallbackMessage: 'Unable to load lists',
    });
  }

  const items = readJson(LISTS_KEY, []);
  return { items };
};

export const createList = async ({ name, isPublic = false }, token) => {
  if (!USE_MOCK_API) {
    return requestJson({
      path: '/users/me/lists',
      method: 'POST',
      body: { name, isPublic },
      token,
      fallbackMessage: 'Unable to create list',
    });
  }

  const items = readJson(LISTS_KEY, []);
  const created = {
    id: `lst_${Date.now()}`,
    name,
    isPublic,
    trailCount: 0,
    trails: [],
    updatedAt: new Date().toISOString(),
  };
  items.push(created);
  writeJson(LISTS_KEY, items);
  return created;
};

export const addTrailToList = async (listId, trailId, token) => {
  if (!USE_MOCK_API) {
    await requestJson({
      path: `/users/me/lists/${listId}/trails/${trailId}`,
      method: 'POST',
      token,
      fallbackMessage: 'Unable to add trail to list',
    });
    return;
  }

  const items = readJson(LISTS_KEY, []);
  const next = items.map((item) => {
    if (item.id !== listId) {
      return item;
    }

    const trails = Array.isArray(item.trails) ? item.trails : [];
    if (trails.includes(trailId)) {
      return item;
    }

    return {
      ...item,
      trails: [...trails, trailId],
      trailCount: (item.trailCount || trails.length) + 1,
      updatedAt: new Date().toISOString(),
    };
  });

  writeJson(LISTS_KEY, next);
};

export const removeTrailFromList = async (listId, trailId, token) => {
  if (!USE_MOCK_API) {
    await requestJson({
      path: `/users/me/lists/${listId}/trails/${trailId}`,
      method: 'DELETE',
      token,
      fallbackMessage: 'Unable to remove trail from list',
    });
    return;
  }

  const items = readJson(LISTS_KEY, []);
  const next = items.map((item) => {
    if (item.id !== listId) {
      return item;
    }

    const trails = Array.isArray(item.trails) ? item.trails : [];
    const filteredTrails = trails.filter((id) => id !== trailId);

    return {
      ...item,
      trails: filteredTrails,
      trailCount: filteredTrails.length,
      updatedAt: new Date().toISOString(),
    };
  });

  writeJson(LISTS_KEY, next);
};
