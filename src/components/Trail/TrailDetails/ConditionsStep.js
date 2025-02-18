import React from 'react';
import { Heading, Flex, ActionButton, View, Text } from '@adobe/react-spectrum';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';

const ConditionsStep = ({ selectedConditions, setSelectedConditions }) => (
  <>
    <Heading level={3}>Any conditions to note?</Heading>
    <Text>Help the community come prepared</Text>
    <Flex gap='size-100' wrap marginTop='size-200'>
      {REVIEW_CONFIG.conditions.map((condition) => (
        <ActionButton
          key={condition.id}
          isSelected={selectedConditions.some((c) => c.id === condition.id)}
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

export default ConditionsStep;
