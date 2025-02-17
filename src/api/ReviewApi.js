import client from './client';

export const reviewUser = async (reviewData, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const response = await client.post('/comments', reviewData, { headers });
    return response.data;
  } catch (error) {
    throw new Error('Network error or server is not responding');
  }
};

export const fetchComments = async (trailId) => {
  try {
    const response = await client.get(`/comments/${trailId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};
