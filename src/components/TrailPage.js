import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SelectedTrailMap from './SelectedTrailMap';
import TrailDetailsModal from './TrailDetailsModal';

const TrailPage = ({ trailData }) => {
  const { id } = useParams();
  const [trail, setTrail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const selectedTrail = trailData.find((t) => t.id === parseInt(id));
    setTrail(selectedTrail);
  }, [id, trailData]);

  const handleClose = () => {
    setIsModalOpen(false);
    navigate('/'); // Navigate back to the main map page
  };

  if (!trail) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 0.7 }}>
        <SelectedTrailMap trail={trail} onClose={handleClose} />
      </div>
      <div style={{ flex: 0.3, padding: '20px', overflowY: 'auto' }}>
        <TrailDetailsModal
          isOpen={isModalOpen}
          onRequestClose={handleClose}
          trail={trail}
        />
      </div>
    </div>
  );
};

export default TrailPage;
