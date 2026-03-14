import { requestJson, USE_MOCK_API } from './http';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const signIn = async ({ email, password }) => {
  if (!USE_MOCK_API) {
    return requestJson({
      path: '/auth/signin',
      method: 'POST',
      body: { email, password },
      fallbackMessage: 'Unable to sign in',
    });
  }

  await sleep(120);
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  return {
    user: {
      id: 'usr_local',
      email,
      displayName: email.split('@')[0],
    },
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    },
  };
};

export const signUp = async ({ email, password, displayName }) => {
  if (!USE_MOCK_API) {
    return requestJson({
      path: '/auth/signup',
      method: 'POST',
      body: { email, password, displayName },
      fallbackMessage: 'Unable to create account',
    });
  }

  await sleep(140);
  if (!email || !password || !displayName) {
    throw new Error('Email, password, and display name are required.');
  }

  return {
    user: {
      id: 'usr_new',
      email,
      displayName,
    },
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    },
  };
};
