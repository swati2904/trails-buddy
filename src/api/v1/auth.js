import { requestJson } from './http';

const normalizeAuthPayload = (response) => {
  const source =
    response?.data && typeof response.data === 'object'
      ? response.data
      : response;

  const tokens =
    source?.tokens && typeof source.tokens === 'object' ? source.tokens : null;

  return {
    ...source,
    tokens,
  };
};

export const signIn = async ({ email, password }) => {
  const response = await requestJson({
    path: '/auth/signin',
    method: 'POST',
    body: { email, password },
    fallbackMessage: 'Unable to sign in',
  });

  return normalizeAuthPayload(response);
};

export const signUp = async ({ email, password, displayName }) => {
  const response = await requestJson({
    path: '/auth/signup',
    method: 'POST',
    body: { email, password, displayName },
    fallbackMessage: 'Unable to create account',
  });

  return normalizeAuthPayload(response);
};

export const refreshSession = async ({ refreshToken }) => {
  return requestJson({
    path: '/auth/refresh',
    method: 'POST',
    body: { refreshToken },
    fallbackMessage: 'Unable to refresh authentication session',
  });
};

export const signOut = async ({ refreshToken } = {}, token) => {
  return requestJson({
    path: '/auth/signout',
    method: 'POST',
    token,
    body: refreshToken ? { refreshToken } : undefined,
    fallbackMessage: 'Unable to sign out',
  });
};
