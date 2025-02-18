import React from 'react';
import {
  Dialog,
  Heading,
  Content,
  ButtonGroup,
  Button,
  Text,
  Divider,
} from '@adobe/react-spectrum';

const TrailDetailsModal = ({ isOpen, onClose, trail }) => {
  if (!trail) return null; // Return nothing if trail data is missing

  const detailStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0.75rem',
    border: '1px solid #e0e0e0',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
  };

  const iconStyle = {
    marginRight: '0.75rem',
    backgroundColor: '#0078D4',
    borderRadius: '50%',
    padding: '0.4rem',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '32px',
    height: '32px',
    fontSize: '1rem',
  };

  return (
    <Dialog isOpen={isOpen} onDismiss={onClose}>
      {/* Modal Heading */}
      <Heading style={{ textAlign: 'center', color: '#0078D4' }}>
        {trail.name || 'Trail Details'}
      </Heading>
      <Divider size='S' />

      {/* Modal Content */}
      <Content style={{ padding: '1rem' }}>
        <div style={detailStyle}>
          <span style={iconStyle}>💪</span>
          <Text>Difficulty: {trail.difficulty || 'N/A'}</Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>📏</span>
          <Text>Length: {trail.length ? `${trail.length} km` : 'N/A'}</Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>🚴</span>
          <Text>Bicycle Allowed: {trail.bicycle ? 'Yes' : 'No'}</Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>🐕</span>
          <Text>Dog/Pet Allowed: {trail.dog ? 'Yes' : 'No'}</Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>🛣️</span>
          <Text>Highway: {trail.highway || 'Not specified'}</Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>👀</span>
          <Text>Trail Visibility: {trail.trail_visibility || 'N/A'}</Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>⛰️</span>
          <Text>
            Elevation Grade:{' '}
            {trail.elevation_grade ? `${trail.elevation_grade}%` : 'N/A'}
          </Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>📍</span>
          <Text>
            Total Distance:{' '}
            {trail.total_distance ? `${trail.total_distance} km` : 'N/A'}
          </Text>
        </div>
      </Content>
      <Divider size='S' />

      {/* Modal Footer */}
      <ButtonGroup>
        <Button
          variant='cta'
          onPress={onClose}
          style={{
            margin: '1rem auto',
            backgroundColor: '#0078D4',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          Close
        </Button>
      </ButtonGroup>
    </Dialog>
  );
};

export default TrailDetailsModal;
