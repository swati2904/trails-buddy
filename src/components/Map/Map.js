import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Route, Routes } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import TrailPage from '../Trail/TrailPage';
import GetLocationButton from '../Location/GetLocationButton';
import SetMapCenter from './SetMapCenter';
import { Picker, Item, Flex, View } from '@adobe/react-spectrum';

const Map = () => {
  const [trailData, setTrailData] = useState([]);
  const [filteredTrails, setFilteredTrails] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState('');
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);

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

  const handleDifficultyFilter = (value) => {
    setSelectedDifficulty(value);
  };

  const handleTrailClick = (trail) => {
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
    <View height='100vh' width='100%'>
      <Routes>
        <Route
          path='/trail/:id'
          element={<TrailPage trailData={trailData} />}
        />
        <Route
          path='/'
          element={
            <View height='100%' width='100%' position='relative'>
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

              <Flex
                position='absolute'
                top='10px'
                left='60px'
                zIndex={1000}
                gap='10px'
              >
                <Picker
                  label='Filter by Difficulty'
                  selectedKey={selectedDifficulty}
                  onSelectionChange={handleDifficultyFilter}
                  width='size-2000'
                >
                  <Item key=''>Show All</Item>
                  <Item key='hiking'>Easy</Item>
                  <Item key='mountain_hiking'>Moderate</Item>
                  <Item key='demanding_mountain_hiking'>Hard</Item>
                </Picker>
                <GetLocationButton
                  setUserLocation={setUserLocation}
                  setMapCenter={setMapCenter}
                  setUserLocationName={setUserLocationName}
                />
              </Flex>
            </View>
          }
        />
      </Routes>
    </View>
  );
};

export default Map;
