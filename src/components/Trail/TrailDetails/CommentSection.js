import React, { useState, useEffect } from 'react';
import { TextField, Text } from '@adobe/react-spectrum';
import { fetchComments } from '../../../api/ReviewApi';
import { useAuth } from '../../../contexts/AuthContext';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';

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

const CommentSection = ({ trailId }) => {
  const [comments, setComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { username } = useAuth();

  useEffect(() => {
    console.log('fetching comments for trail:', trailId);
    const getComments = async () => {
      try {
        const data = await fetchComments(trailId);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    getComments();
  }, [trailId]);

  const filteredComments = comments.filter((comment) =>
    comment.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <TextField
        label='Search Comments'
        value={searchTerm}
        onChange={setSearchTerm}
        style={{
          width: '100%',
          marginBottom: '20px',
          padding: '8px',
          fontSize: '16px',
        }}
      />
      {filteredComments.map((comment) => (
        <div
          key={comment.id}
          style={{
            margin: '15px 0',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            backgroundColor: '#f9f9f9',
          }}
        >
          {/* User Info Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 'bold',
                marginRight: '15px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              S
            </div>

            {/* User Metadata */}
            <div>
              <Text
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                }}
              >
                {username}
              </Text>
              <div
                style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}
              >
                {comment.activityDate}
              </div>
              <div style={{ fontSize: '14px', color: '#555' }}>
                {generateStars(comment.ratings)}
              </div>
            </div>
          </div>

          {/* Comment Details */}
          <div
            style={{ marginBottom: '10px', fontSize: '14px', color: '#333' }}
          >
            {comment.comment}
          </div>

          {/* Additional Metadata */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                backgroundColor: '#e0e0e0',
                padding: '5px 10px',
                borderRadius: '20px',
              }}
            >
              {comment.liked ? 'Liked' : 'Not Liked'}
            </span>
            <span
              style={{
                backgroundColor: '#e0e0e0',
                padding: '5px 10px',
                borderRadius: '20px',
              }}
            >
              {getLabelById(REVIEW_CONFIG.difficulty, comment.level)}
            </span>
            <span
              style={{
                backgroundColor: '#e0e0e0',
                padding: '5px 10px',
                borderRadius: '20px',
              }}
            >
              {getLabelById(REVIEW_CONFIG.activities, comment.activityType)}
            </span>
          </div>

          {/* Conditions Tags */}
          {comment.conditions && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              {comment.conditions.map((condition) => (
                <span
                  key={condition}
                  style={{
                    backgroundColor: '#f0f0f0',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    color: '#333',
                  }}
                >
                  {getLabelById(REVIEW_CONFIG.conditions, condition)}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentSection;
