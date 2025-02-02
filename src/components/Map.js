import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const [trailData, setTrailData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const position = [37.7749, -122.4194]; // Default: San Francisco

  useEffect(() => {
    const bbox = [37.6, -123, 37.9, -122]; // [lat_min, lon_min, lat_max, lon_max]

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
        console.log('Data fetched from Overpass API', response.data);
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
                };
              }
              console.log('Trail has no nodes:', trail);
              return null;
            })
          );
          const validTrails = trails.filter((trail) => trail !== null);
          console.log('Processed trail data:', validTrails);
          setTrailData(validTrails);
          setFilteredTrails(validTrails);
        } else {
          console.error('Unexpected response format', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching data from Overpass API', error);
      });
  }, []);

  useEffect(() => {
    if (trailData.length === 0) {
      console.log('No trail data available yet.');
      return;
    }

    console.log(
      'Filtering trails with searchTerm:',
      searchTerm,
      'and selectedDifficulty:',
      selectedDifficulty
    );
    console.log('Trail Data:', trailData);

    let filtered = trailData;

    if (searchTerm) {
      filtered = filtered.filter((trail) =>
        trail.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(
        (trail) => trail.difficulty === selectedDifficulty
      );
    }

    console.log('Filtered Trails:', filtered);
    setFilteredTrails(filtered);
  }, [searchTerm, selectedDifficulty, trailData]);

  const handleDifficultyFilter = (difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation([position.coords.latitude, position.coords.longitude]);
    });
  };

  return (
    <div style={{ padding: '10px' }}>
      <h1>Interactive Hiking Trails Map</h1>

      {/* Search Bar */}
      <div>
        <input
          type='text'
          placeholder='Search for trails'
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
      </div>

      {/* Filter Buttons */}
      <div>
        <button onClick={() => handleDifficultyFilter('hiking')}>Easy</button>
        <button onClick={() => handleDifficultyFilter('mountain_hiking')}>
          Moderate
        </button>
        <button
          onClick={() => handleDifficultyFilter('demanding_mountain_hiking')}
        >
          Hard
        </button>
        <button onClick={() => handleDifficultyFilter(null)}>Show All</button>
      </div>

      <button onClick={handleGetLocation}>Get My Location</button>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '80vh', width: '100%' }}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {userLocation && (
          <Marker position={userLocation}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}

        {filteredTrails.map((trail) => (
          <Polyline key={trail.id} positions={trail.latlngs} color='blue'>
            <Popup>
              <strong>{trail.name}</strong>
              <br />
              Difficulty: {trail.difficulty}
              <br />
              Length: {trail.length}
              <br />
            </Popup>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
