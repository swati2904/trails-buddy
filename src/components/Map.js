import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Route, Routes } from 'react-router-dom';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import TrailPage from './TrailPage';
import TrailMap from './TrailMap';
import FilterAndLocation from './FilterAndLocation';

const Map = () => {
  const [trailData, setTrailData] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState('');
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);
  const [selectedTrail, setSelectedTrail] = useState(null);

  const navigate = useNavigate();

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
          setFilteredTrails(validTrails);
        }
      })
      .catch((error) => {
        console.error('Error fetching data from Overpass API', error);
      });
  }, []);

  useEffect(() => {
    if (trailData.length === 0) {
      return;
    }

    let filtered = trailData;

    if (selectedDifficulty) {
      filtered = filtered.filter(
        (trail) => trail.difficulty === selectedDifficulty
      );
    }

    setFilteredTrails(filtered);
  }, [selectedDifficulty, trailData]);

  const handleDifficultyFilter = (event) => {
    setSelectedDifficulty(event.target.value);
  };

  const handleTrailClick = (trail) => {
    setSelectedTrail(trail);
    navigate(`/trail/${trail.id}`);
  };

  const userLocationIcon = new L.Icon({
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const easyIcon = new L.DivIcon({
    html: '<div style="background-color: green; width: 20px; height: 20px;"></div>',
  });

  const moderateIcon = new L.DivIcon({
    html: '<div style="background-color: orange; width: 20px; height: 20px; border-radius: 50%;"></div>',
  });

  const hardIcon = new L.DivIcon({
    html: '<div style="width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 20px solid red;"></div>',
  });

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Routes>
        <Route
          path='/trail/:id'
          element={<TrailPage trailData={trailData} />}
        />
        <Route
          path='/'
          element={
            <div
              style={{ height: '100%', width: '100%', position: 'relative' }}
            >
              <TrailMap
                mapCenter={mapCenter}
                userLocation={userLocation}
                userLocationIcon={userLocationIcon}
                userLocationName={userLocationName}
                filteredTrails={filteredTrails}
                handleTrailClick={handleTrailClick}
                easyIcon={easyIcon}
                moderateIcon={moderateIcon}
                hardIcon={hardIcon}
              />
              <FilterAndLocation
                handleDifficultyFilter={handleDifficultyFilter}
                selectedDifficulty={selectedDifficulty}
                setUserLocation={setUserLocation}
                setMapCenter={setMapCenter}
                setUserLocationName={setUserLocationName}
              />
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default Map;
