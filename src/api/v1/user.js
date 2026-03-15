import { requestJson } from './http';

export const getFavorites = async (token) => {
  return requestJson({
    path: '/users/me/favorites',
    token,
    fallbackMessage: 'Unable to load favorites',
  });
};

export const addFavorite = async (trailId, token) => {
  await requestJson({
    path: `/users/me/favorites/${trailId}`,
    method: 'POST',
    token,
    fallbackMessage: 'Unable to add favorite',
  });
};

export const removeFavorite = async (trailId, token) => {
  await requestJson({
    path: `/users/me/favorites/${trailId}`,
    method: 'DELETE',
    token,
    fallbackMessage: 'Unable to remove favorite',
  });
};

export const getLists = async (token) => {
  return requestJson({
    path: '/users/me/lists',
    token,
    fallbackMessage: 'Unable to load lists',
  });
};

export const getListById = async (id, token) => {
  return requestJson({
    path: `/users/me/lists/${id}`,
    token,
    fallbackMessage: 'Unable to load list details',
  });
};

export const createList = async ({ name, isPublic = false }, token) => {
  return requestJson({
    path: '/users/me/lists',
    method: 'POST',
    body: { name, isPublic },
    token,
    fallbackMessage: 'Unable to create list',
  });
};

export const addTrailToList = async (listId, trailId, token) => {
  await requestJson({
    path: `/users/me/lists/${listId}/trails/${trailId}`,
    method: 'POST',
    token,
    fallbackMessage: 'Unable to add trail to list',
  });
};

export const removeTrailFromList = async (listId, trailId, token) => {
  await requestJson({
    path: `/users/me/lists/${listId}/trails/${trailId}`,
    method: 'DELETE',
    token,
    fallbackMessage: 'Unable to remove trail from list',
  });
};
