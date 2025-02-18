import React, { useState } from 'react';
import {
  Dialog,
  Content,
  Button,
  Heading,
  ActionButton,
  Flex,
} from '@adobe/react-spectrum';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Close from '@spectrum-icons/workflow/Close';
import { reviewUser } from '../../../api/ReviewApi';
import RatingStep from './RatingStep';
import CommentStep from './CommentStep';
import DifficultyStep from './DifficultyStep';
import ParkingStep from './ParkingStep';
import ConditionsStep from './ConditionsStep';
import ActivityStep from './ActivityStep';

const ReviewModal = ({ trail, onClose, onReviewSubmit }) => {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [difficulty, setDifficulty] = useState(null);
  const [parkingSize, setParkingSize] = useState(null);
  const [visitDate, setVisitDate] = useState(null);
  const [selectedLiked, setSelectedLiked] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [selectedParkingCost, setSelectedParkingCost] = useState([]);
  const [activityType, setActivityType] = useState(null);
  const { token } = useAuth();

  const handleSubmit = async () => {
    const reviewData = {
      trailId: trail?.id?.toString() || '',
      comment: comment,
      ratings: rating,
      liked: selectedLiked,
      level: difficulty?.id || 0,
      access: selectedAccess.map((a) => a.id),
      parkingCost: selectedParkingCost.map((p) => p.id),
      parkingLotSize: parkingSize?.id || 0,
      conditions: selectedConditions.map((c) => c.id),
      activityType: activityType?.id || 0,
      activityDate: visitDate?.toString() || '',
    };

    try {
      const response = await reviewUser(reviewData, token);
      toast.success('Review submitted successfully!');
      onReviewSubmit(response);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <RatingStep
            rating={rating}
            setRating={setRating}
            selectedLiked={selectedLiked}
            setSelectedLiked={setSelectedLiked}
          />
        );
      case 2:
        return <CommentStep comment={comment} setComment={setComment} />;
      case 3:
        return (
          <DifficultyStep
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        );
      case 4:
        return (
          <ParkingStep
            selectedAccess={selectedAccess}
            setSelectedAccess={setSelectedAccess}
            selectedParkingCost={selectedParkingCost}
            setSelectedParkingCost={setSelectedParkingCost}
            parkingSize={parkingSize}
            setParkingSize={setParkingSize}
          />
        );
      case 5:
        return (
          <ConditionsStep
            selectedConditions={selectedConditions}
            setSelectedConditions={setSelectedConditions}
          />
        );
      case 6:
        return (
          <ActivityStep
            activityType={activityType}
            setActivityType={setActivityType}
            visitDate={visitDate}
            setVisitDate={setVisitDate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <Flex
        justifyContent='space-between'
        alignItems='center'
        width='100%'
        padding='size-200'
      >
        <Heading level={3}>Leave a Review</Heading>
        <ActionButton isQuiet onPress={onClose}>
          <Close />
        </ActionButton>
      </Flex>
      <Content>
        {renderStep()}
        <Flex
          marginTop='size-400'
          gap='size-100'
          justifyContent='space-between'
        >
          {step > 1 && (
            <Button variant='secondary' onPress={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 6 ? (
            <Button
              variant='cta'
              onPress={() => setStep(step + 1)}
              isDisabled={
                (step === 1 && (rating === 0 || selectedLiked.length === 0)) ||
                (step === 2 && comment.length < 20) ||
                (step === 3 && !difficulty) ||
                (step === 4 && (!parkingSize || selectedAccess.length === 0)) ||
                (step === 5 && selectedConditions.length === 0) ||
                (step === 6 && (!activityType || !visitDate))
              }
            >
              Next
            </Button>
          ) : (
            <Button variant='cta' onPress={handleSubmit}>
              Submit Review
            </Button>
          )}
        </Flex>
      </Content>
    </Dialog>
  );
};

export default ReviewModal;
