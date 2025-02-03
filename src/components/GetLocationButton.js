import React from 'react';
import axios from 'axios';

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
    <button
      onClick={handleGetLocation}
      style={{
        height: '40px',
        borderRadius: '10px',
        padding: '5px 10px',
        fontSize: '16px',
        cursor: 'pointer',
      }}
    >
      Get My Location
    </button>
  );
};

export default GetLocationButton;
