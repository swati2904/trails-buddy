import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { createList, getLists, removeTrailFromList } from '../api/v1/user';
import { useAuth } from '../state/AuthContext';
import { mockTrails } from '../data/mockTrails';

const trailNameIndex = mockTrails.reduce((acc, trail) => {
  acc[trail.id] = trail.name;
  return acc;
}, {});

const ListsPage = () => {
  const { tokens, isAuthenticated } = useAuth();
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
      setError(loadError.message || 'Unable to load lists.');
    } finally {
      setLoading(false);
    }
  }, [tokens?.accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }

    try {
      const created = await createList({ name: name.trim(), isPublic }, tokens?.accessToken);
      setItems((current) => [created, ...current]);
      setName('');
      setIsPublic(false);
    } catch (createError) {
      setError(createError.message || 'Unable to create list.');
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

          const nextTrails = (item.trails || []).filter((id) => id !== trailId);
          return {
            ...item,
            trails: nextTrails,
            trailCount: nextTrails.length,
          };
        }),
      );
    } catch (removeError) {
      setError(removeError.message || 'Unable to remove trail from list.');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className='page-block'>
        <Card>
          <h1 className='page-title'>My Lists</h1>
          <p className='page-subtitle'>Please sign in to create and manage lists.</p>
          <Link to='/signin'>Go to sign in</Link>
        </Card>
      </section>
    );
  }

  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>My Lists</h1>
        <p className='page-subtitle'>Build trip lists and organize trails by season or location.</p>
      </Card>

      <Card>
        <form className='auth-form' onSubmit={onCreate}>
          <label>
            <span>List name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className='checkbox-row'>
            <input
              type='checkbox'
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
            />
            <span>Make list public</span>
          </label>
          <Button>Create list</Button>
        </form>
      </Card>

      {loading ? <Card><p>Loading lists...</p></Card> : null}
      {error ? <p className='error-copy'>{error}</p> : null}

      <div className='cards-grid'>
        {items.map((item) => (
          <Card key={item.id}>
            <h2>{item.name}</h2>
            <p>
              {item.trailCount || 0} trails • {item.isPublic ? 'Public' : 'Private'}
            </p>
            <Link to={`/my-lists/${item.id}`}>Open list details</Link>
            {Array.isArray(item.trails) && item.trails.length > 0 ? (
              <div className='list-trails'>
                {item.trails.map((trailId) => (
                  <div key={`${item.id}-${trailId}`} className='list-trail-row'>
                    <span>{trailNameIndex[trailId] || trailId}</span>
                    <Button
                      variant='ghost'
                      onClick={() => onRemoveTrail(item.id, trailId)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className='page-subtitle'>No trails in this list yet.</p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ListsPage;
