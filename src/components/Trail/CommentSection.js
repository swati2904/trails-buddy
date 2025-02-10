import React, { useState } from 'react';
import { TextField, Button } from '@adobe/react-spectrum';

const CommentSection = () => {
  const [comments, setComments] = useState([
    { username: 'User1', rating: 5, date: '2025-02-01', comment: 'Loved it!' },
    {
      username: 'User2',
      rating: 4,
      date: '2025-02-02',
      comment: 'Great trail!',
    },
    {
      username: 'User3',
      rating: 3,
      date: '2025-02-03',
      comment: 'It was okay.',
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComments = comments.filter((comment) =>
    comment.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <TextField
        label='Search Reviews'
        placeholder='Search...'
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <div>
        {filteredComments.map((comment, index) => (
          <div key={index}>
            <p>
              <strong>{comment.username}</strong> - {comment.rating} stars -{' '}
              {comment.date}
            </p>
            <p>{comment.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
