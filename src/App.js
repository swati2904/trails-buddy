import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Map from './components/Map';
import TrailPage from './components/TrailPage';
import TrailDataProvider from './components/TrailDataProvider';

const App = () => {
  return (
    <TrailDataProvider>
      <Router>
        <Routes>
          <Route path='/trail/:id' element={<TrailPage />} />
          <Route path='/' element={<Map />} />
        </Routes>
      </Router>
    </TrailDataProvider>
  );
};

export default App;
