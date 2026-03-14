import React from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../state/AuthContext';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Profile</h1>
        {!isAuthenticated ? (
          <p className='page-subtitle'>Sign in to view your profile.</p>
        ) : (
          <>
            <p className='page-subtitle'>Display name: {user?.displayName || 'User'}</p>
            <p className='page-subtitle'>Email: {user?.email || '-'}</p>
          </>
        )}
      </Card>
    </section>
  );
};

export default ProfilePage;
