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
    id: 'NATIONAL_PARK',
    title: 'National Parks',
    subtitle: 'Iconic landscapes and bucket-list routes.',
    queryValue: 'NATIONAL_PARK',
  },
  {
    id: 'STATE_PARK',
    title: 'State Parks',
    subtitle: 'Weekend escapes with approachable terrain.',
    queryValue: 'STATE_PARK',
  },
  {
    id: 'nearby',
    title: 'Nearby Trails',
    subtitle: 'Use your location to find what is closest today.',
    queryValue: 'nearby',
  },
];

const FALLBACK_TRAIL_IMAGE =
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=60';

const formatLocation = (trail) => {
  const raw = String(trail?.location || '').trim();
  if (raw) {
    return raw;
  }

  const parts = [trail?.city, trail?.state].filter(Boolean);
  return parts.join(', ') || 'Location unavailable';
};

const formatRating = (trail) => {
  const rating = Number(trail?.rating);
  const count = Number(trail?.reviewCount || trail?.rating?.count || 0);
  if (!Number.isFinite(rating) || rating <= 0) {
    return 'Not yet rated';
  }

  if (!Number.isFinite(count) || count <= 0) {
    return `${rating.toFixed(1)} rated`;
  }

  return `${rating.toFixed(1)} (${count})`;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [featuredPopular, setFeaturedPopular] = useState([]);
  const [featuredNearby, setFeaturedNearby] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] =
    useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadFeatured = async () => {
      setError('');

      try {
        const popularResult = await getFeaturedTrails({
          sort: 'relevance',
          pageSize: 6,
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
              sort: 'distance',
              radiusKm: 50,
              pageSize: 6,
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
      setHighlightedSuggestionIndex(-1);
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
          setHighlightedSuggestionIndex(-1);
        }
      } catch (loadError) {
        if (!cancelled) {
          setSuggestions([]);
          setHighlightedSuggestionIndex(-1);
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
      setError(
        'Location is unavailable in this browser. Search by ZIP or city.',
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude).toFixed(6);
        const lon = Number(position.coords.longitude).toFixed(6);
        navigate(
          `/nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&place=${encodeURIComponent('Current Location')}`,
        );
      },
      () => {
        setError(
          'Unable to access current location. Try searching by city, state, or ZIP.',
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      },
    );
  };

  const onPickSuggestion = (value) => {
    setSearchInput(value);
    setSuggestions([]);
    setHighlightedSuggestionIndex(-1);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const onSearchKeyDown = (event) => {
    if (!suggestions.length) {
      if (event.key === 'Escape') {
        setSuggestions([]);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedSuggestionIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedSuggestionIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      );
      return;
    }

    if (event.key === 'Enter' && highlightedSuggestionIndex >= 0) {
      event.preventDefault();
      onPickSuggestion(suggestions[highlightedSuggestionIndex].value);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setSuggestions([]);
      setHighlightedSuggestionIndex(-1);
    }
  };

  const homeSections = useMemo(() => {
    if (featuredNearby.length > 0) {
      return [
        {
          id: 'nearby',
          title: 'Explore near you',
          items: featuredNearby,
        },
        {
          id: 'popular',
          title: 'Popular this weekend',
          items: featuredPopular,
        },
      ];
    }

    return [
      {
        id: 'popular',
        title: 'Curated trail picks',
        items: featuredPopular,
      },
    ];
  }, [featuredNearby, featuredPopular]);

  return (
    <section className='home-page'>
      <div className='home-hero'>
        <div className='home-hero__overlay' />
        <div className='home-hero__content'>
          <Chip>Trail Discovery App</Chip>
          <h1 className='page-title'>Find your next great day outside</h1>
          <p className='page-subtitle'>
            Discover scenic routes, weekend escapes, and hidden favorites with
            map-first search built for real trail planning.
          </p>

          <form className='hero-search' onSubmit={onSearchSubmit}>
            <div className='search-input-stack'>
              <input
                id='home-search-input'
                value={searchInput}
                placeholder='Search trails, parks, or locations'
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={onSearchKeyDown}
                role='combobox'
                aria-autocomplete='list'
                aria-expanded={Boolean(suggestions.length)}
                aria-controls='home-search-suggestions'
                aria-activedescendant={
                  highlightedSuggestionIndex >= 0
                    ? `home-suggestion-${highlightedSuggestionIndex}`
                    : undefined
                }
                aria-label='Search trails, parks, or locations'
              />
              {loadingSuggestions ? (
                <p className='suggestion-note'>Finding suggestions...</p>
              ) : null}
              {!loadingSuggestions && suggestions.length > 0 ? (
                <ul
                  className='suggestions-panel'
                  id='home-search-suggestions'
                  role='listbox'
                >
                  {suggestions.map((item, index) => (
                    <li
                      key={`${item.type}-${item.id || item.value || index}`}
                      id={`home-suggestion-${index}`}
                      role='option'
                      aria-selected={index === highlightedSuggestionIndex}
                    >
                      <button
                        type='button'
                        className={`suggestion-item ${index === highlightedSuggestionIndex ? 'suggestion-item--active' : ''}`.trim()}
                        onMouseEnter={() =>
                          setHighlightedSuggestionIndex(index)
                        }
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onPickSuggestion(item.value)}
                      >
                        <span>{item.label || item.value}</span>
                        <small>{item.type}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Button type='submit'>Start exploring</Button>
            <Button variant='secondary' onClick={onUseCurrentLocation}>
              Find trails near me
            </Button>
          </form>

          <div className='home-hero__quick-categories'>
            {PARK_CATEGORIES.map((category) =>
              category.id === 'nearby' ? (
                <button
                  key={category.id}
                  type='button'
                  className='home-quick-category'
                  onClick={onUseCurrentLocation}
                >
                  <h3>{category.title}</h3>
                  <p>{category.subtitle}</p>
                </button>
              ) : (
                <Link
                  key={category.id}
                  className='home-quick-category'
                  to={`/search?category=${encodeURIComponent(category.queryValue)}`}
                >
                  <h3>{category.title}</h3>
                  <p>{category.subtitle}</p>
                </Link>
              ),
            )}
          </div>
        </div>
      </div>

      {error ? <p className='error-copy'>{error}</p> : null}

      {homeSections.map((section) => (
        <section key={section.id} className='home-section'>
          <div className='home-section__head'>
            <h2>{section.title}</h2>
            <Link to={section.id === 'nearby' ? '/nearby' : '/explore'}>
              View all
            </Link>
          </div>
          <div className='trail-grid'>
            {section.items.map((trail) => (
              <Card key={`${section.id}-${trail.id}`} className='trail-card'>
                <img
                  className='trail-thumb'
                  src={trail.thumbnailUrl || FALLBACK_TRAIL_IMAGE}
                  alt={trail.name}
                  loading='lazy'
                />
                <div className='trail-card__content'>
                  <h3>{trail.name}</h3>
                  <p className='trail-card__park'>
                    {trail.parkName || 'Unknown park'}
                  </p>
                  <p className='trail-card__location'>
                    {formatLocation(trail)}
                  </p>
                  <div className='chip-row'>
                    <Chip tone='nature'>{trail.difficulty || 'general'}</Chip>
                    <Chip tone='sky'>{trail.distanceKm || 0} km</Chip>
                    <Chip tone='warm'>{formatRating(trail)}</Chip>
                  </div>
                </div>
                <div className='trail-card__actions'>
                  <Link to={`/trail/${trail.slug}`}>
                    <Button variant='secondary'>View trail</Button>
                  </Link>
                  {trail.parkSlug ? (
                    <Link to={`/parks/${trail.parkSlug}`}>
                      <Button variant='ghost'>Park details</Button>
                    </Link>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
};

export default HomePage;
