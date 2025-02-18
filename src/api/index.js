import axios from 'axios';

const api = axios.create({
  timeout: 30000, // 30 seconds timeout
});

// Rate limit interceptor
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'] || 5;
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return api.request(error.config);
  }
  return Promise.reject(error);
});

export default api;
