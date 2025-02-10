import React from 'react';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
} from 'react-leaflet';
import { START_ICON, END_ICON } from '../../../constants/icons';
import FitBounds from './FitBounds';

const SelectedTrailMap = ({ trail }) => {
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
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
        <Marker position={trail.latlngs[0]} icon={START_ICON}>
          <Tooltip>Start Point</Tooltip>
        </Marker>
        <Marker
          position={trail.latlngs[trail.latlngs.length - 1]}
          icon={END_ICON}
        >
          <Tooltip>End Point</Tooltip>
        </Marker>
        <FitBounds trail={trail} />
      </MapContainer>
    </div>
  );
};

export default SelectedTrailMap;
