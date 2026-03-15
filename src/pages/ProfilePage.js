import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useAuth } from '../state/AuthContext';
import { getFavorites, getLists } from '../api/v1/user';
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
      setError(loadError.message || 'Unable to load profile stats.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, tokens?.accessToken]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Profile</h1>
        {!isAuthenticated ? (
          <>
            <p className='page-subtitle'>Sign in to view your profile.</p>
            <Link to='/signin'>Go to sign in</Link>
          </>
        ) : (
          <>
            <p className='page-subtitle'>
              Display name: {user?.displayName || 'User'}
            </p>
            <p className='page-subtitle'>Email: {user?.email || '-'}</p>
            {loading ? (
              <p className='page-subtitle'>Loading account stats...</p>
            ) : null}
            {!loading ? (
              <p className='page-subtitle'>Saved favorites: {favoritesCount}</p>
            ) : null}
            {!loading ? (
              <p className='page-subtitle'>Saved lists: {listsCount}</p>
            ) : null}
            {error ? <p className='error-copy'>{error}</p> : null}
            <div className='feature-actions'>
              <Link to='/my-favorites'>Open favorites</Link>
              <Link to='/my-lists'>Open lists</Link>
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
