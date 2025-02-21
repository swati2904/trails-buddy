import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { View, Flex } from '@adobe/react-spectrum';
import { TrailDataContext } from '../../contexts/TrailDataContext';
import SelectedTrailMap from './TrailDetails/SelectedTrailMap';
import TrailDetailsModal from './TrailDetails/TrailDetailsModal';
import ReviewSection from './TrailDetails/ReviewSection';
import CommentSection from './TrailDetails/CommentSection';
import { CommentProvider } from '../../contexts/CommentContext';
import Loader from '../Common/Loader';
import WeatherMapTabs from './TrailDetails/WeatherMapTabs';

const TrailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trailData } = useContext(TrailDataContext);
  const [trail, setTrail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    const selectedTrail = trailData.find((t) => t.id === parseInt(id));
    setTrail(selectedTrail);
  }, [id, trailData]);

  const handleClose = () => {
    setIsModalOpen(false);
    navigate('/');
  };

  if (!trail) return <Loader />;
  return (
    <CommentProvider trailId={id}>
      <View padding='size-200' overflow='auto'>
        <Flex direction='column' gap='size-200' height='100%'>
          <Flex gap='size-200' flex='1'>
            <View
              flex='1 1 80%'
              borderWidth='thin'
              borderColor='dark'
              borderRadius='medium'
              padding='size-200'
            >
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
                onClose={handleClose}
                trail={trail}
              />
            </View>
          </Flex>

          <View
            borderWidth='thin'
            borderColor='dark'
            borderRadius='medium'
            padding='size-200'
            overflow='hidden'
            height='90vh'
          >
            <WeatherMapTabs
              lat={trail.latlngs[0][0]}
              lon={trail.latlngs[0][1]}
            />
          </View>

          <Flex gap='size-200' flex='1'>
            <View
              flex='1 1 40%'
              borderWidth='thin'
              borderColor='dark'
              borderRadius='medium'
              padding='size-200'
              overflow='hidden'
            >
              <ReviewSection trail={trail} />
            </View>
            <View
              flex='1 1 60%'
              borderWidth='thin'
              borderColor='dark'
              borderRadius='medium'
              padding='size-200'
              overflow='hidden'
            >
              <CommentSection trail={trail} />
            </View>
          </Flex>
        </Flex>
      </View>
    </CommentProvider>
  );
};

export default TrailPage;
