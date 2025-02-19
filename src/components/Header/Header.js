import React from 'react';
import { ActionButton, MenuTrigger, Menu, Item } from '@adobe/react-spectrum';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../Common/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Button } from '@adobe/react-spectrum';
import introJs from 'intro.js';

export const Walkthrough = () => {
  const startIntro = () => {
    introJs()
      .setOptions({
        steps: [
          {
            intro: "Welcome to Trail Buddy! Let's take a quick tour.",
          },
          {
            element: document.querySelector('.trail-language-selector'),
            intro: 'Select a language from here.',
          },
          {
            element: document.querySelector('.trail-difficulty-filter'),
            intro: 'Use this filter to select trails based on difficulty.',
          },
          {
            element: document.querySelector('.trail-location'),
            intro: 'Click here to center the map on your location.',
          },
          {
            element: document.querySelector('.trail-btn-back'),
            intro: 'Click here to go back to the main page.',
          },
          {
            element: document.querySelector('.trail-weather'),
            intro:
              'Check the weather updates for the trail here. You can switch between different weather layers.',
          },
          {
            element: document.querySelector('.trail-review'),
            intro: 'Check the reviews and ratings of the trail here.',
          },
          {
            element: document.querySelector('.trail-btn-prev'),
            intro: 'Use these buttons to navigate the prev page comments.',
          },
          {
            element: document.querySelector('.trail-btn-next'),
            intro: 'Use these buttons to navigate the next page comments.',
          },
        ],
      })
      .start();
  };

  return (
    <Button
      UNSAFE_style={{
        backgroundColor: '#088df3',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '5px',
      }}
      onClick={() => startIntro()}
    >
      Walkthrough
    </Button>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(0);
  };

  return (
    <div
      className='header-container'
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        borderBottom: '1px solid #ddd',
      }}
    >
      <div
        className='trail-name'
        style={{
          fontWeight: '500',
          fontSize: '1.5rem',
          color: '#0078D4',
          textTransform: 'uppercase',
          fontStyle: 'italic',
        }}
      >
        {t('common.trail_buddy')}
      </div>

      <div
        className='header-actions'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <LanguageSelector />

        <Walkthrough />

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
    </div>
  );
};

export default Header;
