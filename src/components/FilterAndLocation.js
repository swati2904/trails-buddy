import React from 'react';
import { Picker, Item } from '@adobe/react-spectrum';
import GetLocationButton from './GetLocationButton';

const FilterAndLocation = ({
  handleDifficultyFilter,
  selectedDifficulty,
  setUserLocation,
  setMapCenter,
  setUserLocationName,
}) => {
  const onSelectionChange = (key) => {
    handleDifficultyFilter(key);
  };

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
      <Picker
        // label='Select Difficulty'
        selectedKey={selectedDifficulty}
        onSelectionChange={onSelectionChange}
        width='size-2000'
      >
        <Item key=''>Show All</Item>
        <Item key='hiking'>Easy</Item>
        <Item key='mountain_hiking'>Moderate</Item>
        <Item key='demanding_mountain_hiking'>Hard</Item>
      </Picker>
      <GetLocationButton
        setUserLocation={setUserLocation}
        setMapCenter={setMapCenter}
        setUserLocationName={setUserLocationName}
      />
    </div>
  );
};

export default FilterAndLocation;
