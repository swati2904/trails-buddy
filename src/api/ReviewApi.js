import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const reviewUser = async (reviewData, token) => {
  try {
    const response = await axios.post(`${API_URL}/comments`, reviewData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Request data:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw new Error('Network error or server is not responding');
  }
};

export const fetchComments = async (trailId) => {
  try {
    const response = await axios.get(`${API_URL}/comments/431428080`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};
