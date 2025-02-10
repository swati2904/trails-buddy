import React, { useState } from 'react';
import { TextField, Text } from '@adobe/react-spectrum';

const CommentSection = () => {
  const [comments] = useState([
    {
      username: 'Hiker1',
      rating: 5,
      date: '2024-03-01',
      comment: 'Perfect trail for beginners!',
    },
    {
      username: 'ProHiker',
      rating: 4,
      date: '2024-03-02',
      comment: 'Well-marked paths',
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComments = comments.filter((comment) =>
    comment.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <TextField
        label='Search Comments'
        value={searchTerm}
        onChange={setSearchTerm}
        width='100%'
        marginBottom='size-100'
      />
      {filteredComments.map((comment, index) => (
        <div key={index} style={{ margin: '10px 0' }}>
          <Text>
            <strong>{comment.username}</strong> ({comment.date}) -{' '}
            {comment.rating}★
          </Text>
          <Text>{comment.comment}</Text>
        </div>
      ))}
    </div>
  );
};

export default CommentSection;
