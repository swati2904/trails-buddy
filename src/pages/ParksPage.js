import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import { searchParks } from '../api/v1/parks';
import { useDiscoveryState } from '../state/useDiscoveryState';
import { getApiErrorMessage } from '../api/v1/errorMessages';

const FALLBACK_PARK_IMAGE =
  'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1400&q=60';

const onImageError = (event) => {
  if (event.currentTarget.dataset.fallbackApplied === 'true') {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = FALLBACK_PARK_IMAGE;
};

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
          state: state.stateCode,
          city: state.city,
          zipCode: state.zipCode,
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
  }, [state.city, state.page, state.query, state.stateCode, state.zipCode]);

  const pageSummary = useMemo(() => {
    if (loading) {
      return 'Loading parks...';
    }
    return `${items.length} parks found`;
  }, [items.length, loading]);

  return (
    <section className='page-block parks-page'>
      <Card>
        <h1 className='page-title'>Explore U.S. National Parks</h1>
        <p className='page-subtitle'>{pageSummary}</p>
        <div className='filter-row filter-row--search-secondary'>
          <input
            value={state.query}
            placeholder='Search by park name'
            onChange={(event) => setParam('q', event.target.value)}
          />

          <input
            value={state.city || ''}
            placeholder='City'
            onChange={(event) => setParam('city', event.target.value)}
          />

          <input
            value={state.zipCode || ''}
            placeholder='ZIP'
            onChange={(event) => setParam('zip', event.target.value)}
          />

          <input
            value={state.stateCode}
            placeholder='State (e.g. CA)'
            onChange={(event) =>
              setParam('state', event.target.value.toUpperCase())
            }
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
            <Card key={park.id} className='park-card'>
              <img
                className='trail-thumb'
                src={park.heroImageUrl || FALLBACK_PARK_IMAGE}
                alt={park.name}
                loading='lazy'
                onError={onImageError}
              />
              <h2>{park.name}</h2>
              <p className='page-subtitle'>
                {park.summary || 'Park overview coming soon.'}
              </p>
              <div className='chip-row'>
                <Chip tone='nature'>{park.category}</Chip>
                {park.state ? <Chip tone='sky'>{park.state}</Chip> : null}
                {park.zipCode ? (
                  <Chip tone='warm'>ZIP {park.zipCode}</Chip>
                ) : null}
              </div>
              <div className='feature-actions'>
                <Link to={`/parks/${park.slug}`}>
                  <Button variant='ghost'>Park details</Button>
                </Link>
                <Link to={`/search?q=${encodeURIComponent(park.name)}`}>
                  <Button variant='secondary'>Search nearby parks</Button>
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
