import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import { getSearchSuggestions } from '../api/v1/discovery';
import { searchNearbyParks, searchParks } from '../api/v1/parks';
import { getApiErrorMessage } from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';
import { excerptPlainText } from '../utils/excerpt';

const FALLBACK_PARK_IMAGE =
  'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1400&q=60';

const onImageError = (event) => {
  if (event.currentTarget.dataset.fallbackApplied === 'true') {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = FALLBACK_PARK_IMAGE;
};

const formatParkLocation = (park) => {
  const cityState = [park?.city, park?.state].filter(Boolean).join(', ');
  if (cityState) {
    return cityState;
  }

  if (park?.state) {
    return park.state;
  }

  return 'U.S. National Park';
};

const showCategoryChip = (park) => {
  const cat = String(park?.category || '').trim();
  if (!cat) {
    return false;
  }
  const name = String(park?.name || '').toLowerCase();
  const catLower = cat.toLowerCase();
  if (catLower === 'national park' && name.includes('national park')) {
    return false;
  }
  return true;
};

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [featuredParks, setFeaturedParks] = useState([]);
  const [nearbyParks, setNearbyParks] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] =
    useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      setError('');

      try {
        const parksResponse = await searchParks({
          page: 1,
          pageSize: 6,
        });

        if (isMounted) {
          setFeaturedParks(
            Array.isArray(parksResponse?.items) ? parksResponse.items : [],
          );
        }
      } catch (loadError) {
        if (isMounted) {
          const isNetwork =
            loadError?.message === 'Failed to fetch' ||
            loadError?.name === 'TypeError';
          const message = isNetwork
            ? 'Cannot reach the park data service. Start the API (see README) or check your network, then refresh.'
            : getApiErrorMessage(
                loadError,
                'Unable to load national park highlights.',
              );
          setError(message);
        }
      }

      if (!navigator.geolocation) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const nearbyResult = await searchNearbyParks({
              lat: Number(position.coords.latitude),
              lon: Number(position.coords.longitude),
              radiusKm: 300,
              page: 1,
              pageSize: 4,
            });

            if (isMounted) {
              setNearbyParks(
                Array.isArray(nearbyResult?.items) ? nearbyResult.items : [],
              );
            }
          } catch (nearbyError) {
            if (isMounted) {
              setNearbyParks([]);
            }
          }
        },
        () => {
          if (isMounted) {
            setNearbyParks([]);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 6000,
          maximumAge: 300000,
        },
      );
    };

    loadHomeData();

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
          limit: 8,
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

  const passbookSummary = useMemo(() => {
    return isAuthenticated
      ? 'Keep every park memory in one place with stamps, visit dates, and notes.'
      : 'Sign in to start your digital park passport and collect your first stamp.';
  }, [isAuthenticated]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    const query = trimmed ? `?q=${encodeURIComponent(trimmed)}` : '';
    navigate(`/search${query}`);
  };

  const onUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError(
        'Location is unavailable in this browser. Search by ZIP, city, or state.',
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude).toFixed(6);
        const lon = Number(position.coords.longitude).toFixed(6);
        navigate(
          `/nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radiusKm=300&place=${encodeURIComponent('Current Location')}`,
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

  return (
    <section className='home-page'>
      <div className='home-hero home-hero--parks'>
        <div className='home-hero__overlay' />
        <div className='home-hero__content'>
          <p className='home-hero__kicker'>National Parks Explorer</p>
          <h1 className='page-title'>Explore U.S. National Parks</h1>
          <p className='page-subtitle'>
            Search by park name, state, city, ZIP, or nearby location and build
            your personal digital passbook.
          </p>

          <form className='hero-search' onSubmit={onSearchSubmit}>
            <div className='home-hero__panel'>
            <div className='search-input-stack'>
              <input
                id='home-search-input'
                value={searchInput}
                placeholder='Search parks'
                autoComplete='off'
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
                aria-label='Search parks by name, state, city, or ZIP'
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
            <div className='home-hero__cta-row'>
              <Button type='submit'>Explore parks</Button>
              <Button variant='secondary' onClick={onUseCurrentLocation}>
                Parks near me
              </Button>
            </div>
            </div>
          </form>
        </div>
      </div>

      {error ? <p className='home-error-banner'>{error}</p> : null}

      <section className='home-section'>
        <div className='home-section__head'>
          <h2>Featured National Parks</h2>
          <Link to='/explore'>See all parks</Link>
        </div>
        <div className='cards-grid'>
          {featuredParks.map((park) => (
            <Card key={park.id} className='park-card'>
              <img
                className='trail-thumb'
                src={park.heroImageUrl || FALLBACK_PARK_IMAGE}
                alt={park.name}
                loading='lazy'
                onError={onImageError}
              />
              <h3 className='park-card__title'>{park.name}</h3>
              <p className='park-card__excerpt'>
                {excerptPlainText(
                  park.summary ||
                    'Scenic trails, wildlife, and iconic landscapes worth the trip.',
                  176,
                )}
              </p>
              <div className='chip-row chip-row--tight'>
                {showCategoryChip(park) ? (
                  <Chip tone='nature'>{park.category}</Chip>
                ) : null}
                <Chip tone='sky'>{formatParkLocation(park)}</Chip>
                {park.zipCode ? (
                  <Chip tone='warm'>ZIP {park.zipCode}</Chip>
                ) : null}
              </div>
              <div className='feature-actions'>
                <Link to={`/parks/${park.slug}`}>View park</Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className='home-section'>
        <div className='home-section__head'>
          <h2>Parks Nearby</h2>
          <Link to='/nearby'>Open nearby search</Link>
        </div>
        {nearbyParks.length ? (
          <div className='cards-grid'>
            {nearbyParks.map((park) => (
              <Card key={`nearby-${park.id}`} className='park-card'>
                <img
                  className='trail-thumb'
                  src={park.heroImageUrl || FALLBACK_PARK_IMAGE}
                  alt={park.name}
                  loading='lazy'
                  onError={onImageError}
                />
                <h3 className='park-card__title'>{park.name}</h3>
                <p className='park-card__meta'>{formatParkLocation(park)}</p>
                <div className='feature-actions'>
                  <Link to={`/parks/${park.slug}`}>Park details</Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className='no-results-card'>
            <h3>No nearby parks found from your location.</h3>
            <p className='page-subtitle'>
              Try searching by city, ZIP code, or state to discover parks around
              your next trip.
            </p>
            <Button variant='secondary' onClick={onUseCurrentLocation}>
              Try location again
            </Button>
          </Card>
        )}
      </section>

      <div className='home-passbook-strip' role='region' aria-label='Passbook'>
        <p className='home-passbook-strip__text'>{passbookSummary}</p>
        <div className='home-passbook-strip__actions'>
          <Link to='/passbook'>Passbook</Link>
          {!isAuthenticated ? <Link to='/signup'>Sign up</Link> : null}
        </div>
      </div>
    </section>
  );
};

export default HomePage;
