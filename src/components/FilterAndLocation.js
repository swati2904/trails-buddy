import React from 'react';
import GetLocationButton from './GetLocationButton';

const FilterAndLocation = ({
  handleDifficultyFilter,
  selectedDifficulty,
  setUserLocation,
  setMapCenter,
  setUserLocationName,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '60px',
        zIndex: 1000,
        display: 'flex',
        gap: '10px',
      }}
    >
      <select
        onChange={handleDifficultyFilter}
        value={selectedDifficulty}
        style={{
          width: '200px',
          height: '40px',
          borderRadius: '10px',
          padding: '5px',
          fontSize: '16px',
        }}
      >
        <option value=''>Show All</option>
        <option value='hiking'>Easy</option>
        <option value='mountain_hiking'>Moderate</option>
        <option value='demanding_mountain_hiking'>Hard</option>
      </select>
      <GetLocationButton
        setUserLocation={setUserLocation}
        setMapCenter={setMapCenter}
        setUserLocationName={setUserLocationName}
      />
    </div>
  );
};

export default FilterAndLocation;
