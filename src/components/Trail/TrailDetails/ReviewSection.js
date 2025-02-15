import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import AuthModal from '../../Auth/AuthModal';
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
  const { token, userEmail } = useAuth();
  const [reviewText, setReviewText] = useState('');

  const handleReviewSubmit = () => {
    // review submission logic here
  };

  if (!token) {
    return <AuthModal onSuccess={() => console.log('Logged in!')} />;
  }

  return (
    <div>
      <Text>Logged in as: {userEmail}</Text>
      <DialogTrigger>
        <Button variant='cta' marginTop='size-100'>
          Write Review
        </Button>
        {(close) => (
          <Dialog>
            <Heading>Write Review</Heading>
            <Content>
              <TextArea
                label='Your Review'
                value={reviewText}
                onChange={setReviewText}
                width='100%'
              />
              <Button
                variant='cta'
                onPress={handleReviewSubmit}
                marginTop='size-100'
              >
                Submit Review
              </Button>
            </Content>
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
};

export default ReviewSection;
