import React from 'react';
import { Heading, Text, Picker, Item } from '@adobe/react-spectrum';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';

const DifficultyStep = ({ difficulty, setDifficulty }) => (
  <>
    <Heading level={5}>How difficult is this trail?</Heading>
    <div style={{ marginTop: '2rem', fontWeight: '500' }}>
      <Text>Help others pick the right trail</Text>
      <Picker
        selectedKey={difficulty}
        onSelectionChange={setDifficulty}
        items={REVIEW_CONFIG.difficulty}
        UNSAFE_style={{ marginLeft: '30px' }}
      >
        {(item) => <Item key={item.id}>{item.label}</Item>}
      </Picker>
    </div>
  </>
);

export default DifficultyStep;
