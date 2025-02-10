import React from 'react';
import Modal from 'react-modal';
import { Heading, Text, Button } from '@adobe/react-spectrum';

const customStyles = {
  content: {
    top: '1px',
    left: 'auto',
    right: '10px',
    width: '27%',
    bottom: '1px',
    cursor: 'pointer',
    border: '5px solid green',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
};

const TrailDetailsModal = ({ isOpen, onRequestClose, trail }) => {
  if (!trail) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel='Trail Details'
      style={customStyles}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        onClick={handleModalClick}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Heading level={2}>{trail.name}</Heading>
        <Button variant='secondary' onPress={onRequestClose}>
          &times;
        </Button>
      </div>
      <p>Difficulty: {trail.difficulty}</p>
      <p>Length: {trail.length}</p>
      <p>Bicycle Allowed: {trail.bicycle ? 'Yes' : 'No'}</p>
      <p>Dog/Pet Allowed: {trail.dog ? 'Yes' : 'No'}</p>
      <p>Highway: {trail.highway}</p>
      <p>Trail Visibility: {trail.trail_visibility}</p>
      <p>Elevation Grade: {trail.elevation_grade}</p>
      <p>Total Distance: {trail.total_distance}</p>
    </Modal>
  );
};

export default TrailDetailsModal;
