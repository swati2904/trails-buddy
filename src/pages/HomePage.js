import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import { getFeaturedTrails } from '../api/v1/trails';
import { getApiErrorMessage } from '../api/v1/errorMessages';

const PARK_CATEGORIES = [
  {
    id: 'national',
    title: 'National Parks',
    subtitle: 'Iconic landscapes and destination-worthy trails',
    queryValue: 'National Parks',
  },
  {
    id: 'state',
    title: 'State Parks',
    subtitle: 'Weekender favorites with approachable trail systems',
    queryValue: 'State Parks',
  },
  {
    id: 'regional',
    title: 'Regional Parks',
    subtitle: 'Quick local escapes and everyday discovery loops',
    queryValue: 'Regional Parks',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [featuredPopular, setFeaturedPopular] = useState([]);
  const [featuredNearby, setFeaturedNearby] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadFeatured = async () => {
      setError('');

      try {
        const popularResult = await getFeaturedTrails({
          sort: 'popular',
          pageSize: 4,
        });

        if (isMounted) {
          setFeaturedPopular(
            Array.isArray(popularResult?.items) ? popularResult.items : [],
          );
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            getApiErrorMessage(loadError, 'Unable to load featured trails.'),
          );
        }
      }

      if (!navigator.geolocation) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const nearbyResult = await getFeaturedTrails({
              sort: 'nearest',
              radiusKm: 50,
              pageSize: 4,
              lat: Number(position.coords.latitude),
              lon: Number(position.coords.longitude),
            });

            if (isMounted) {
              setFeaturedNearby(
                Array.isArray(nearbyResult?.items) ? nearbyResult.items : [],
              );
            }
          } catch (nearbyError) {
            if (isMounted) {
              setError(
                getApiErrorMessage(
                  nearbyError,
                  'Unable to load nearby featured trails.',
                ),
              );
            }
          }
        },
        () => {
          if (isMounted) {
            setFeaturedNearby([]);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 6000,
          maximumAge: 300000,
        },
      );
    };

    loadFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    const query = trimmed ? `?q=${encodeURIComponent(trimmed)}` : '';
    navigate(`/search${query}`);
  };

  const homeSections = useMemo(() => {
    if (featuredNearby.length > 0) {
      return [
        {
          id: 'nearby',
          title: 'Featured Nearby Trails',
          items: featuredNearby,
        },
        { id: 'popular', title: 'Popular This Week', items: featuredPopular },
      ];
    }

    return [{ id: 'popular', title: 'Popular Trails', items: featuredPopular }];
  }, [featuredNearby, featuredPopular]);

  return (
    <section className='page-block'>
      <div className='home-hero home-hero--discovery'>
        <h1 className='page-title'>Find Your Next Trail, Faster</h1>
        <p className='page-subtitle'>
          Discover trails across National, State, and Regional Parks by ZIP,
          city, state, park name, or trail name.
        </p>
        <form className='discovery-search' onSubmit={onSearchSubmit}>
          <input
            value={searchInput}
            placeholder='Search by ZIP, city, state, park, or trail'
            onChange={(event) => setSearchInput(event.target.value)}
            aria-label='Search trails'
          />
          <Button>Search Trails</Button>
        </form>
      </div>

      <div className='category-grid'>
        {PARK_CATEGORIES.map((category) => (
          <Card key={category.id} className='category-card'>
            <h2>{category.title}</h2>
            <p>{category.subtitle}</p>
            <Link
              to={`/search?category=${encodeURIComponent(category.queryValue)}`}
            >
              <Button variant='ghost'>Explore {category.title}</Button>
            </Link>
          </Card>
        ))}
      </div>

      {error ? <p className='error-copy'>{error}</p> : null}

      {homeSections.map((section) => (
        <section key={section.id}>
          <h2>{section.title}</h2>
          <div className='cards-grid'>
            {section.items.map((trail) => (
              <Card key={`${section.id}-${trail.id}`}>
                <img
                  className='trail-thumb'
                  src={trail.thumbnailUrl}
                  alt={trail.name}
                />
                <h3>{trail.name}</h3>
                <p>{trail.parkName}</p>
                <div className='chip-row'>
                  <Chip>{trail.parkCategory}</Chip>
                  <Chip>{trail.difficulty}</Chip>
                  <Chip>{trail.distanceKm} km</Chip>
                </div>
                <Link to={`/trail/${trail.slug}`}>
                  <Button variant='ghost'>View Trail</Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
};

export default HomePage;
