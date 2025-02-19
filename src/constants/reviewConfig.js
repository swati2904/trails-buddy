import { ICONS } from './icons';

export const REVIEW_CONFIG = {
  ratingOptions: {
    1: [
      { id: 0, label: 'Trail closed' },
      { id: 1, label: 'Private property' },
      { id: 2, label: 'Poor conditions' },
      { id: 3, label: 'Wrong directions' },
      { id: 4, label: 'No bathrooms' },
    ],
    2: [
      { id: 0, label: 'Trail closed' },
      { id: 1, label: 'Private property' },
      { id: 2, label: 'Poor conditions' },
      { id: 3, label: 'Wrong directions' },
      { id: 4, label: 'No bathrooms' },
    ],
    3: [
      { id: 0, label: 'Crowded' },
      { id: 1, label: 'Hard to park' },
      { id: 2, label: 'Fair conditions' },
      { id: 3, label: 'No bathrooms' },
    ],
    4: [
      { id: 0, label: 'Good conditions' },
      { id: 1, label: 'Easy to park' },
      { id: 2, label: 'Not crowded' },
      { id: 3, label: 'Bathrooms available' },
      { id: 4, label: 'Dog-friendly' },
    ],
    5: [
      { id: 0, label: 'Good conditions' },
      { id: 1, label: 'Easy to park' },
      { id: 2, label: 'Not crowded' },
      { id: 3, label: 'Bathrooms available' },
      { id: 4, label: 'Dog-friendly' },
    ],
  },

  difficulty: [
    { id: 0, label: 'Easy', icon: ICONS.DIFFICULTY.EASY },
    { id: 1, label: 'Moderate', icon: ICONS.DIFFICULTY.MODERATE },
    { id: 2, label: 'Hard', icon: ICONS.DIFFICULTY.HARD },
    { id: 3, label: 'Strenuous' },
  ],

  access: [
    { id: 0, label: 'Permit required' },
    { id: 1, label: 'Entry fee' },
  ],

  parkingCost: [
    { id: 0, label: 'Free parking' },
    { id: 1, label: 'Paid parking' },
  ],

  parkingSize: [
    { id: 0, label: 'Small (<10 spots)', icon: ICONS.AMENITIES.CAR },
    { id: 1, label: 'Medium (10-20 spots)', icon: ICONS.AMENITIES.CAR },
    { id: 2, label: 'Large (>30 spots)', icon: ICONS.AMENITIES.CAR },
  ],

  conditions: [
    { id: 0, label: 'Muddy', icon: ICONS.CONDITIONS.MUD },
    { id: 1, label: 'Buggy', icon: ICONS.CONDITIONS.BUGS },
    { id: 2, label: 'Dusty', icon: ICONS.CONDITIONS.DUST },
    { id: 3, label: 'Snowy', icon: ICONS.CONDITIONS.SNOW },
    { id: 4, label: 'Icy', icon: ICONS.CONDITIONS.ICE },
    { id: 5, label: 'Pollen', icon: ICONS.CONDITIONS.POLLEN },
    { id: 6, label: 'Obstructions', icon: ICONS.CONDITIONS.OBSTACLES },
    { id: 7, label: 'Overgrown', icon: ICONS.CONDITIONS.OVERGROWN },
    { id: 8, label: 'Poor air quality', icon: ICONS.CONDITIONS.AIR_QUALITY },
    { id: 9, label: 'Trash on trail', icon: ICONS.CONDITIONS.TRASH },
    { id: 10, label: 'Poisonous plants', icon: ICONS.CONDITIONS.POISON },
  ],

  activities: [
    { id: 0, label: 'Backpacking', icon: ICONS.ACTIVITIES.BACKPACKING },
    { id: 1, label: 'Birding', icon: ICONS.ACTIVITIES.BIRDING },
    { id: 2, label: 'Bike touring', icon: ICONS.ACTIVITIES.BIKE_TOURING },
    { id: 3, label: 'Scenic driving', icon: ICONS.ACTIVITIES.SCENIC_DRIVING },
    {
      id: 4,
      label: 'Cross-country skiing',
      icon: ICONS.ACTIVITIES.CROSS_COUNTRY_SKIING,
    },
    { id: 5, label: 'Fishing', icon: ICONS.ACTIVITIES.FISHING },
    { id: 6, label: 'Hiking', icon: ICONS.ACTIVITIES.HIKING },
    {
      id: 7,
      label: 'Horseback riding',
      icon: ICONS.ACTIVITIES.HORSEBACK_RIDING,
    },
    { id: 8, label: 'Mountain biking', icon: ICONS.ACTIVITIES.MOUNTAIN_BIKING },
    {
      id: 9,
      label: 'Off-road driving',
      icon: ICONS.ACTIVITIES.OFF_ROAD_DRIVING,
    },
    { id: 10, label: 'Paddle sports', icon: ICONS.ACTIVITIES.PADDLE_SPORTS },
    { id: 11, label: 'Road biking', icon: ICONS.ACTIVITIES.ROAD_BIKING },
    { id: 12, label: 'Rock climbing', icon: ICONS.ACTIVITIES.ROCK_CLIMBING },
    { id: 13, label: 'Running', icon: ICONS.ACTIVITIES.RUNNING },
    { id: 14, label: 'Walking', icon: ICONS.ACTIVITIES.WALKING },
    { id: 15, label: 'Skiing', icon: ICONS.ACTIVITIES.SKIING },
    { id: 16, label: 'Snowshoeing', icon: ICONS.ACTIVITIES.SNOWSHOEING },
    { id: 17, label: 'Via ferrata', icon: ICONS.ACTIVITIES.VIA_FERRATA },
  ],
};
