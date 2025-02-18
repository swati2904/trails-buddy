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
    <div className='d-flex justify-content-between align-items-center p-3'>
      <div className='d-flex align-items-center'>
        <div>Trail Buddy</div>
      </div>
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
