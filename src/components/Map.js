import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import TrailDetailsModal from './TrailDetailsModal'; // Import the new modal component

// Custom hook to update the map center
const SetMapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const Map = () => {
  const [trailData, setTrailData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState('');
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default: San Francisco
  const [selectedTrail, setSelectedTrail] = useState(null); // State to store the selected trail
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility

  useEffect(() => {
    const bbox = [37.6, -123, 37.9, -122]; // Adjusted bounding box to cover a specific area

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
                  bicycle: trail.tags.bicycle || 'No',
                  dog: trail.tags.dog || 'No',
                  highway: trail.tags.highway || 'N/A',
                  trail_visibility: trail.tags.trail_visibility || 'N/A',
                  elevation_grade: trail.tags.elevation_grade || 'N/A',
                  total_distance: trail.tags.total_distance || 'N/A',
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
    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLoc = [position.coords.latitude, position.coords.longitude];
      setUserLocation(userLoc);
      setMapCenter(userLoc);

      // Reverse geocode to get location name
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            format: 'json',
          },
        }
      );
      const locationName = response.data.display_name;
      setUserLocationName(locationName);
    });
  };

  // Custom icons for different difficulty levels
  const easyIcon = new L.DivIcon({
    html: '<div style="background-color: green; width: 20px; height: 20px;"></div>',
  });

  const moderateIcon = new L.DivIcon({
    html: '<div style="background-color: orange; width: 20px; height: 20px; border-radius: 50%;"></div>',
  });

  const hardIcon = new L.DivIcon({
    html: '<div style="width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 20px solid red;"></div>',
  });

  // Custom icon for user location
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

  const handleTrailClick = (trail) => {
    setSelectedTrail(trail);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: isModalOpen ? 0.7 : 1, transition: 'flex 0.3s' }}>
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
          center={mapCenter}
          zoom={13}
          style={{ height: '80vh', width: '100%' }}
        >
          <SetMapCenter center={mapCenter} />
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {userLocation && (
            <Marker position={userLocation} icon={userLocationIcon}>
              <Popup>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      backgroundColor: 'blue',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      marginRight: '5px',
                    }}
                  ></div>
                  <span>{userLocationName}</span>
                </div>
              </Popup>
            </Marker>
          )}

          {filteredTrails.map((trail) => {
            let icon;
            switch (trail.difficulty) {
              case 'hiking':
                icon = easyIcon;
                break;
              case 'mountain_hiking':
                icon = moderateIcon;
                break;
              case 'demanding_mountain_hiking':
                icon = hardIcon;
                break;
              default:
                icon = null;
            }

            return (
              <Polyline
                key={trail.id}
                positions={trail.latlngs}
                color='blue'
                eventHandlers={{
                  click: () => handleTrailClick(trail),
                }}
              >
                <Popup>
                  <strong>{trail.name}</strong>
                  <br />
                  Difficulty: {trail.difficulty}
                  <br />
                  Length: {trail.length}
                  <br />
                  <button onClick={() => handleTrailClick(trail)}>
                    View Details
                  </button>
                </Popup>
                {icon && (
                  <Marker position={trail.latlngs[0]} icon={icon}>
                    <Popup>
                      <strong>{trail.name}</strong>
                      <br />
                      Difficulty: {trail.difficulty}
                      <br />
                      Length: {trail.length}
                      <br />
                      <button onClick={() => handleTrailClick(trail)}>
                        View Details
                      </button>
                    </Popup>
                  </Marker>
                )}
              </Polyline>
            );
          })}
        </MapContainer>
      </div>

      {isModalOpen && (
        <div style={{ flex: 0.3, padding: '10px', overflowY: 'auto' }}>
          <TrailDetailsModal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            trail={selectedTrail}
          />
        </div>
      )}
    </div>
  );
};

export default Map;
