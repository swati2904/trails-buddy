import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useAuth } from '../state/AuthContext';
import { getFavorites, getLists } from '../api/v1/user';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import Button from '../components/ui/Button';

const ProfilePage = () => {
  const { user, isAuthenticated, tokens, signOutSession } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [listsCount, setListsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [favorites, lists] = await Promise.all([
        getFavorites(tokens?.accessToken),
        getLists(tokens?.accessToken),
      ]);
      setFavoritesCount((favorites.items || []).length);
      setListsCount((lists.items || []).length);
    } catch (loadError) {
      if (shouldForceSignOut(loadError)) {
        signOutSession();
      }
      setError(getApiErrorMessage(loadError, 'Unable to load profile stats.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, signOutSession, tokens?.accessToken]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Trail profile</h1>
        {!isAuthenticated ? (
          <>
            <p className='page-subtitle'>Sign in to see your trail activity.</p>
            <Link to='/signin'>Go to sign in</Link>
          </>
        ) : (
          <>
            <p className='page-subtitle'>
              Explorer: {user?.displayName || 'Trail Buddy Member'}
            </p>
            <p className='page-subtitle'>Email: {user?.email || '-'}</p>
            {loading ? (
              <p className='page-subtitle'>Loading account stats...</p>
            ) : null}
            {!loading ? (
              <p className='page-subtitle'>Favorite trails: {favoritesCount}</p>
            ) : null}
            {!loading ? (
              <p className='page-subtitle'>Trail collections: {listsCount}</p>
            ) : null}
            {error ? <p className='error-copy'>{error}</p> : null}
            <div className='feature-actions'>
              <Link to='/my-favorites'>Open favorites</Link>
              <Link to='/my-lists'>Open collections</Link>
              <Button variant='ghost' onClick={signOutSession}>
                Sign out
              </Button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
};

export default ProfilePage;
