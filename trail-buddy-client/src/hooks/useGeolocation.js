import { useContext } from 'react';
import { UserLocationContext } from '../contexts/UserLocationContext';
import { getCurrentPosition, reverseGeocode } from '../api/geolocation';

export const useGeolocation = () => {
  const { setUserLocation, setMapCenter, setUserLocationName } =
    useContext(UserLocationContext);

  const handleGetLocation = async () => {
    try {
      const position = await getCurrentPosition();
      const userLoc = [position.lat, position.lng];

      setUserLocation(userLoc);
      setMapCenter(userLoc);

      const locationName = await reverseGeocode(position.lat, position.lng);
      setUserLocationName(locationName || 'Unknown location');
    } catch (error) {
      console.error('Geolocation error:', error);
      alert('Error getting location: ' + error.message);
    }
  };

  return { handleGetLocation };
};
