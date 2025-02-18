import React from 'react';
import { Heading, Text, TextArea } from '@adobe/react-spectrum';

const CommentStep = ({ comment, setComment }) => (
  <>
    <Heading level={5}>Tell others about the trail</Heading>
    <div style={{ marginTop: '2rem', fontWeight: '500' }}>
      <Text>Share helpful details</Text>
      <TextArea
        value={comment}
        onChange={setComment}
        width='100%'
        height='200px'
      />
    </div>
  </>
);

export default CommentStep;
