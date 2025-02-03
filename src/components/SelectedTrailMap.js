import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Tooltip,
  Marker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FitBounds = ({ trail }) => {
  const map = useMap();

  useEffect(() => {
    if (trail && trail.latlngs.length > 0) {
      const bounds = trail.latlngs.map((latlng) => [latlng[0], latlng[1]]);
      map.fitBounds(bounds);
    }
  }, [trail, map]);

  return null;
};

const SelectedTrailMap = ({ trail }) => {
  const startIcon = new L.DivIcon({
    html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%;"></div>',
  });

  const endIcon = new L.DivIcon({
    html: '<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%;"></div>',
  });

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={trail.latlngs[0]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline positions={trail.latlngs} color='green' weight={8}>
          <Tooltip>{trail.name}</Tooltip>
        </Polyline>
        <Marker position={trail.latlngs[0]} icon={startIcon}>
          <Tooltip>Start Point</Tooltip>
        </Marker>
        <Marker
          position={trail.latlngs[trail.latlngs.length - 1]}
          icon={endIcon}
        >
          <Tooltip>End Point</Tooltip>
        </Marker>
        <FitBounds trail={trail} />
      </MapContainer>
    </div>
  );
};

export default SelectedTrailMap;
