import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Map from './components/Map';
import TrailPage from './components/TrailPage';
import TrailDataProvider from './components/TrailDataProvider';

const App = () => {
  return (
    <TrailDataProvider>
      <Routes>
        <Route path='/trail/:id' element={<TrailPage />} />
        <Route path='/' element={<Map />} />
      </Routes>
    </TrailDataProvider>
  );
};

export default App;
