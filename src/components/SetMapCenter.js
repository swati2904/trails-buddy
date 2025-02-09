import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const SetMapCenter = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);

  return null;
};

export default SetMapCenter;
