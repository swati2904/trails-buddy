import React from 'react';
import { ActionButton, MenuTrigger, Menu, Item } from '@adobe/react-spectrum';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../Common/LanguageSelector';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(0);
  };

  return (
    <div className='d-flex justify-content-between align-items-center p-3'>
      <div className='d-flex align-items-center'>
        <div
          style={{
            fontWeight: '500',
            fontSize: '1.5rem',
            marginRight: '1rem',
            color: '#0078D4',
            textTransform: 'uppercase',
            fontStyle: 'italic',
          }}
        >
          {' '}
          {t('common.trail_buddy')}{' '}
        </div>
      </div>
      {<LanguageSelector />}
      {userEmail && (
        <MenuTrigger>
          <ActionButton isQuiet>
            <div
              className='btn btn-primary rounded-circle d-flex align-items-center justify-content-center'
              style={{
                width: '40px',
                height: '40px',
              }}
            >
              {userEmail[0].toUpperCase()}
            </div>
          </ActionButton>
          <Menu
            onAction={(key) => {
              if (key === 'logout') {
                handleLogout();
              }
            }}
          >
            <Item key='email'>{userEmail}</Item>
            <Item key='logout'>Logout</Item>
          </Menu>
        </MenuTrigger>
      )}
    </div>
  );
};

export default Header;
