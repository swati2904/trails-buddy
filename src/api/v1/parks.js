import { mockParks, mockTrails } from '../../data/mockTrails';
import { requestJson, USE_MOCK_API } from './http';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getParkBySlug = async (slug) => {
  if (!USE_MOCK_API) {
    return requestJson({
      path: `/parks/${slug}`,
      fallbackMessage: 'Unable to load park details',
    });
  }

  await sleep(90);
  const park = mockParks.find((item) => item.slug === slug);
  if (!park) {
    return null;
  }

  const topTrails = park.topTrails
    .map((trailSlug) => mockTrails.find((trail) => trail.slug === trailSlug))
    .filter(Boolean)
    .map((trail) => ({
      id: trail.id,
      slug: trail.slug,
      name: trail.name,
      difficulty: trail.difficulty,
      rating: trail.rating,
    }));

  return {
    id: park.id,
    slug: park.slug,
    name: park.name,
    summary: park.summary,
    heroImageUrl: park.heroImageUrl,
    trailCount: park.trailCount,
    topTrails,
  };
};
