import React from 'react';
import {
  Heading,
  Flex,
  ActionButton,
  Button,
  Text,
} from '@adobe/react-spectrum';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';

const ParkingStep = ({
  selectedAccess,
  setSelectedAccess,
  selectedParkingCost,
  setSelectedParkingCost,
  parkingSize,
  setParkingSize,
}) => (
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
            backgroundColor: selectedAccess.some((a) => a.id === access.id)
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
            backgroundColor: selectedParkingCost.some((p) => p.id === cost.id)
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

export default ParkingStep;
