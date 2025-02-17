import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
  DialogTrigger,
  Button,
  Text,
  ProgressBar,
} from '@adobe/react-spectrum';
import AuthModal from '../../Auth/AuthModal';
import ReviewModal from './ReviewModal';
import { useComments } from '../../../contexts/CommentContext';

const ReviewSection = ({ trail }) => {
  const { token, userEmail } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([0, 0, 0, 0, 0]);
  const { comments: reviews, setComments } = useComments();

  const calculateRatings = (reviews) => {
    if (!reviews || reviews.length === 0) {
      setOverallRating(0);
      setRatingDistribution([0, 0, 0, 0, 0]);
      return;
    }

    // Initialize variables
    let totalRating = 0;
    const distribution = [0, 0, 0, 0, 0];

    // Process each review
    reviews.forEach((review) => {
      if (review.ratings >= 1 && review.ratings <= 5) {
        totalRating += review.ratings;
        distribution[review.ratings - 1]++;
      }
    });

    // Calculate overall rating (weighted average)
    const overall = totalRating / reviews.length;
    setOverallRating(overall.toFixed(1)); // Round to 1 decimal place
    setRatingDistribution(distribution);
  };

  const handleReviewSubmit = (reviewData) => {
    const updatedReviews = [reviewData, ...reviews];
    setComments(updatedReviews);
    setIsModalOpen(false);
  };

  useEffect(() => {
    calculateRatings(reviews);
  }, [reviews]);

  if (!token) return <AuthModal onSuccess={() => {}} />;

  return (
    <div>
      <Text>Logged in as: {userEmail}</Text>
      <h1>Review</h1>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}
      >
        <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {overallRating}
        </Text>
        <span style={{ color: 'gold', fontSize: '24px', marginLeft: '8px' }}>
          ★
        </span>
        <Text style={{ marginLeft: '16px' }}>{reviews.length} reviews</Text>
      </div>

      <div>
        {ratingDistribution.map((count, index) => (
          <div
            key={index}
            style={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}
          >
            <Text>{5 - index} star</Text>
            <ProgressBar
              value={(count / reviews.length) * 100 || 0} // Percentage of reviews for this star
              maxValue={100}
              showValueLabel={false}
              UNSAFE_style={{ margin: '0 8px', flex: 1 }}
              label={`${count} Reviews`}
            />
          </div>
        ))}
      </div>

      <DialogTrigger isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Button
          variant='cta'
          marginTop='size-100'
          onPress={() => setIsModalOpen(true)}
        >
          Write Review
        </Button>
        {isModalOpen && (
          <ReviewModal
            trail={trail}
            onClose={() => setIsModalOpen(false)}
            onReviewSubmit={handleReviewSubmit}
          />
        )}
      </DialogTrigger>
    </div>
  );
};

export default ReviewSection;
