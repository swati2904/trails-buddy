// Map.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  // Define the coordinates for the map center (e.g., San Francisco)
  const position = [37.7749, -122.4194];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      {/* Tile layer: OpenStreetMap tiles */}
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Add a marker to the map */}
      <Marker position={position}>
        <Popup>San Francisco</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
