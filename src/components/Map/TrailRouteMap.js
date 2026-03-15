import React, { useMemo } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer } from 'react-leaflet';

const DEFAULT_CENTER = [39.7392, -104.9903];

const isFiniteNumber = (value) => Number.isFinite(Number(value));

const normalizeCoordinate = (coordinate) => {
  if (!coordinate) {
    return null;
  }

  if (Array.isArray(coordinate) && coordinate.length >= 2) {
    const lat = Number(coordinate[0]);
    const lon = Number(coordinate[1]);
    if (isFiniteNumber(lat) && isFiniteNumber(lon)) {
      return [lat, lon];
    }
  }

  const lat = coordinate.lat ?? coordinate.latitude;
  const lon = coordinate.lon ?? coordinate.lng ?? coordinate.longitude;
  if (isFiniteNumber(lat) && isFiniteNumber(lon)) {
    return [Number(lat), Number(lon)];
  }

  return null;
};

const normalizeRouteCoordinates = (routeCoordinates) => {
  if (!Array.isArray(routeCoordinates)) {
    return [];
  }

  return routeCoordinates.map(normalizeCoordinate).filter(Boolean);
};

const buildFallbackRoute = (startCoordinate) => {
  const start = normalizeCoordinate(startCoordinate);
  if (!start) {
    return [];
  }

  const [lat, lon] = start;
  return [
    [lat, lon],
    [lat + 0.01, lon + 0.015],
    [lat + 0.018, lon + 0.005],
    [lat + 0.01, lon - 0.015],
    [lat, lon],
  ];
};

const TrailRouteMap = ({ trail }) => {
  const start = normalizeCoordinate(trail?.location?.start);

  const route = useMemo(() => {
    const parsed = normalizeRouteCoordinates(trail?.map?.routeCoordinates);
    if (parsed.length >= 2) {
      return parsed;
    }

    return buildFallbackRoute(start);
  }, [start, trail?.map?.routeCoordinates]);

  const center = route[0] || start || DEFAULT_CENTER;

  return (
    <div className='map-panel'>
      <MapContainer center={center} zoom={12} scrollWheelZoom className='leaflet-map'>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {route.length >= 2 ? (
          <Polyline
            positions={route}
            pathOptions={{ color: '#ff5f2e', weight: 5, opacity: 0.9 }}
          />
        ) : null}
        {start ? (
          <CircleMarker
            center={start}
            radius={8}
            pathOptions={{
              color: '#245139',
              fillColor: '#2f6b4a',
              fillOpacity: 0.95,
              weight: 2,
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
};

export default TrailRouteMap;
