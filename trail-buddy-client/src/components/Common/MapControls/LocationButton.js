import { Button } from '@adobe/react-spectrum';
import { useGeolocation } from '../../../hooks/useGeolocation';

const LocationButton = () => {
  const { handleGetLocation } = useGeolocation();

  return (
    <Button variant='cta' onPress={handleGetLocation}>
      Get My Location
    </Button>
  );
};

export default LocationButton;
