import React, { useState } from 'react';
import {
  Dialog,
  Content,
  Button,
  Text,
  Heading,
  ActionButton,
  Flex,
  TextArea,
  Picker,
  DatePicker,
  Item,
  View,
} from '@adobe/react-spectrum';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Star from '@spectrum-icons/workflow/Star';
import Close from '@spectrum-icons/workflow/Close';
import { reviewUser } from '../../../api/ReviewApi';

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

    console.log('Trail ID:', trail?.id);

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
          <>
            <Heading level={3}>How was the trail?</Heading>

            <Flex alignItems='center' gap='size-100'>
              {[1, 2, 3, 4, 5].map((star) => (
                <ActionButton
                  key={star}
                  isQuiet
                  onPress={() => setRating(star)}
                >
                  <Star
                    size='L'
                    UNSAFE_style={{ fill: star <= rating ? 'gold' : 'gray' }}
                  />
                </ActionButton>
              ))}
            </Flex>

            {rating > 0 && (
              <>
                <Text marginTop='size-200'>
                  {
                    [
                      'Bummer. What went wrong?',
                      'Not great? Let’s get into the details',
                      'Tell us more about it',
                      'Nice! Let’s get into the details',
                      'Amazing! What did you love?',
                    ][rating - 1]
                  }
                </Text>

                <Flex gap='size-100' wrap marginTop='size-200'>
                  {REVIEW_CONFIG.ratingOptions[rating].map((option) => (
                    <ActionButton
                      key={option.id}
                      isSelected={selectedLiked.includes(option.id)}
                      onPress={() =>
                        setSelectedLiked((prev) =>
                          prev.includes(option.id)
                            ? prev.filter((id) => id !== option.id)
                            : [...prev, option.id]
                        )
                      }
                      UNSAFE_style={{
                        backgroundColor: selectedLiked.includes(option.id)
                          ? 'lightblue'
                          : 'transparent',
                      }}
                    >
                      {option.label}
                    </ActionButton>
                  ))}
                </Flex>
              </>
            )}
          </>
        );

      case 2:
        return (
          <>
            <Heading level={3}>Tell others about the trail</Heading>
            <Text marginBottom='size-200'>Share helpful details</Text>
            <TextArea
              value={comment}
              onChange={setComment}
              width='100%'
              minHeight='size-1200'
            />
          </>
        );

      case 3:
        return (
          <>
            <Heading level={3}>How difficult is this trail?</Heading>
            <Text>Help others pick the right trail</Text>
            <Picker
              selectedKey={difficulty}
              onSelectionChange={setDifficulty}
              items={REVIEW_CONFIG.difficulty}
            >
              {(item) => <Item key={item.id}>{item.label}</Item>}
            </Picker>
          </>
        );

      case 4:
        return (
          <>
            <Heading level={3}>How was parking?</Heading>
            <Text>Help the community come prepared</Text>

            <Heading level={4} marginTop='size-200'>
              Access
            </Heading>
            <Flex gap='size-100' wrap>
              {REVIEW_CONFIG.access.map((access) => (
                <ActionButton
                  key={access.id}
                  isSelected={selectedAccess.some((a) => a.id === access.id)}
                  onPress={() =>
                    setSelectedAccess((prev) =>
                      prev.some((a) => a.id === access.id)
                        ? prev.filter((a) => a.id !== access.id)
                        : [...prev, access]
                    )
                  }
                  UNSAFE_style={{
                    backgroundColor: selectedAccess.some(
                      (a) => a.id === access.id
                    )
                      ? 'lightblue'
                      : 'transparent',
                  }}
                >
                  {access.label}
                </ActionButton>
              ))}
            </Flex>

            <Heading level={4} marginTop='size-200'>
              Parking Cost
            </Heading>
            <Flex gap='size-100' wrap>
              {REVIEW_CONFIG.parkingCost.map((cost) => (
                <ActionButton
                  key={cost.id}
                  isSelected={selectedParkingCost.some((p) => p.id === cost.id)}
                  onPress={() =>
                    setSelectedParkingCost((prev) =>
                      prev.some((p) => p.id === cost.id)
                        ? prev.filter((p) => p.id !== cost.id)
                        : [...prev, cost]
                    )
                  }
                  UNSAFE_style={{
                    backgroundColor: selectedParkingCost.some(
                      (p) => p.id === cost.id
                    )
                      ? 'lightblue'
                      : 'transparent',
                  }}
                >
                  {cost.label}
                </ActionButton>
              ))}
            </Flex>

            <Heading level={4} marginTop='size-200'>
              Parking Lot Size
            </Heading>
            <Flex gap='size-200' marginTop='size-100'>
              {REVIEW_CONFIG.parkingSize.map((size) => (
                <Button
                  key={size.id}
                  variant={parkingSize?.id === size.id ? 'cta' : 'primary'}
                  onPress={() => setParkingSize(size)}
                  width='size-2400'
                >
                  <Flex direction='column' alignItems='center'>
                    <Text>{size.icon}</Text>
                    <Text>{size.label}</Text>
                  </Flex>
                </Button>
              ))}
            </Flex>
          </>
        );

      case 5:
        return (
          <>
            <Heading level={3}>Any conditions to note?</Heading>
            <Text>Help the community come prepared</Text>
            <Flex gap='size-100' wrap marginTop='size-200'>
              {REVIEW_CONFIG.conditions.map((condition) => (
                <ActionButton
                  key={condition.id}
                  isSelected={selectedConditions.some(
                    (c) => c.id === condition.id
                  )}
                  onPress={() =>
                    setSelectedConditions((prev) =>
                      prev.some((c) => c.id === condition.id)
                        ? prev.filter((c) => c.id !== condition.id)
                        : [...prev, condition]
                    )
                  }
                  UNSAFE_style={{
                    backgroundColor: selectedConditions.some(
                      (c) => c.id === condition.id
                    )
                      ? 'lightblue'
                      : 'transparent',
                  }}
                >
                  <Flex alignItems='center' gap='size-20'>
                    <View>{condition.icon}</View>
                    <View
                      UNSAFE_style={{
                        flex: 1,
                        minWidth: '0',
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center',
                        padding: '0 0.5rem',
                      }}
                    >
                      {condition.label}
                    </View>
                  </Flex>
                </ActionButton>
              ))}
            </Flex>
          </>
        );

      case 6:
        return (
          <>
            <Heading level={3}>One last thing...</Heading>
            <Text>Help users put your review in context</Text>

            <Flex direction='column' gap='size-200' marginTop='size-200'>
              <Picker
                label='Activity type'
                selectedKey={activityType?.id}
                onSelectionChange={(key) =>
                  setActivityType(
                    REVIEW_CONFIG.activities.find((a) => a.id === key)
                  )
                }
              >
                {REVIEW_CONFIG.activities.map((activity) => (
                  <Item key={activity.id}>{activity.label}</Item>
                ))}
              </Picker>

              <DatePicker
                label='Date visited'
                value={visitDate}
                onChange={(value) => {
                  setVisitDate(value);
                }}
              />
            </Flex>
          </>
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
