import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { searchTrails } from '../api/v1/trails';
import { addFavorite } from '../api/v1/user';
import { useAuth } from '../state/AuthContext';

const ExplorePage = () => {
  const { isAuthenticated, tokens } = useAuth();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = params.get('q') || '';
  const difficulty = params.get('difficulty') || '';
  const sort = params.get('sort') || 'relevance';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next, { replace: true });
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await searchTrails({ q: query, difficulty, sort, page: 1, pageSize: 20 });
        setItems(result.items);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load trails.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [query, difficulty, sort]);

  const summary = useMemo(() => {
    if (loading) {
      return 'Loading trails...';
    }
    return `${items.length} trails found`;
  }, [items.length, loading]);

  const onSave = async (trailId) => {
    if (!isAuthenticated) {
      setError('Sign in to save favorites.');
      return;
    }

    try {
      await addFavorite(trailId, tokens?.accessToken);
    } catch (saveError) {
      setError(saveError.message || 'Unable to save favorite.');
    }
  };

  return (
    <section className='page-block'>
      <Card className='explore-filters'>
        <h1 className='page-title'>Explore Trails</h1>
        <p className='page-subtitle'>{summary}</p>
        <div className='filter-row'>
          <input
            value={query}
            placeholder='Search by trail or location'
            onChange={(event) => setParam('q', event.target.value)}
          />
          <select value={difficulty} onChange={(event) => setParam('difficulty', event.target.value)}>
            <option value=''>All Difficulties</option>
            <option value='easy'>Easy</option>
            <option value='moderate'>Moderate</option>
            <option value='hard'>Hard</option>
          </select>
          <select value={sort} onChange={(event) => setParam('sort', event.target.value)}>
            <option value='relevance'>Relevance</option>
            <option value='distance'>Distance</option>
            <option value='rating'>Rating</option>
            <option value='popular'>Popular</option>
          </select>
        </div>
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}

      {loading ? (
        <Card>
          <Skeleton lines={6} />
        </Card>
      ) : (
        <div className='cards-grid'>
          {items.map((trail) => (
            <Card key={trail.id}>
              <img className='trail-thumb' src={trail.thumbnailUrl} alt={trail.name} />
              <h2>{trail.name}</h2>
              <p>{trail.location}</p>
              <div className='chip-row'>
                <Chip>{trail.difficulty}</Chip>
                <Chip>{trail.distanceKm} km</Chip>
                <Chip>{trail.rating} stars</Chip>
              </div>
              <div className='feature-actions'>
                <Link to={`/trail/${trail.slug}`}>Open details</Link>
                <Button variant='ghost' onClick={() => onSave(trail.id)}>
                  Save
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default ExplorePage;
