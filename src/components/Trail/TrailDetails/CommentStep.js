import React from 'react';
import { Heading, Text, TextArea } from '@adobe/react-spectrum';

const CommentStep = ({ comment, setComment }) => (
  <>
    <Heading level={3}>Tell others about the trail</Heading>
    <Text marginBottom='size-200'>Share helpful details</Text>
    <TextArea
      value={comment}
      onChange={setComment}
      width='100%'
      minHeight='size-1200'
    />
  </>
);

export default CommentStep;
