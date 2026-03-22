import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import { getFeaturedTrails } from '../api/v1/trails';
import { getSearchSuggestions } from '../api/v1/discovery';
import { getApiErrorMessage } from '../api/v1/errorMessages';

const PARK_CATEGORIES = [
  {
    id: 'national',
    title: 'National Parks',
    subtitle: 'Iconic landscapes and destination-worthy trails.',
    queryValue: 'National Parks',
  },
  {
    id: 'state',
    title: 'State Parks',
    subtitle: 'Weekender favorites with approachable trail systems.',
    queryValue: 'State Parks',
  },
  {
    id: 'regional',
    title: 'Regional Parks',
    subtitle: 'Quick local escapes and everyday discovery loops.',
    queryValue: 'Regional Parks',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [featuredPopular, setFeaturedPopular] = useState([]);
  const [featuredNearby, setFeaturedNearby] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
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
              setFeaturedNearby([]);
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

  useEffect(() => {
    if (!searchInput || searchInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await getSearchSuggestions({
          q: searchInput.trim(),
          limit: 7,
        });

        if (!cancelled) {
          setSuggestions(Array.isArray(response?.items) ? response.items : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingSuggestions(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    const query = trimmed ? `?q=${encodeURIComponent(trimmed)}` : '';
    navigate(`/search${query}`);
  };

  const onUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is unavailable in this browser. Search by ZIP or city.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude).toFixed(6);
        const lon = Number(position.coords.longitude).toFixed(6);
        navigate(`/nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&place=${encodeURIComponent('Current Location')}`);
      },
      () => {
        setError('Unable to access current location. Try searching by city, state, or ZIP.');
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      },
    );
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
        <h1 className='page-title'>Discover Trails Across U.S. Parks</h1>
        <p className='page-subtitle'>
          Search by ZIP, city, state, park name, or trail name. Browse National,
          State, and Regional Parks with list + map discovery.
        </p>

        <form className='discovery-search' onSubmit={onSearchSubmit}>
          <div className='search-input-stack'>
            <input
              value={searchInput}
              placeholder='Search by ZIP, city, state, park, or trail'
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label='Search trails'
            />
            {loadingSuggestions ? (
              <p className='suggestion-note'>Finding suggestions...</p>
            ) : null}
            {!loadingSuggestions && suggestions.length > 0 ? (
              <div className='suggestions-panel'>
                {suggestions.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    type='button'
                    className='suggestion-item'
                    onClick={() => {
                      setSearchInput(item.value);
                      navigate(`/search?q=${encodeURIComponent(item.value)}`);
                    }}
                  >
                    <span>{item.label}</span>
                    <small>{item.type}</small>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className='home-search-actions'>
            <Button type='submit'>Search Trails</Button>
            <Button variant='secondary' onClick={onUseCurrentLocation}>
              Use Current Location
            </Button>
          </div>
        </form>

        <div className='chip-row'>
          <Chip>ZIP</Chip>
          <Chip>City</Chip>
          <Chip>State</Chip>
          <Chip>Park Name</Chip>
          <Chip>Trail Name</Chip>
          <Chip>AI-Ready Smart Search</Chip>
        </div>
      </div>

      <div className='category-grid'>
        {PARK_CATEGORIES.map((category) => (
          <Card key={category.id} className='category-card'>
            <h2>{category.title}</h2>
            <p>{category.subtitle}</p>
            <div className='feature-actions'>
              <Link to={`/search?category=${encodeURIComponent(category.queryValue)}`}>
                <Button variant='ghost'>Explore Trails</Button>
              </Link>
              <Link to={`/parks?category=${encodeURIComponent(category.queryValue)}`}>
                <Button variant='secondary'>Browse Parks</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2>Future AI Discovery</h2>
        <p className='page-subtitle'>
          Planned: natural language queries like "easy hikes near San Diego" and
          personalized recommendations by activity and difficulty.
        </p>
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}

      {homeSections.map((section) => (
        <section key={section.id}>
          <h2>{section.title}</h2>
          <div className='cards-grid'>
            {section.items.map((trail) => (
              <Card key={`${section.id}-${trail.id}`}>
                <img className='trail-thumb' src={trail.thumbnailUrl} alt={trail.name} />
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
