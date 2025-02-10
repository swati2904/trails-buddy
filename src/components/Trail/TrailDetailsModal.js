import React from 'react';
import {
  Dialog,
  Heading,
  Content,
  ButtonGroup,
  Button,
} from '@adobe/react-spectrum';

const TrailDetailsModal = ({ isOpen, onRequestClose, trail }) => {
  if (!trail) return null;

  return (
    <Dialog isOpen={isOpen} onDismiss={onRequestClose}>
      <Heading>{trail.name}</Heading>
      <Content>
        <p>Difficulty: {trail.difficulty}</p>
        <p>Length: {trail.length}</p>
        <p>Bicycle Allowed: {trail.bicycle ? 'Yes' : 'No'}</p>
        <p>Dog/Pet Allowed: {trail.dog ? 'Yes' : 'No'}</p>
        <p>Highway: {trail.highway}</p>
        <p>Trail Visibility: {trail.trail_visibility}</p>
        <p>Elevation Grade: {trail.elevation_grade}</p>
        <p>Total Distance: {trail.total_distance}</p>
      </Content>
      <ButtonGroup>
        <Button variant='secondary' onPress={onRequestClose}>
          Close
        </Button>
      </ButtonGroup>
    </Dialog>
  );
};

export default TrailDetailsModal;
