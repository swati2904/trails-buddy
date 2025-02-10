import React from 'react';
import axios from 'axios';
import { Button } from '@adobe/react-spectrum';

const GetLocationButton = ({
  setUserLocation,
  setMapCenter,
  setUserLocationName,
}) => {
  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLoc = [position.coords.latitude, position.coords.longitude];
      setUserLocation(userLoc);
      setMapCenter(userLoc);

      const response = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            format: 'json',
          },
        }
      );
      const locationName = response.data.display_name;
      setUserLocationName(locationName);
    });
  };

  return (
    <Button
      variant='cta'
      onPress={handleGetLocation}
      style={{ borderRadius: '10%' }}
    >
      Get My Location
    </Button>
  );
};

export default GetLocationButton;
