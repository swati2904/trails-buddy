import React from 'react';
import { Heading, Flex, ActionButton, Text } from '@adobe/react-spectrum';
import Star from '@spectrum-icons/workflow/Star';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';

const RatingStep = ({ rating, setRating, selectedLiked, setSelectedLiked }) => (
  <>
    <Heading level={5}>How was the trail?</Heading>
    <Flex justifyContent={'flex-start'} gap='size-100' marginTop='size-400'>
      {[1, 2, 3, 4, 5].map((star) => (
        <ActionButton key={star} isQuiet onPress={() => setRating(star)}>
          <Star
            // size='L'
            UNSAFE_style={{
              fill: star <= rating ? 'gold' : 'gray',
              width: '2rem',
              height: '2rem',
            }}
          />
        </ActionButton>
      ))}
    </Flex>
    {rating > 0 && (
      <div style={{ marginTop: '2rem', fontWeight: '500' }}>
        <Text>
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
                  ? 'lightgreen'
                  : 'transparent',
              }}
            >
              {option.label}
            </ActionButton>
          ))}
        </Flex>
      </div>
    )}
  </>
);

export default RatingStep;
