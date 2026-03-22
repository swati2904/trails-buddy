import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getListById, removeTrailFromList } from '../api/v1/user';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';

const ListDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, tokens, signOutSession } = useAuth();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const selected = await getListById(id, tokens?.accessToken);
      setList(selected || null);
    } catch (loadError) {
      if (shouldForceSignOut(loadError)) {
        signOutSession();
      }
      setError(getApiErrorMessage(loadError, 'Unable to load list details.'));
    } finally {
      setLoading(false);
    }
  }, [id, signOutSession, tokens?.accessToken]);

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
          (item) => item.trailId !== trailId,
        );
        return {
          ...current,
          trails: nextTrails,
          trailCount: nextTrails.length,
        };
      });
    } catch (removeError) {
      if (shouldForceSignOut(removeError)) {
        signOutSession();
      }
      setError(
        getApiErrorMessage(
          removeError,
          'Unable to remove trail from this list.',
        ),
      );
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
          {trails.length} saved trails • {list.isPublic ? 'Public' : 'Private'}
        </p>
      </Card>

      {error ? (
        <p className='error-copy' role='alert'>
          {error}
        </p>
      ) : null}

      <div className='cards-grid'>
        {trails.map((trail) => {
          return (
            <Card key={`${list.id}-${trail.trailId}`}>
              {trail.thumbnailUrl ? (
                <img
                  className='trail-thumb'
                  src={trail.thumbnailUrl}
                  alt={trail.name || trail.trailId}
                />
              ) : null}
              <h2>{trail.name || trail.trailId}</h2>
              <p>
                {trail.location || 'Location details available in trail view'}
              </p>
              <div className='feature-actions'>
                {trail.slug ? (
                  <Link to={`/trail/${trail.slug}`}>View trail</Link>
                ) : null}
                <Button
                  variant='ghost'
                  onClick={() => onRemove(trail.trailId)}
                  aria-label={`Remove ${trail.name || 'trail'} from ${list.name}`}
                >
                  Remove trail
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
