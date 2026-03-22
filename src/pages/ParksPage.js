import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import { searchParks } from '../api/v1/parks';
import { useDiscoveryState } from '../state/useDiscoveryState';
import { getApiErrorMessage } from '../api/v1/errorMessages';

const ParksPage = () => {
  const { state, setParam } = useDiscoveryState();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await searchParks({
          q: state.query.trim(),
          category: state.category,
          state: state.stateCode,
          page: state.page,
          pageSize: 18,
        });

        setItems(Array.isArray(result?.items) ? result.items : []);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load parks.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [state.category, state.page, state.query, state.stateCode]);

  const pageSummary = useMemo(() => {
    if (loading) {
      return 'Loading parks...';
    }
    return `${items.length} parks found`;
  }, [items.length, loading]);

  return (
    <section className='page-block'>
      <Card>
        <h1 className='page-title'>Browse U.S. Parks</h1>
        <p className='page-subtitle'>{pageSummary}</p>
        <div className='filter-row filter-row--search-secondary'>
          <input
            value={state.query}
            placeholder='Search parks by name, city, state, or ZIP'
            onChange={(event) => setParam('q', event.target.value)}
          />

          <select
            value={state.category}
            onChange={(event) => setParam('category', event.target.value)}
          >
            <option value=''>All Categories</option>
            <option value='National Parks'>National Parks</option>
            <option value='State Parks'>State Parks</option>
            <option value='Regional Parks'>Regional Parks</option>
          </select>

          <input
            value={state.stateCode}
            placeholder='State (e.g. CA)'
            onChange={(event) => setParam('state', event.target.value.toUpperCase())}
            maxLength={2}
          />
        </div>
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}

      {loading ? (
        <Card>
          <Skeleton lines={6} />
        </Card>
      ) : (
        <div className='cards-grid'>
          {items.map((park) => (
            <Card key={park.id}>
              <img className='trail-thumb' src={park.heroImageUrl} alt={park.name} />
              <h2>{park.name}</h2>
              <p className='page-subtitle'>{park.summary || 'Park overview coming soon.'}</p>
              <div className='chip-row'>
                <Chip>{park.category}</Chip>
                {park.state ? <Chip>{park.state}</Chip> : null}
                <Chip>{(park.topTrails || []).length} trails</Chip>
              </div>
              <div className='feature-actions'>
                <Link to={`/parks/${park.slug}`}>
                  <Button variant='ghost'>Open Park</Button>
                </Link>
                <Link
                  to={`/search?category=${encodeURIComponent(park.category)}&q=${encodeURIComponent(park.name)}`}
                >
                  <Button variant='secondary'>Find Nearby Trails</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default ParksPage;
