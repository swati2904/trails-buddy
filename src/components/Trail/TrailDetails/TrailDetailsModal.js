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
import { ICONS } from '../../../constants/icons';
import { useTranslation } from 'react-i18next';

const TrailDetailsModal = ({ isOpen, onClose, trail }) => {
  const { t } = useTranslation();

  if (!trail) return null;

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
        {trail.name || t('trail.details')}
      </Heading>
      <Divider size='S' />

      {/* Modal Content */}
      <Content style={{ padding: '1rem' }}>
        <div style={detailStyle}>
          <span style={iconStyle}>{ICONS.DIFFICULTY.EASY}</span>
          <Text>
            {`${t('trail.difficulty')} ${trail.difficulty || t('common.na')}`}
          </Text>
        </div>

        <div style={detailStyle}>
          <span style={iconStyle}>{ICONS.AMENITIES.LENGTH}</span>
          <Text>
            {`${t('trail.length')} ${
              !trail.length ? `${trail.length} km` : t('common.na')
            }`}
          </Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>{ICONS.AMENITIES.BICYCLE}</span>
          <Text>
            {`${t('trail.bicycle')} ${
              trail.bicycle ? t('common.yes') : t('common.no')
            }`}
          </Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>{ICONS.AMENITIES.DOG}</span>
          <Text>
            {`${t('trail.dog')} ${
              trail.dog_friendly ? t('common.yes') : t('common.no')
            }`}
          </Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>{ICONS.AMENITIES.HIGHWAY}</span>
          <Text>
            {`${t('trail.highway')} ${
              trail.highway ? t('common.yes') : t('common.no')
            }`}
          </Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>{ICONS.AMENITIES.VISIBILITY}</span>
          <Text>
            {`${t('trail.visibility')} ${
              trail.visibility ? t('common.yes') : t('common.no')
            }`}
          </Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>{ICONS.AMENITIES.ELEVATION}</span>
          <Text>
            {t('trail.elevation')}
            {trail.elevation ? `${trail.elevation} %` : t('common.na')}
          </Text>
        </div>
        <div style={detailStyle}>
          <span style={iconStyle}>{ICONS.AMENITIES.DISTANCE}</span>
          <Text>
            {`${t('trail.distance')} ${
              trail.distance ? `${trail.distance} km` : t('common.na')
            }`}
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
          UNSAFE_className='trail-btn-back'
        >
          {t('common.close')}
        </Button>
      </ButtonGroup>
    </Dialog>
  );
};

export default TrailDetailsModal;
