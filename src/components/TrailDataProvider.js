import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const TrailDataContext = React.createContext();

const TrailDataProvider = ({ children }) => {
  const [trailData, setTrailData] = useState([]);

  useEffect(() => {
    const bbox = [37.6, -123, 37.9, -122];

    axios
      .get('https://overpass-api.de/api/interpreter', {
        params: {
          data: `
            [out:json];
            (
              way["highway"="path"]["sac_scale"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
            );
            out body;
          `,
        },
      })
      .then(async (response) => {
        if (response.data && response.data.elements) {
          const trails = await Promise.all(
            response.data.elements.map(async (trail) => {
              if (trail.nodes) {
                const nodeIds = trail.nodes.join(',');
                const nodeResponse = await axios.get(
                  'https://overpass-api.de/api/interpreter',
                  {
                    params: {
                      data: `
                      [out:json];
                      node(id:${nodeIds});
                      out body;
                    `,
                    },
                  }
                );
                const nodes = nodeResponse.data.elements;
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
              }
              return null;
            })
          );
          const validTrails = trails.filter((trail) => trail !== null);
          setTrailData(validTrails);
        }
      })
      .catch((error) => {
        console.error('Error fetching data from Overpass API', error);
      });
  }, []);

  return (
    <TrailDataContext.Provider value={trailData}>
      {children}
    </TrailDataContext.Provider>
  );
};

export default TrailDataProvider;
