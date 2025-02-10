import axios from 'axios';

export const reverseGeocode = async (lat, lon) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat,
          lon,
          format: 'json',
          zoom: 16, // More detailed address
          addressdetails: 1,
        },
      }
    );

    return response.data.display_name;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => reject(error)
    );
  });
};
