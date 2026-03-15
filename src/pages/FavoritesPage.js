import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getFavorites, removeFavorite } from '../api/v1/user';
import { mockTrails } from '../data/mockTrails';
import { useAuth } from '../state/AuthContext';

const FavoritesPage = () => {
  const { tokens, isAuthenticated } = useAuth();
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
      setError(loadError.message || 'Unable to load favorites.');
    } finally {
      setLoading(false);
    }
  }, [tokens?.accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const byTrailId = useMemo(() => {
    const index = new Map();
    mockTrails.forEach((trail) => {
      index.set(trail.id, trail);
    });
    return index;
  }, []);

  const onRemove = async (trailId) => {
    try {
      await removeFavorite(trailId, tokens?.accessToken);
      setItems((current) => current.filter((item) => item.trailId !== trailId));
    } catch (removeError) {
      setError(removeError.message || 'Unable to remove favorite.');
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
        <h1 className='page-title'>My Favorites</h1>
        <p className='page-subtitle'>
          Saved trails for quick access and planning.
        </p>
      </Card>

      {loading ? (
        <Card>
          <p>Loading favorites...</p>
        </Card>
      ) : null}
      {error ? <p className='error-copy'>{error}</p> : null}

      {!loading && !error && items.length === 0 ? (
        <Card>
          <p className='page-subtitle'>You have not saved any trails yet.</p>
          <Link to='/explore'>Find trails</Link>
        </Card>
      ) : null}

      <div className='cards-grid'>
        {items.map((item) => {
          const trail = byTrailId.get(item.trailId);
          return (
            <Card key={item.trailId}>
              <h2>{trail?.name || item.trailId}</h2>
              <p>{trail?.location || 'Trail info from backend catalog'}</p>
              {trail?.slug ? (
                <Link to={`/trail/${trail.slug}`}>Open Trail</Link>
              ) : null}
              <div className='feature-actions'>
                <Button variant='ghost' onClick={() => onRemove(item.trailId)}>
                  Remove
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
