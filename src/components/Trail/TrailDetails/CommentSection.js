import React, { useState } from 'react';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';
import { useComments } from '../../../contexts/CommentContext';

const getLabelById = (config, id) => {
  const item = config.find((item) => item.id === id);
  return item ? item.label : 'Unknown';
};

const generateStars = (rating) => {
  const totalStars = 5;
  const goldStars = Math.min(rating, totalStars);
  const greyStars = totalStars - goldStars;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {[...Array(goldStars)].map((_, index) => (
        <span key={`gold-${index}`} style={{ color: 'gold', fontSize: '20px' }}>
          ★
        </span>
      ))}
      {[...Array(greyStars)].map((_, index) => (
        <span key={`grey-${index}`} style={{ color: 'grey', fontSize: '20px' }}>
          ★
        </span>
      ))}
    </div>
  );
};

const CommentSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { comments, page, setPage, totalPages } = useComments();

  const filteredComments = comments.filter((comment) =>
    comment.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='container mt-4'>
      <div className='mb-4'>
        <input
          type='text'
          className='form-control'
          placeholder='Search comments...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredComments.map((comment) => (
        <div key={comment.id} className='card mb-3'>
          <div className='card-body'>
            <div className='d-flex align-items-center mb-3'>
              <div
                className='bg-primary text-white rounded-circle d-flex align-items-center justify-content-center'
                style={{ width: '50px', height: '50px' }}
              >
                {comment.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className='ms-3'>
                <h5 className='mb-1'>{comment.username}</h5>
                <small className='text-muted'>
                  {new Date(comment.activityDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </small>
                {generateStars(comment.ratings)}
              </div>
            </div>

            <p className='card-text mb-3'>{comment.comment}</p>

            <div className='d-flex flex-wrap gap-2 mb-3'>
              <span className='badge bg-secondary'>
                {getLabelById(REVIEW_CONFIG.difficulty, comment.level)}
              </span>
              <span className='badge bg-secondary'>
                {getLabelById(REVIEW_CONFIG.activities, comment.activityType)}
              </span>
            </div>

            {comment.conditions && (
              <div className='d-flex flex-wrap gap-2'>
                {comment.conditions.map((condition) => (
                  <span key={condition} className='badge bg-info'>
                    {getLabelById(REVIEW_CONFIG.conditions, condition)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <div className='d-flex justify-content-between mt-4'>
        <button
          className='btn btn-secondary'
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <button
          className='btn btn-secondary'
          disabled={page === totalPages - 1}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
