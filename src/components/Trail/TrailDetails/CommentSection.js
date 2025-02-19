import React, { useState } from 'react';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';
import { useComments } from '../../../contexts/CommentContext';
import CustomButton from '../../Common/CustomButton';

const getLabelById = (config, id) => {
  const item = config.find((item) => item.id === id);
  return item ? item.label : 'Unknown';
};

const customBadge = {
  padding: '0.5em 1em',
  margin: '0.2em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.9em',
  borderRadius: '0.25em',
};

const generateStars = (rating) => {
  const totalStars = 5;
  const goldStars = Math.min(rating, totalStars);
  const greyStars = totalStars - goldStars;

  return (
    <div className='d-flex align-items-center'>
      {[...Array(goldStars)].map((_, index) => (
        <span key={`gold-${index}`} className='text-warning fs-4'>
          ★
        </span>
      ))}
      {[...Array(greyStars)].map((_, index) => (
        <span key={`grey-${index}`} className='text-secondary fs-4'>
          ★
        </span>
      ))}
    </div>
  );
};

const CommentSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const { comments, page, setPage, totalPages } = useComments();

  const filteredComments = comments
    .filter((comment) =>
      comment.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortCriteria === 'date') {
        const dateA = new Date(a.activityDate);
        const dateB = new Date(b.activityDate);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortCriteria === 'difficulty') {
        return sortOrder === 'asc' ? a.level - b.level : b.level - a.level;
      }
      return 0;
    });

  return (
    <div className='container mt-4'>
      <div className='mb-4'>
        <div className='d-flex justify-content-between align-items-center mb-3'>
          <h2 className='mb-4'>Comments</h2>{' '}
          <div className='d-flex gap-2 align-items-center ms-auto'>
            <label className='form-label mb-0'>Sort by Date</label>
            <select
              className='form-select mt-2'
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value='asc'>Ascending</option>
              <option value='desc'>Descending</option>
            </select>
          </div>
        </div>
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
              <span className='badge bg-success' style={customBadge}>
                {getLabelById(REVIEW_CONFIG.difficulty, comment.level)}
              </span>
              <span className='badge bg-success' style={customBadge}>
                {getLabelById(REVIEW_CONFIG.activities, comment.activityType)}
              </span>
            </div>

            {comment.conditions && (
              <div className='d-flex flex-wrap gap-2'>
                {comment.conditions.map((condition) => (
                  <span
                    key={condition}
                    className='badge bg-light text-dark'
                    style={customBadge}
                  >
                    {getLabelById(REVIEW_CONFIG.conditions, condition)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      <div className='d-flex justify-content-between mt-4'>
        <CustomButton
          variant='secondary'
          className='trail-btn-prev'
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </CustomButton>
        <CustomButton
          className='trail-btn-next'
          disabled={page === totalPages - 1}
          onClick={() => setPage(page + 1)}
        >
          Next
        </CustomButton>
      </div>
    </div>
  );
};

export default CommentSection;
