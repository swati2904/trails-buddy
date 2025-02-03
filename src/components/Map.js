// filepath: /D:/swati/trails-buddy/src/components/Map.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Route, Routes } from 'react-router-dom';
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
import TrailDetailsModal from './TrailDetailsModal';
import SelectedTrailMap from './SelectedTrailMap';
import TrailPage from './TrailPage';

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
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState('');
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSelectedTrailMap, setShowSelectedTrailMap] = useState(false);

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

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLoc = [position.coords.latitude, position.coords.longitude];
      setUserLocation(userLoc);
      setMapCenter(userLoc);

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

  const easyIcon = new L.DivIcon({
    html: '<div style="background-color: green; width: 20px; height: 20px;"></div>',
  });

  const moderateIcon = new L.DivIcon({
    html: '<div style="background-color: orange; width: 20px; height: 20px; border-radius: 50%;"></div>',
  });

  const hardIcon = new L.DivIcon({
    html: '<div style="width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-bottom: 20px solid red;"></div>',
  });

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
    navigate(`/trail/${trail.id}`);
  };

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
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
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
                        <Link to={`/trail/${trail.id}`}>
                          <strong>{trail.name}</strong>
                        </Link>
                        <br />
                        Difficulty: {trail.difficulty}
                        <br />
                        Length: {trail.length}
                      </Popup>
                      {icon && (
                        <Marker position={trail.latlngs[0]} icon={icon}>
                          <Popup>
                            <Link to={`/trail/${trail.id}`}>
                              <strong>{trail.name}</strong>
                            </Link>
                            <br />
                            Difficulty: {trail.difficulty}
                            <br />
                            Length: {trail.length}
                          </Popup>
                        </Marker>
                      )}
                    </Polyline>
                  );
                })}
              </MapContainer>

              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '60px',
                  zIndex: 1000,
                }}
              >
                <select
                  onChange={handleDifficultyFilter}
                  value={selectedDifficulty}
                  style={{
                    width: '200px',
                    height: '40px',
                    borderRadius: '10px',
                    padding: '5px',
                    fontSize: '16px',
                  }}
                >
                  <option value=''>Show All</option>
                  <option value='hiking'>Easy</option>
                  <option value='mountain_hiking'>Moderate</option>
                  <option value='demanding_mountain_hiking'>Hard</option>
                </select>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default Map;
