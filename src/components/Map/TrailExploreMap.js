import React, { useMemo } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';

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

const TrailExploreMap = ({ trails, activeTrailId, onPickTrail }) => {
  const points = useMemo(
    () =>
      (trails || [])
        .map((trail) => {
          const position = normalizeCoordinate(trail.coordinate);
          if (!position) {
            return null;
          }
          return { trail, position };
        })
        .filter(Boolean),
    [trails],
  );

  const center = useMemo(() => {
    if (!points.length) {
      return DEFAULT_CENTER;
    }

    const lat =
      points.reduce((sum, item) => sum + item.position[0], 0) / points.length;
    const lon =
      points.reduce((sum, item) => sum + item.position[1], 0) / points.length;
    return [lat, lon];
  }, [points]);

  if (!points.length) {
    return (
      <div className='map-panel map-panel--empty'>
        No map points available for the current search.
      </div>
    );
  }

  return (
    <div className='map-panel'>
      <MapContainer center={center} zoom={10} scrollWheelZoom className='leaflet-map'>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {points.map(({ trail, position }) => {
          const active = trail.id === activeTrailId;
          return (
            <CircleMarker
              key={trail.id}
              center={position}
              radius={active ? 9 : 7}
              pathOptions={{
                color: active ? '#ff5f2e' : '#245139',
                fillColor: active ? '#ff7b42' : '#2f6b4a',
                fillOpacity: 0.9,
                weight: active ? 3 : 2,
              }}
              eventHandlers={{
                click: () => {
                  if (onPickTrail) {
                    onPickTrail(trail.id);
                  }
                },
              }}
            >
              <Popup>
                <strong>{trail.name}</strong>
                <div>{trail.location}</div>
                <div>{trail.distanceKm} km</div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TrailExploreMap;
