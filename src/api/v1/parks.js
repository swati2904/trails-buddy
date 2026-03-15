import { requestJson } from './http';

export const getParkBySlug = async (slug) => {
  return requestJson({
    path: `/parks/${slug}`,
    fallbackMessage: 'Unable to load park details',
  });
};
