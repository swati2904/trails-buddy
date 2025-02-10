import { createContext, useState } from 'react';

export const UserLocationContext = createContext();

export const UserLocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userLocationName, setUserLocationName] = useState('');
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);

  return (
    <UserLocationContext.Provider
      value={{
        userLocation,
        setUserLocation,
        userLocationName,
        setUserLocationName,
        mapCenter,
        setMapCenter,
      }}
    >
      {children}
    </UserLocationContext.Provider>
  );
};
