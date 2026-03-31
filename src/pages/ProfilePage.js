import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../state/AuthContext';

const ProfilePage = () => {
  const { user, isAuthenticated, signOutSession } = useAuth();

  return (
    <section className='page-block profile-account-page page-shell'>
      <header className='page-shell__intro'>
        <p className='page-shell__eyebrow'>Account</p>
        <h1 className='page-shell__title'>Profile</h1>
        <p className='page-shell__lede'>
          Account and sign-in—your stamps and visits are on{' '}
          <Link to='/passbook'>Passbook</Link>.
        </p>
      </header>

      {!isAuthenticated ? (
        <Card>
          <p className='page-subtitle'>
            Sign in to sync visits, or create an account to start your
            passport.
          </p>
          <div className='feature-actions'>
            <Link to='/signin'>Sign in</Link>
            <Link to='/signup'>Create account</Link>
          </div>
        </Card>
      ) : (
        <Card className='profile-account-card'>
          <div className='profile-account-card__main'>
            <div>
              <p className='page-shell__eyebrow'>Signed in as</p>
              <p className='profile-account-name'>
                {user?.displayName || 'Park explorer'}
              </p>
              {user?.email ? (
                <p className='profile-account-email'>{user.email}</p>
              ) : null}
            </div>
            <div className='profile-account-card__actions'>
              <Link
                className='ui-btn ui-btn--primary ui-btn--md'
                to='/passbook'
              >
                Open passbook
              </Link>
              <Link
                className='ui-btn ui-btn--secondary ui-btn--md'
                to='/settings'
              >
                Settings
              </Link>
              <Button variant='ghost' onClick={signOutSession}>
                Log out
              </Button>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
};

export default ProfilePage;
