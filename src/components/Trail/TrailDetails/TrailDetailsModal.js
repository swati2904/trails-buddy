import React from 'react';
import {
  Dialog,
  Heading,
  Content,
  ButtonGroup,
  Button,
  Text,
} from '@adobe/react-spectrum';

const TrailDetailsModal = ({ isOpen, onClose, trail }) => {
  if (!trail) return null;

  return (
    <Dialog isOpen={isOpen} onDismiss={onClose}>
      <Heading>{trail.name}</Heading>
      <Content>
        <Text>Difficulty: {trail.difficulty}</Text>
        <Text>Length: {trail.length}</Text>
        <Text>Bicycle Allowed: {trail.bicycle}</Text>
        <Text>Dog/Pet Allowed: {trail.dog}</Text>
        <Text>Highway: {trail.highway}</Text>
        <Text>Trail Visibility: {trail.trail_visibility}</Text>
        <Text>Elevation Grade: {trail.elevation_grade}</Text>
        <Text>Total Distance: {trail.total_distance}</Text>
      </Content>
      <ButtonGroup>
        <Button variant='secondary' onPress={onClose}>
          Close
        </Button>
      </ButtonGroup>
    </Dialog>
  );
};

export default TrailDetailsModal;
