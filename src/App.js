import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Map from './components/Map/Map';
import TrailPage from './components/Trail/TrailPage';
import { fetchTrailData } from './api/overpassApi';
import { Provider, defaultTheme } from '@adobe/react-spectrum';

const App = () => {
  const [trailData, setTrailData] = useState([]);

  useEffect(() => {
    fetchTrailData().then(setTrailData).catch(console.error);
  }, []);

  return (
    <Provider theme={defaultTheme}>
      <Router>
        <Routes>
          <Route
            path='/trail/:id'
            element={<TrailPage trailData={trailData} />}
          />
          <Route path='/' element={<Map />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
