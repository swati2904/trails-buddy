import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  Heading,
  Content,
  Button,
  TextArea,
  Text,
} from '@adobe/react-spectrum';

const ReviewSection = () => {
  const [reviews, setReviews] = useState([
    { rating: 5, comment: 'Amazing trail!' },
    { rating: 4, comment: 'Great experience.' },
    { rating: 3, comment: 'It was okay.' },
    { rating: 2, comment: 'Not the best.' },
    { rating: 1, comment: 'Terrible experience.' },
  ]);

  const overallRating = (
    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div>
      <h2>Reviews</h2>
      <p>Overall Rating: {overallRating} stars</p>
      <div>
        {reviews.map((review, index) => (
          <div key={index}>
            <Text>
              {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
            </Text>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
      <DialogTrigger>
        <Button variant='cta'>Review Trail</Button>
        {(close) => (
          <Dialog>
            <Heading>Review Trail</Heading>
            <Content>
              <TextArea
                label='How was the trail?'
                placeholder='Write your review here...'
              />
              <Button
                variant='cta'
                onPress={() => {
                  alert('Thank you for your review!');
                  close();
                }}
              >
                Submit
              </Button>
            </Content>
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
};

export default ReviewSection;
