import { Button } from '@adobe/react-spectrum';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useTranslation } from 'react-i18next';

const LocationButton = () => {
  const { t } = useTranslation();
  const { handleGetLocation } = useGeolocation();

  return (
    <Button
      variant='cta'
      onPress={handleGetLocation}
      UNSAFE_className='trail-location'
    >
      {t('common.get_my_location')}
    </Button>
  );
};

export default LocationButton;
