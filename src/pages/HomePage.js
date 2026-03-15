import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import { searchTrails } from '../api/v1/trails';
import { getApiErrorMessage } from '../api/v1/errorMessages';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFeatured = async () => {
      setError('');
      try {
        const result = await searchTrails({
          sort: 'popular',
          page: 1,
          pageSize: 3,
        });
        setFeatured(Array.isArray(result?.items) ? result.items : []);
      } catch (loadError) {
        setError(
          getApiErrorMessage(loadError, 'Unable to load featured trails.'),
        );
      }
    };

    loadFeatured();
  }, []);

  return (
    <section className='page-block'>
      <div className='home-hero'>
        <h1 className='page-title'>Discover Trails For Your Next Adventure</h1>
        <p className='page-subtitle'>
          Search trails by difficulty, distance, and local conditions, then save
          routes into custom trip lists.
        </p>
        <div className='feature-actions'>
          <Link to='/explore'>
            <Button>Start Exploring</Button>
          </Link>
          <Link to='/my-lists'>
            <Button variant='secondary'>Open Saved Lists</Button>
          </Link>
        </div>
      </div>

      {error ? <p className='error-copy'>{error}</p> : null}

      <div className='cards-grid'>
        {featured.map((trail) => (
          <Card key={trail.id}>
            <img
              className='trail-thumb'
              src={trail.thumbnailUrl}
              alt={trail.name}
            />
            <h2>{trail.name}</h2>
            <p>{trail.location}</p>
            <div className='chip-row'>
              <Chip>{trail.difficulty}</Chip>
              <Chip>{trail.distanceKm} km</Chip>
              <Chip>{trail.rating} stars</Chip>
            </div>
            <Link to={`/trail/${trail.slug}`}>
              <Button variant='ghost'>View Trail</Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default HomePage;
