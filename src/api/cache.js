const cache = {
  get: (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set: (key, value, ttl = 3600000) => {
    // 1 hour default
    const item = {
      value,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
};

export const cachedFetch = async (key, fn, ttl = 3600000) => {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }
  const data = await fn();
  cache.set(key, data, ttl);
  return data;
};
