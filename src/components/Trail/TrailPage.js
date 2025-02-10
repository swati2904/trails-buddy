import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SelectedTrailMap from './SelectedTrailMap';
import TrailDetailsModal from './TrailDetailsModal';
import ReviewSection from './ReviewSection';
import CommentSection from './CommentSection';
import { View, Flex } from '@adobe/react-spectrum';

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
    navigate('/');
  };

  if (!trail) {
    return <div>Loading...</div>;
  }

  return (
    <View padding='size-200' overflow='auto'>
      <Flex direction='column' gap='size-200' height='100%'>
        <Flex gap='size-200' flex='1'>
          <View flex='1 1 80%' height='100%'>
            <SelectedTrailMap trail={trail} />
          </View>
          <View
            flex='1 1 20%'
            borderWidth='thin'
            borderColor='dark'
            borderRadius='medium'
            padding='size-200'
          >
            <TrailDetailsModal
              isOpen={isModalOpen}
              onRequestClose={handleClose}
              trail={trail}
            />
          </View>
        </Flex>
        <Flex gap='size-200' flex='1'>
          <View
            flex='1 1 40%'
            borderWidth='thin'
            borderColor='dark'
            borderRadius='medium'
            padding='size-200'
            overflow='hidden'
          >
            <ReviewSection />
          </View>
          <View
            flex='1 1 60%'
            borderWidth='thin'
            borderColor='dark'
            borderRadius='medium'
            padding='size-200'
            overflow='hidden'
          >
            <CommentSection />
          </View>
        </Flex>
      </Flex>
    </View>
  );
};

export default TrailPage;
