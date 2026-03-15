import { requestJson } from './http';

export const signIn = async ({ email, password }) => {
  return requestJson({
    path: '/auth/signin',
    method: 'POST',
    body: { email, password },
    fallbackMessage: 'Unable to sign in',
  });
};

export const signUp = async ({ email, password, displayName }) => {
  return requestJson({
    path: '/auth/signup',
    method: 'POST',
    body: { email, password, displayName },
    fallbackMessage: 'Unable to create account',
  });
};

export const refreshSession = async ({ refreshToken }) => {
  return requestJson({
    path: '/auth/refresh',
    method: 'POST',
    body: { refreshToken },
    fallbackMessage: 'Unable to refresh authentication session',
  });
};
