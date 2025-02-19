import { Button } from '@adobe/react-spectrum';
import { useGeolocation } from '../../../hooks/useGeolocation';

const LocationButton = () => {
  const { handleGetLocation } = useGeolocation();

  return (
    <Button
      variant='cta'
      onPress={handleGetLocation}
      UNSAFE_className='trail-location'
    >
      Get My Location
    </Button>
  );
};

export default LocationButton;
