import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const FitBounds = ({ trail }) => {
  const map = useMap();

  useEffect(() => {
    if (trail?.latlngs?.length > 0) {
      const bounds = trail.latlngs.map(([lat, lng]) => [lat, lng]);
      map.fitBounds(bounds);
    }
  }, [trail, map]);

  return null;
};

export default FitBounds;
