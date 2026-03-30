import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { createList, getLists, removeTrailFromList } from '../api/v1/user';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';

const getTrailItemId = (trail) =>
  typeof trail === 'string' ? trail : trail?.trailId || trail?.id || '';

const getTrailItemLabel = (trail) =>
  typeof trail === 'string'
    ? trail
    : trail?.name || trail?.trailId || trail?.id || 'Trail';

const ListsPage = () => {
  const { tokens, isAuthenticated, signOutSession } = useAuth();
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getLists(tokens?.accessToken);
      setItems(result.items || []);
    } catch (loadError) {
      if (shouldForceSignOut(loadError)) {
        signOutSession();
      }
      setError(getApiErrorMessage(loadError, 'Unable to load lists.'));
    } finally {
      setLoading(false);
    }
  }, [signOutSession, tokens?.accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    try {
      const created = await createList(
        { name: name.trim(), isPublic },
        tokens?.accessToken,
      );
      setItems((current) => [created, ...current]);
      setName('');
      setIsPublic(false);
    } catch (createError) {
      if (shouldForceSignOut(createError)) {
        signOutSession();
      }
      setError(getApiErrorMessage(createError, 'Unable to create list.'));
    }
  };

  const onRemoveTrail = async (listId, trailId) => {
    try {
      await removeTrailFromList(listId, trailId, tokens?.accessToken);
      setItems((current) =>
        current.map((item) => {
          if (item.id !== listId) {
            return item;
          }

          const nextTrails = (item.trails || []).filter(
            (trail) => getTrailItemId(trail) !== trailId,
          );
          return {
            ...item,
            trails: nextTrails,
            trailCount: nextTrails.length,
          };
        }),
      );
    } catch (removeError) {
      if (shouldForceSignOut(removeError)) {
        signOutSession();
      }
      setError(
        getApiErrorMessage(removeError, 'Unable to remove trail from list.'),
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <section className='page-block lists-page'>
        <Card>
          <h1 className='page-title'>My Lists</h1>
          <p className='page-subtitle'>
            Please sign in to create and manage lists.
          </p>
          <Link to='/signin'>Go to sign in</Link>
        </Card>
      </section>
    );
  }

  return (
    <section className='page-block lists-page'>
      <Card className='lists-page__intro'>
        <h1 className='page-title'>Trail collections</h1>
        <p className='page-subtitle'>
          Build collections for weekend trips, seasonal goals, and future
          adventures.
        </p>
      </Card>

      <Card className='lists-page__create'>
        <form className='auth-form' onSubmit={onCreate}>
          <label>
            <span>List name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'lists-error' : undefined}
              required
            />
          </label>
          <label className='checkbox-row'>
            <input
              type='checkbox'
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
            />
            <span>Make list public</span>
          </label>
          <Button type='submit'>Create list</Button>
        </form>
      </Card>

      {loading ? (
        <Card>
          <p>Loading lists...</p>
        </Card>
      ) : null}
      {error ? (
        <p id='lists-error' className='error-copy' role='alert'>
          {error}
        </p>
      ) : null}

      <div className='cards-grid'>
        {items.map((item) => (
          <Card key={item.id} className='lists-page__card'>
            <h2>{item.name}</h2>
            <p>
              {item.trailCount || 0} trails •{' '}
              {item.isPublic ? 'Public' : 'Private'}
            </p>
            <Link to={`/my-lists/${item.id}`}>Open collection</Link>
            {Array.isArray(item.trails) && item.trails.length > 0 ? (
              <div className='list-trails'>
                {item.trails.map((trail) => {
                  const trailId = getTrailItemId(trail);
                  return (
                    <div
                      key={`${item.id}-${trailId}`}
                      className='list-trail-row'
                    >
                      <span>{getTrailItemLabel(trail)}</span>
                      <Button
                        variant='ghost'
                        onClick={() => onRemoveTrail(item.id, trailId)}
                        aria-label={`Remove ${getTrailItemLabel(trail)} from ${item.name}`}
                      >
                        Remove trail
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className='page-subtitle'>
                No trails here yet. Add one from Explore.
              </p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ListsPage;
