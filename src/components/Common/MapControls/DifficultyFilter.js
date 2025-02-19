import React, { useState } from 'react';
import { Picker, Item } from '@adobe/react-spectrum';

const DifficultyFilter = ({ selected, onChange }) => {
  let options = [
    { key: 'all', label: 'All' },
    { key: 'easy', label: 'Easy' },
    { key: 'moderate', label: 'Moderate' },
    { key: 'hard', label: 'Hard' },
  ];

  let [difficulty, setDifficulty] = useState('all');

  return (
    <Picker
      items={options}
      selectedKey={difficulty}
      onSelectionChange={(selected) => setDifficulty(selected)}
      UNSAFE_className='trail-difficulty-filter'
    >
      {(item) => <Item key={item.key}>{item.label}</Item>}
    </Picker>
  );
};

export default DifficultyFilter;
