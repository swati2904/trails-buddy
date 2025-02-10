import axios from 'axios';
import { DEFAULT_BBOX } from '../constants/config';

const API_URL = 'https://overpass-api.de/api/interpreter';

const fetchTrailNodes = async (nodeIds) => {
  const response = await axios.get(API_URL, {
    params: {
      data: `[out:json]; node(id:${nodeIds}); out body;`,
    },
  });
  return response.data.elements;
};

const processTrailData = async (elements) => {
  return Promise.all(
    elements.map(async (trail) => {
      if (!trail.nodes) return null;

      const nodes = await fetchTrailNodes(trail.nodes.join(','));
      const latlngs = nodes.map((node) => [node.lat, node.lon]);

      return {
        id: trail.id,
        latlngs,
        name: trail.tags.name || 'Unnamed Trail',
        difficulty: trail.tags.sac_scale || 'Unknown',
        length: trail.tags.length || 'N/A',
        bicycle: trail.tags.bicycle || 'No',
        dog: trail.tags.dog || 'No',
        highway: trail.tags.highway || 'N/A',
        trail_visibility: trail.tags.trail_visibility || 'N/A',
        elevation_grade: trail.tags.elevation_grade || 'N/A',
        total_distance: trail.tags.total_distance || 'N/A',
      };
    })
  );
};

export const fetchTrails = async (bbox = DEFAULT_BBOX) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        data: `
          [out:json];
          way["highway"="path"]["sac_scale"](${bbox});
          out body;
        `,
      },
    });

    if (!response.data?.elements) return [];
    return (await processTrailData(response.data.elements)).filter(Boolean);
  } catch (error) {
    console.error('Error fetching trails:', error);
    return [];
  }
};
