import React from 'react';
import { Heading, Text, Picker, Item } from '@adobe/react-spectrum';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';

const DifficultyStep = ({ difficulty, setDifficulty }) => (
  <>
    <Heading level={3}>How difficult is this trail?</Heading>
    <Text>Help others pick the right trail</Text>
    <Picker
      selectedKey={difficulty}
      onSelectionChange={setDifficulty}
      items={REVIEW_CONFIG.difficulty}
    >
      {(item) => <Item key={item.id}>{item.label}</Item>}
    </Picker>
  </>
);

export default DifficultyStep;
