import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  Provider as SpectrumProvider,
  defaultTheme,
} from '@adobe/react-spectrum';
import { UserLocationProvider } from '../contexts/UserLocationContext';
import { TrailDataContext } from '../contexts/TrailDataContext';
import { AuthProvider } from '../contexts/AuthContext';
import Map from './Map/Map';
import TrailPage from './Trail/TrailPage';
import Header from './Header/Header';
import AuthModal from './Auth/AuthModal';
import { fetchTrails } from '../api/trails';

const AppContent = () => {
  const [trailData, setTrailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTrails = async () => {
      try {
        setLoading(true);
        const data = await fetchTrails();
        setTrailData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load trails. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTrails();
  }, []);

  return (
    <UserLocationProvider>
      <TrailDataContext.Provider value={{ trailData, loading, error }}>
        <Header />
        <Routes>
          <Route path='/trail/:id' element={<TrailPage />} />
          <Route path='/' element={<Map />} />
          <Route path='/auth' element={<AuthModal />} />
        </Routes>
      </TrailDataContext.Provider>
    </UserLocationProvider>
  );
};

const App = () => {
  return (
    <SpectrumProvider theme={defaultTheme}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </SpectrumProvider>
  );
};

export default App;
