import React from 'react';
import {
  Flex,
  ActionButton,
  MenuTrigger,
  Menu,
  Item,
} from '@adobe/react-spectrum';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(0);
  };

  return (
    <Flex
      justifyContent='end'
      alignItems='center'
      gap='size-100'
      padding='size-100'
    >
      {userEmail && (
        <MenuTrigger>
          <ActionButton isQuiet>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#0070f3',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
    </Flex>
  );
};

export default Header;
