import React, { useState } from 'react';
import {
  DialogTrigger,
  Dialog,
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
  ]);

  const overallRating = (
    reviews.reduce((acc, { rating }) => acc + rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div>
      <Heading level={3}>Reviews</Heading>
      <Text>Overall Rating: {overallRating} stars</Text>
      {reviews.map((review, index) => (
        <div key={index} style={{ margin: '10px 0' }}>
          <Text>
            {'★'.repeat(review.rating)}
            {'☆'.repeat(5 - review.rating)}
          </Text>
          <Text>{review.comment}</Text>
        </div>
      ))}
      <DialogTrigger>
        <Button variant='cta' marginTop='size-100'>
          Review Trail
        </Button>
        {(close) => (
          <Dialog>
            <Heading>Review Trail</Heading>
            <Content>
              <TextArea
                label='Your Review'
                placeholder='Share your experience...'
                width='100%'
              />
              <Button
                variant='cta'
                onPress={() => {
                  alert('Thank you for your review!');
                  close();
                }}
                marginTop='size-100'
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
