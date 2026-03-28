import React, { useMemo } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';

const DEFAULT_CENTER = [39.7392, -104.9903];
const CLUSTER_THRESHOLD = 140;

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

const toGridKey = (position, size) => {
  const [lat, lon] = position;
  const latCell = Math.floor(lat / size);
  const lonCell = Math.floor(lon / size);
  return `${latCell}:${lonCell}`;
};

const clusterPoints = (points, size = 0.12) => {
  const buckets = new Map();

  points.forEach((item) => {
    const key = toGridKey(item.position, size);
    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, {
        points: [item],
        sumLat: item.position[0],
        sumLon: item.position[1],
      });
      return;
    }

    existing.points.push(item);
    existing.sumLat += item.position[0];
    existing.sumLon += item.position[1];
  });

  return Array.from(buckets.values()).map((bucket) => ({
    items: bucket.points,
    center: [
      bucket.sumLat / bucket.points.length,
      bucket.sumLon / bucket.points.length,
    ],
  }));
};

const TrailExploreMap = ({
  trails,
  activeTrailId,
  onPickTrail,
  markerLimit = 120,
}) => {
  const points = useMemo(
    () =>
      (trails || [])
        .map((trail) => {
          const position =
            normalizeCoordinate(trail.coordinate) ||
            normalizeCoordinate({ lat: trail.lat, lon: trail.lon });
          if (!position) {
            return null;
          }
          return { trail, position };
        })
        .filter(Boolean),
    [trails],
  );

  const visiblePoints = useMemo(() => {
    if (!points.length) {
      return [];
    }

    return points.slice(0, markerLimit);
  }, [points, markerLimit]);

  const clustered = useMemo(() => {
    if (visiblePoints.length <= CLUSTER_THRESHOLD) {
      return null;
    }

    return clusterPoints(visiblePoints);
  }, [visiblePoints]);

  const center = useMemo(() => {
    if (!visiblePoints.length) {
      return DEFAULT_CENTER;
    }

    const lat =
      visiblePoints.reduce((sum, item) => sum + item.position[0], 0) /
      visiblePoints.length;
    const lon =
      visiblePoints.reduce((sum, item) => sum + item.position[1], 0) /
      visiblePoints.length;
    return [lat, lon];
  }, [visiblePoints]);

  if (!points.length) {
    return (
      <div className='map-panel map-panel--empty'>
        No park locations yet for this view. Try widening your search radius.
      </div>
    );
  }

  return (
    <div className='map-panel'>
      {points.length > visiblePoints.length ? (
        <div className='map-limit-note'>
          Showing {visiblePoints.length} map pins for clarity. Refine filters to
          explore all {points.length} parks.
        </div>
      ) : null}
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom
        className='leaflet-map'
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {clustered
          ? clustered.map((group, index) => {
              const sample = group.items[0]?.trail;
              const activeInCluster = group.items.some(
                (entry) => entry.trail.id === activeTrailId,
              );
              const count = group.items.length;

              return (
                <CircleMarker
                  key={`${sample?.id || index}-cluster`}
                  center={group.center}
                  radius={Math.max(
                    8,
                    Math.min(16, 6 + Math.log2(count + 1) * 2),
                  )}
                  pathOptions={{
                    color: activeInCluster ? '#F59E0B' : '#2E7D32',
                    fillColor: activeInCluster ? '#F59E0B' : '#66BB6A',
                    fillOpacity: 0.9,
                    weight: activeInCluster ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => {
                      if (onPickTrail && sample?.id) {
                        onPickTrail(sample.id);
                      }
                    },
                  }}
                >
                  <Popup>
                    <strong>{count} parks in this area</strong>
                    {sample?.name ? <div>Suggested: {sample.name}</div> : null}
                  </Popup>
                </CircleMarker>
              );
            })
          : visiblePoints.map(({ trail, position }) => {
              const active = trail.id === activeTrailId;
              return (
                <CircleMarker
                  key={trail.id}
                  center={position}
                  radius={active ? 9 : 7}
                  pathOptions={{
                    color: active ? '#F59E0B' : '#2E7D32',
                    fillColor: active ? '#F59E0B' : '#66BB6A',
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
                    <div>
                      {[trail.city, trail.state].filter(Boolean).join(', ') ||
                        trail.state ||
                        'United States'}
                    </div>
                    {trail.distanceFromSearchKm ? (
                      <div>{trail.distanceFromSearchKm.toFixed(1)} km away</div>
                    ) : null}
                  </Popup>
                </CircleMarker>
              );
            })}
      </MapContainer>
    </div>
  );
};

export default TrailExploreMap;
