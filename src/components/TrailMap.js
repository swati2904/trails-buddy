import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet';
import { Link } from 'react-router-dom';
import SetMapCenter from './SetMapCenter';

const TrailMap = ({
  mapCenter,
  userLocation,
  userLocationIcon,
  userLocationName,
  filteredTrails,
  handleTrailClick,
  easyIcon,
  moderateIcon,
  hardIcon,
}) => {
  return (
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
  );
};

export default TrailMap;
