import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getFavorites, removeFavorite } from '../api/v1/user';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';

const FavoritesPage = () => {
  const { tokens, isAuthenticated, signOutSession } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getFavorites(tokens?.accessToken);
      setItems(result.items || []);
    } catch (loadError) {
      if (shouldForceSignOut(loadError)) {
        signOutSession();
      }
      setError(getApiErrorMessage(loadError, 'Unable to load favorites.'));
    } finally {
      setLoading(false);
    }
  }, [signOutSession, tokens?.accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const onRemove = async (trailId) => {
    try {
      await removeFavorite(trailId, tokens?.accessToken);
      setItems((current) => current.filter((item) => item.trailId !== trailId));
    } catch (removeError) {
      if (shouldForceSignOut(removeError)) {
        signOutSession();
      }
      setError(getApiErrorMessage(removeError, 'Unable to remove favorite.'));
    }
  };

  if (!isAuthenticated) {
    return (
      <section className='page-block'>
        <Card>
          <h1 className='page-title'>My Favorites</h1>
          <p className='page-subtitle'>
            Please sign in to manage your saved trails.
          </p>
          <Link to='/signin'>Go to sign in</Link>
        </Card>
      </section>
    );
  }

  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Favorite trails</h1>
        <p className='page-subtitle'>
          Your saved hikes, ready whenever adventure calls.
        </p>
      </Card>

      {loading ? (
        <Card>
          <p>Loading favorites...</p>
        </Card>
      ) : null}
      {error ? (
        <p className='error-copy' role='alert'>
          {error}
        </p>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <Card>
          <p className='page-subtitle'>
            No saved trails yet. Start with a scenic route nearby.
          </p>
          <Link to='/explore'>Browse trails</Link>
        </Card>
      ) : null}

      <div className='cards-grid'>
        {items.map((item) => {
          return (
            <Card key={item.trailId}>
              {item.thumbnailUrl ? (
                <img
                  className='trail-thumb'
                  src={item.thumbnailUrl}
                  alt={item.name || item.trailId}
                />
              ) : null}
              <h2>{item.name || item.trailId}</h2>
              <p>
                {item.location || 'Location details available in trail view'}
              </p>
              {item.slug ? (
                <Link to={`/trail/${item.slug}`}>View trail</Link>
              ) : null}
              <div className='feature-actions'>
                <Button
                  variant='ghost'
                  onClick={() => onRemove(item.trailId)}
                  aria-label={`Remove ${item.name || 'trail'} from favorites`}
                >
                  Remove from favorites
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default FavoritesPage;
