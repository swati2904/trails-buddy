import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  Provider as SpectrumProvider,
  defaultTheme,
} from '@adobe/react-spectrum';
import { UserLocationProvider } from '../contexts/UserLocationContext';
import { TrailDataContext } from '../contexts/TrailDataContext';
import Map from './Map/Map';
import TrailPage from './Trail/TrailPage';
import { fetchTrails } from '../api/trails';

const App = () => {
  const [trailData, setTrailData] = useState([]);

  useEffect(() => {
    const loadTrails = async () => {
      const data = await fetchTrails();
      setTrailData(data);
    };
    loadTrails();
  }, []);

  return (
    <SpectrumProvider theme={defaultTheme}>
      <UserLocationProvider>
        <TrailDataContext.Provider value={{ trailData }}>
          <Router>
            <Routes>
              <Route path='/trail/:id' element={<TrailPage />} />
              <Route path='/' element={<Map />} />
            </Routes>
          </Router>
        </TrailDataContext.Provider>
      </UserLocationProvider>
    </SpectrumProvider>
  );
};

export default App;
