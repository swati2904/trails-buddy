import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  Provider as SpectrumProvider,
  defaultTheme,
} from '@adobe/react-spectrum';
import { UserLocationProvider } from '../contexts/UserLocationContext';
import { TrailDataContext } from '../contexts/TrailDataContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Map from './Map/Map';
import TrailPage from './Trail/TrailPage';
import Header from './Header/Header';
import AuthModal from './Auth/AuthModal';
import { fetchTrails } from '../api/trails';

const AppContent = () => {
  const { token } = useAuth();
  const [trailData, setTrailData] = useState([]);

  useEffect(() => {
    const loadTrails = async () => {
      const data = await fetchTrails();
      setTrailData(data);
    };
    loadTrails();
  }, []);

  return (
    <UserLocationProvider>
      <TrailDataContext.Provider value={{ trailData }}>
        <Router>
          {token && <Header />}
          <Routes>
            <Route path='/trail/:id' element={<TrailPage />} />
            <Route path='/' element={<Map />} />
            <Route path='/auth' element={<AuthModal />} />
          </Routes>
        </Router>
      </TrailDataContext.Provider>
    </UserLocationProvider>
  );
};

const App = () => {
  return (
    <SpectrumProvider theme={defaultTheme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SpectrumProvider>
  );
};

export default App;
