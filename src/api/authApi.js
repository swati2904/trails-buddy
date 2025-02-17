import client from './client';

export const loginUser = async (credentials) => {
  try {
    const response = await client.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const signupUser = async (userData) => {
  try {
    const response = await client.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
