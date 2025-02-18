// import axios from 'axios';
import { DEFAULT_BBOX } from '../constants/config';
import api from '../api'; // Use our custom axios instance
import { cachedFetch } from '../api/cache';

const API_URL = 'https://overpass-api.de/api/interpreter';

export const fetchTrails = async (bbox = DEFAULT_BBOX) => {
  const cacheKey = `trails-${bbox.join('-')}`;

  return cachedFetch(
    cacheKey,
    async () => {
      const query = `
      [out:json][timeout:25];
      way["highway"="path"]["sac_scale"](${bbox});
      (._;>;);
      out body;
    `;

      try {
        const response = await api.post(
          API_URL,
          `data=${encodeURIComponent(query)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        return processTrailData(response.data.elements);
      } catch (error) {
        console.error('Error fetching trails:', error);
        return [];
      }
    },
    3600000
  ); // Cache for 1 hour
};

const processTrailData = (elements) => {
  const nodesMap = elements.reduce((acc, el) => {
    if (el.type === 'node') acc[el.id] = [el.lat, el.lon];
    return acc;
  }, {});

  return elements
    .filter((el) => el.type === 'way')
    .map((way) => ({
      id: way.id,
      latlngs: way.nodes.map((id) => nodesMap[id]).filter(Boolean),
      name: way.tags.name || 'Unnamed Trail',
      difficulty: way.tags.sac_scale || 'Unknown',
      length: way.tags.length || 'N/A',
      bicycle: way.tags.bicycle || 'No',
      dog: way.tags.dog || 'No',
      highway: way.tags.highway || 'N/A',
      trail_visibility: way.tags.trail_visibility || 'N/A',
      elevation_grade: way.tags.elevation_grade || 'N/A',
      total_distance: way.tags.total_distance || 'N/A',
    }))
    .filter((trail) => trail.latlngs.length > 0);
};

// export const fetchTrails = async (bbox = DEFAULT_BBOX) => {
//   try {
//     const response = await axios.get(API_URL, {
//       params: {
//         data: `
//           [out:json];
//           way["highway"="path"]["sac_scale"](${bbox});
//           out body;
//         `,
//       },
//     });

//     if (!response.data?.elements) return [];
//     return (await processTrailData(response.data.elements)).filter(Boolean);
//   } catch (error) {
//     console.error('Error fetching trails:', error);
//     return [];
//   }
// };
