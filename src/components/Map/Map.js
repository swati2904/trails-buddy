import React, { useState, useContext } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import { View, Flex } from '@adobe/react-spectrum';
import { UserLocationContext } from '../../contexts/UserLocationContext';
import { TrailDataContext } from '../../contexts/TrailDataContext';
import { DIFFICULTY_ICONS, USER_LOCATION_ICON } from '../../constants/icons';
import SetMapCenter from '../Common/MapElements/SetMapCenter';
import TrailMarkers from '../Common/MapElements/TrailMarkers';
import DifficultyFilter from '../Common/MapControls/DifficultyFilter';
import LocationButton from '../Common/MapControls/LocationButton';
import { MAP_CENTER, MAP_ZOOM } from '../../constants/config';

const Map = () => {
  const navigate = useNavigate();
  const { trailData } = useContext(TrailDataContext);
  const { userLocation, userLocationName, mapCenter } =
    useContext(UserLocationContext);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const filteredTrails = trailData.filter(
    (trail) => !selectedDifficulty || trail.difficulty === selectedDifficulty
  );

  return (
    <View height='100vh' width='100%' position='relative'>
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        style={{ height: '100%', width: '100%' }}
      >
        <SetMapCenter center={mapCenter} />
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <TrailMarkers
          trails={filteredTrails}
          difficultyIcons={DIFFICULTY_ICONS}
          navigate={navigate}
        />

        {userLocation && (
          <Marker position={userLocation} icon={USER_LOCATION_ICON}>
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
      </MapContainer>

      <Flex position='absolute' top='10px' left='60px' zIndex={1000} gap='10px'>
        <DifficultyFilter
          selected={selectedDifficulty}
          onChange={setSelectedDifficulty}
        />
        <LocationButton />
      </Flex>
    </View>
  );
};

export default Map;
