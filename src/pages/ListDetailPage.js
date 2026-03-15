import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getLists, removeTrailFromList } from '../api/v1/user';
import { useAuth } from '../state/AuthContext';
import { mockTrails } from '../data/mockTrails';

const trailsById = mockTrails.reduce((acc, trail) => {
  acc[trail.id] = trail;
  return acc;
}, {});

const ListDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, tokens } = useAuth();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getLists(tokens?.accessToken);
      const selected =
        (result.items || []).find((item) => item.id === id) || null;
      setList(selected);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load list details.');
    } finally {
      setLoading(false);
    }
  }, [id, tokens?.accessToken]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    load();
  }, [isAuthenticated, load]);

  const trails = useMemo(() => list?.trails || [], [list?.trails]);

  const onRemove = async (trailId) => {
    try {
      await removeTrailFromList(id, trailId, tokens?.accessToken);
      setList((current) => {
        if (!current) {
          return current;
        }

        const nextTrails = (current.trails || []).filter(
          (item) => item !== trailId,
        );
        return {
          ...current,
          trails: nextTrails,
          trailCount: nextTrails.length,
        };
      });
    } catch (removeError) {
      setError(removeError.message || 'Unable to remove trail from this list.');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className='page-block'>
        <Card>
          <h1 className='page-title'>List Details</h1>
          <p className='page-subtitle'>Sign in to view this list.</p>
          <Link to='/signin'>Go to sign in</Link>
        </Card>
      </section>
    );
  }

  if (loading) {
    return (
      <section className='page-block'>
        <Card>
          <p className='page-subtitle'>Loading list...</p>
        </Card>
      </section>
    );
  }

  if (!list) {
    return (
      <section className='page-block'>
        <Card>
          <h1 className='page-title'>List Not Found</h1>
          <p className='page-subtitle'>The selected list is unavailable.</p>
          <Link to='/my-lists'>Back to lists</Link>
        </Card>
      </section>
    );
  }

  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>{list.name}</h1>
        <p className='page-subtitle'>
          {list.trailCount || trails.length} trails •{' '}
          {list.isPublic ? 'Public' : 'Private'}
        </p>
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}

      <div className='cards-grid'>
        {trails.map((trailId) => {
          const trail = trailsById[trailId];
          return (
            <Card key={`${list.id}-${trailId}`}>
              <h2>{trail?.name || trailId}</h2>
              <p>{trail?.location || 'Trail record from backend catalog'}</p>
              <div className='feature-actions'>
                {trail?.slug ? (
                  <Link to={`/trail/${trail.slug}`}>Open Trail</Link>
                ) : null}
                <Button variant='ghost' onClick={() => onRemove(trailId)}>
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

export default ListDetailPage;
