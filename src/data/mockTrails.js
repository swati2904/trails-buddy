export const mockTrails = [
  {
    id: 'trl_1001',
    slug: 'eagle-ridge-loop',
    name: 'Eagle Ridge Loop',
    location: 'Denver, Colorado',
    difficulty: 'moderate',
    activity: ['hiking', 'trail-running'],
    distanceKm: 8.6,
    elevationGainM: 420,
    rating: 4.7,
    reviewCount: 393,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    summary: 'Scenic loop with mixed forest and ridge views.',
    routeType: 'loop',
    durationMin: 180,
    map: {
      bounds: [-105.0, 39.7, -104.93, 39.77],
      start: { lat: 39.73, lon: -104.97 },
    },
    conditions: ['Muddy near mile 2', 'Clear past ridge'],
  },
  {
    id: 'trl_1002',
    slug: 'pinyon-canyon-out-and-back',
    name: 'Pinyon Canyon Out And Back',
    location: 'Boulder, Colorado',
    difficulty: 'hard',
    activity: ['hiking'],
    distanceKm: 13.2,
    elevationGainM: 760,
    rating: 4.8,
    reviewCount: 241,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
    summary: 'Steep climb with exposed ridgeline and canyon overlook.',
    routeType: 'out-and-back',
    durationMin: 310,
    map: {
      bounds: [-105.34, 40.0, -105.19, 40.08],
      start: { lat: 40.03, lon: -105.28 },
    },
    conditions: ['Rocky switchbacks', 'Windy afternoons'],
  },
  {
    id: 'trl_1003',
    slug: 'cedar-creek-family-loop',
    name: 'Cedar Creek Family Loop',
    location: 'Fort Collins, Colorado',
    difficulty: 'easy',
    activity: ['hiking', 'bike'],
    distanceKm: 4.1,
    elevationGainM: 120,
    rating: 4.4,
    reviewCount: 114,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1200&q=80',
    summary: 'Gentle creekside loop with wildflowers and picnic spots.',
    routeType: 'loop',
    durationMin: 95,
    map: {
      bounds: [-105.15, 40.51, -105.03, 40.6],
      start: { lat: 40.56, lon: -105.1 },
    },
    conditions: ['Packed dirt', 'Good shade coverage'],
  },
  {
    id: 'trl_1004',
    slug: 'alpine-lake-point-to-point',
    name: 'Alpine Lake Point To Point',
    location: 'Estes Park, Colorado',
    difficulty: 'moderate',
    activity: ['hiking'],
    distanceKm: 10.4,
    elevationGainM: 510,
    rating: 4.6,
    reviewCount: 187,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1464822759844-d150ad6d1d95?auto=format&fit=crop&w=1200&q=80',
    summary: 'Lake-to-lake alpine route with broad valley viewpoints.',
    routeType: 'point-to-point',
    durationMin: 245,
    map: {
      bounds: [-105.63, 40.26, -105.48, 40.34],
      start: { lat: 40.29, lon: -105.56 },
    },
    conditions: ['Snow patches above 3000m'],
  },
];

export const mockParks = [
  {
    id: 'prk_31',
    slug: 'rocky-mountain-national-park',
    name: 'Rocky Mountain National Park',
    summary: 'Popular alpine park with lakes and high elevation routes.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    trailCount: 215,
    topTrails: ['eagle-ridge-loop', 'alpine-lake-point-to-point'],
  },
];

export const mockReviewsByTrailId = {
  trl_1001: [
    {
      id: 'rvw_1',
      user: { id: 'usr_15', displayName: 'Ava' },
      rating: 5,
      comment: 'Great sunrise light and very clear route markers.',
      condition: 'good',
      activity: 'hiking',
      createdAt: '2026-03-13T19:00:00.000Z',
    },
    {
      id: 'rvw_2',
      user: { id: 'usr_33', displayName: 'Marco' },
      rating: 4,
      comment: 'A little muddy in the lower section but still excellent.',
      condition: 'mixed',
      activity: 'hiking',
      createdAt: '2026-03-11T16:00:00.000Z',
    },
  ],
};
