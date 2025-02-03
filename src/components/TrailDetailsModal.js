import React from 'react';
import Modal from 'react-modal';

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
    backgroundColor: 'rgba(255, 255, 255, 0.73)',
  },
};

const TrailDetailsModal = ({ isOpen, onRequestClose, trail }) => {
  if (!trail) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel='Trail Details'
      style={customStyles}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2>{trail.name}</h2>
        <button
          onClick={onRequestClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>
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
