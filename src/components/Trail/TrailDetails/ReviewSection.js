import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { DialogTrigger, Text, ProgressBar } from '@adobe/react-spectrum';
import AuthModal from '../../Auth/AuthModal';
import ReviewModal from './ReviewModal';
import { useComments } from '../../../contexts/CommentContext';
import { fetchComments } from '../../../api/ReviewApi';
import CustomButton from '../../Common/CustomButton';
import { useTranslation } from 'react-i18next';

const ReviewSection = ({ trail }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
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

    let totalRating = 0;
    const distribution = [0, 0, 0, 0, 0];

    reviews.forEach((review) => {
      if (review.ratings >= 1 && review.ratings <= 5) {
        totalRating += review.ratings;
        distribution[review.ratings - 1]++;
      }
    });

    const overall = totalRating / reviews.length;
    setOverallRating(overall.toFixed(1));
    setRatingDistribution(distribution);
  };

  const handleReviewSubmit = (reviewData) => {
    const updatedReviews = [reviewData, ...reviews];
    setComments(updatedReviews);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const loadAllComments = async () => {
      try {
        const allComments = [];
        let page = 0;
        let totalPages = 1;

        while (page < totalPages) {
          const data = await fetchComments(trail.id, page, 100); // Fetch 100 comments at a time
          allComments.push(...data.content);
          totalPages = data.totalPages;
          page++;
        }

        calculateRatings(allComments);
      } catch (error) {
        console.error(
          'Error loading all comments for rating calculation:',
          error
        );
      }
    };

    loadAllComments();
  }, [trail.id]);

  return (
    <div className='container mt-4  trail-review'>
      <h1 className='mb-4'>{t('heading.review')}</h1>

      <div className='d-flex align-items-center mb-4'>
        <Text
          UNSAFE_style={{
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          {overallRating}
        </Text>
        <span className='text-warning fs-3 ms-2'>★</span>
        {/* <Text className='ms-3'>{reviews.length} reviews</Text> */}
      </div>

      <div>
        {ratingDistribution.map((count, index) => (
          <div key={index} className='d-flex align-items-center mb-2'>
            <Text>{5 - index} star</Text>
            <ProgressBar
              value={(count / reviews.length) * 100 || 0}
              maxValue={100}
              showValueLabel={false}
              UNSAFE_style={{ margin: '0 8px', flex: 1 }}
              label={`${count} Reviews`}
            />
          </div>
        ))}
      </div>

      {token ? (
        <DialogTrigger isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
          <CustomButton
            variant='negative'
            marginTop='size-200'
            className='btn btn-primary'
            onPress={() => setIsModalOpen(true)}
          >
            {t('common.write_review')}
          </CustomButton>
          {isModalOpen && (
            <ReviewModal
              trail={trail}
              onClose={() => setIsModalOpen(false)}
              onReviewSubmit={handleReviewSubmit}
            />
          )}
        </DialogTrigger>
      ) : (
        <AuthModal onSuccess={() => {}} />
      )}
    </div>
  );
};

export default ReviewSection;
