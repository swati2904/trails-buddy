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
import { fetchComments } from '../../../api/ReviewApi';

const ReviewSection = ({ trail }) => {
  const { token, userEmail } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    const getReviews = async () => {
      try {
        const data = await fetchComments(trail.id);

        // If the API response is invalid or empty, handle gracefully
        if (!Array.isArray(data) || data.length === 0) {
          setReviews([]);
          setOverallRating(0);
          setRatingDistribution([0, 0, 0, 0, 0]);
          return;
        }

        setReviews(data);
        calculateRatings(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    getReviews();
  }, [trail.id]);

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
      console.log('Processing review:', review); // Debugging each review
      if (review.ratings >= 1 && review.ratings <= 5) {
        totalRating += review.ratings;
        distribution[review.ratings - 1]++;
      }
    });

    // Calculate overall rating (weighted average)
    const overall = totalRating / reviews.length;

    console.log('Total Rating:', totalRating); // Debugging totalRating
    console.log('Distribution:', distribution); // Debugging distribution

    setOverallRating(overall.toFixed(1)); // Round to 1 decimal place
    setRatingDistribution(distribution);
  };

  const handleReviewSubmit = (reviewData) => {
    const updatedReviews = [reviewData, ...reviews];
    setReviews(updatedReviews);
    setIsModalOpen(false);
    calculateRatings(updatedReviews);
  };

  if (!token) return <AuthModal onSuccess={() => {}} />;

  // Debugging overallRating and ratingDistribution
  console.log('Overall Rating:', overallRating);
  console.log('Rating Distribution:', ratingDistribution);
  console.log('Reviews Length:', reviews.length);

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

      {/* Overall Rating ProgressBar */}
      {/* <ProgressBar
        value={(overallRating / 5) * 100} // Convert rating (1-5) to percentage (0-100%)
        maxValue={100}
        label='Overall Rating'
        showValueLabel={false}
        UNSAFE_style={{ marginBottom: '16px', width: '100%' }}
      /> */}

      {/* Rating Distribution */}
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
