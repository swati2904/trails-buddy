import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import TrailExploreMap from '../components/Map/TrailExploreMap';
import {
  getSearchSuggestions,
  searchNearbyParksBySearch,
} from '../api/v1/discovery';
import { searchParks } from '../api/v1/parks';
import { getApiErrorMessage } from '../api/v1/errorMessages';
import { useDiscoveryState } from '../state/useDiscoveryState';

const PAGE_SIZE = 24;
const BASE_RADIUS_OPTIONS = [25, 50, 100, 200, 300];
const PARK_PLACEHOLDER =
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=60';

const onImageError = (event) => {
  if (event.currentTarget.dataset.fallbackApplied === 'true') {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = PARK_PLACEHOLDER;
};

const formatLocation = (park) => {
  const cityState = [park?.city, park?.state].filter(Boolean).join(', ');
  if (cityState) {
    return cityState;
  }

  if (park?.state) {
    return park.state;
  }

  return 'U.S. National Park';
};

const ExplorePage = () => {
  const location = useLocation();
  const { state, setParam, patchParams, clearFilters } = useDiscoveryState();

  const [queryInput, setQueryInput] = useState(state.query || '');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationNotice, setLocationNotice] = useState('');
  const [activeParkId, setActiveParkId] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] =
    useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const requestedGeoRef = useRef(false);

  useEffect(() => {
    const syncFiltersPanel = () => {
      setIsMobileFiltersOpen(window.innerWidth >= 860);
    };

    syncFiltersPanel();
    window.addEventListener('resize', syncFiltersPanel);

    return () => {
      window.removeEventListener('resize', syncFiltersPanel);
    };
  }, []);

  useEffect(() => {
    setQueryInput(state.query || '');
  }, [state.query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (queryInput === state.query) {
        return;
      }

      patchParams({
        q: queryInput.trim(),
      });
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [patchParams, queryInput, state.query]);

  useEffect(() => {
    if (!state.query || state.query.trim().length < 2) {
      setSuggestions([]);
      setHighlightedSuggestionIndex(-1);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await getSearchSuggestions({
          q: state.query.trim(),
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
          setError(
            getApiErrorMessage(
              loadError,
              'Unable to load search suggestions right now.',
            ),
          );
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
  }, [state.query]);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationNotice(
        'Location is unavailable in this browser. Search by ZIP, city, or state.',
      );
      return;
    }

    setLocationNotice('Finding nearby national parks...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        patchParams({
          lat: Number(position.coords.latitude).toFixed(6),
          lon: Number(position.coords.longitude).toFixed(6),
          place: 'Current Location',
          page: 1,
        });
        setLocationNotice('Showing nearby parks for your current location.');
      },
      () => {
        setLocationNotice(
          'Location access was denied. Search by ZIP, city, state, or park name.',
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      },
    );
  }, [patchParams]);

  useEffect(() => {
    if (
      state.query.trim() ||
      state.stateCode ||
      state.city ||
      state.zipCode ||
      state.latitude ||
      state.longitude
    ) {
      return;
    }

    if (requestedGeoRef.current) {
      return;
    }

    requestedGeoRef.current = true;
    requestCurrentLocation();
  }, [
    requestCurrentLocation,
    state.city,
    state.latitude,
    state.longitude,
    state.query,
    state.stateCode,
    state.zipCode,
  ]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const request = {
          q: state.query.trim(),
          state: state.stateCode,
          city: state.city,
          zipCode: state.zipCode,
          sort: state.sort,
          page: state.page,
          pageSize: PAGE_SIZE,
        };

        const hasCoordinates = Boolean(state.latitude && state.longitude);
        const hasLocationFilters =
          Boolean(request.q) ||
          Boolean(request.state) ||
          Boolean(request.city) ||
          Boolean(request.zipCode);

        const result =
          hasCoordinates && !hasLocationFilters
            ? await searchNearbyParksBySearch({
                lat: Number(state.latitude),
                lon: Number(state.longitude),
                radiusKm: Number(state.radiusKm || '50'),
                page: state.page,
                pageSize: PAGE_SIZE,
              })
            : await searchParks(request);

        const nextItems = Array.isArray(result?.items) ? result.items : [];
        setItems(nextItems);
        setTotal(Number(result?.total || nextItems.length || 0));
        setActiveParkId((current) => current || nextItems?.[0]?.id || '');
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load parks.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    state.city,
    state.latitude,
    state.longitude,
    state.page,
    state.query,
    state.radiusKm,
    state.sort,
    state.stateCode,
    state.zipCode,
  ]);

  const summary = useMemo(() => {
    if (loading) {
      return 'Loading parks...';
    }

    return `${total || items.length} parks found`;
  }, [items.length, loading, total]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (state.stateCode) {
      list.push({ key: 'state', label: `State: ${state.stateCode}` });
    }
    if (state.city) {
      list.push({ key: 'city', label: `City: ${state.city}` });
    }
    if (state.zipCode) {
      list.push({ key: 'zip', label: `ZIP: ${state.zipCode}` });
    }
    if (state.radiusKm && state.radiusKm !== '50') {
      list.push({ key: 'radiusKm', label: `Radius: ${state.radiusKm} km` });
    }
    if (state.sort && state.sort !== 'relevance') {
      list.push({ key: 'sort', label: `Sort: ${state.sort}` });
    }

    return list;
  }, [state.city, state.radiusKm, state.sort, state.stateCode, state.zipCode]);

  const pageHeading =
    location.pathname === '/search'
      ? 'Search U.S. National Parks'
      : location.pathname === '/nearby'
        ? 'National Parks near you'
        : 'Explore U.S. National Parks';

  const resultsContext = state.query.trim()
    ? `Results for "${state.query.trim()}"`
    : state.placeLabel
      ? `Using ${state.placeLabel}`
      : 'Search by park name, state, city, ZIP, or nearby location.';

  const showList = state.view === 'split' || state.view === 'list';
  const showMap = state.view === 'split' || state.view === 'map';

  const onPickSuggestion = (value) => {
    patchParams({ q: value });
    setQueryInput(value);
    setSuggestions([]);
    setHighlightedSuggestionIndex(-1);
  };

  const onQueryKeyDown = (event) => {
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

  const pageCount = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));

  return (
    <section className='explore-page'>
      <Card className='explore-filters'>
        <div className='explore-headline'>
          <div>
            <h1 className='page-title'>{pageHeading}</h1>
            <p className='page-subtitle'>{summary}</p>
            <p className='page-subtitle'>{resultsContext}</p>
          </div>
          <button
            type='button'
            className='explore-filters-toggle'
            aria-expanded={isMobileFiltersOpen}
            aria-controls='explore-advanced-filters'
            onClick={() => setIsMobileFiltersOpen((current) => !current)}
          >
            {isMobileFiltersOpen ? 'Hide filters' : 'Show filters'}
          </button>
          <div className='explore-view-toggle'>
            <Button
              variant={state.view === 'list' ? 'primary' : 'secondary'}
              onClick={() => setParam('view', 'list')}
              aria-pressed={state.view === 'list'}
            >
              List
            </Button>
            <Button
              variant={state.view === 'map' ? 'primary' : 'secondary'}
              onClick={() => setParam('view', 'map')}
              aria-pressed={state.view === 'map'}
            >
              Map
            </Button>
            <Button
              variant={state.view === 'split' ? 'primary' : 'secondary'}
              onClick={() => setParam('view', 'split')}
              aria-pressed={state.view === 'split'}
            >
              Split
            </Button>
          </div>
        </div>

        <div className='filter-row filter-row--search-primary'>
          <div className='search-input-stack'>
            <input
              id='explore-search-input'
              value={queryInput}
              placeholder='Search by park name, state, city, or ZIP'
              onChange={(event) => setQueryInput(event.target.value)}
              onKeyDown={onQueryKeyDown}
              role='combobox'
              aria-autocomplete='list'
              aria-expanded={Boolean(suggestions.length)}
              aria-controls='explore-search-suggestions'
              aria-activedescendant={
                highlightedSuggestionIndex >= 0
                  ? `explore-suggestion-${highlightedSuggestionIndex}`
                  : undefined
              }
              aria-label='Search by park name, state, city, or ZIP'
            />
            {loadingSuggestions ? (
              <p className='suggestion-note'>Finding suggestions...</p>
            ) : null}
            {!loadingSuggestions && suggestions.length > 0 ? (
              <ul
                className='suggestions-panel'
                id='explore-search-suggestions'
                role='listbox'
              >
                {suggestions.map((item, index) => (
                  <li
                    key={`${item.type}-${item.id || item.value || index}`}
                    id={`explore-suggestion-${index}`}
                    role='option'
                    aria-selected={index === highlightedSuggestionIndex}
                  >
                    <button
                      type='button'
                      className={`suggestion-item ${index === highlightedSuggestionIndex ? 'suggestion-item--active' : ''}`.trim()}
                      onMouseEnter={() => setHighlightedSuggestionIndex(index)}
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

          <select
            aria-label='Sort search results'
            value={state.sort}
            onChange={(event) => setParam('sort', event.target.value)}
          >
            <option value='relevance'>Relevance</option>
            <option value='alphabetical'>Alphabetical</option>
          </select>

          <select
            aria-label='Search radius in kilometers'
            value={state.radiusKm}
            onChange={(event) => setParam('radiusKm', event.target.value)}
          >
            {BASE_RADIUS_OPTIONS.map((value) => (
              <option key={value} value={String(value)}>
                {value} km radius
              </option>
            ))}
          </select>

          <div className='filter-toolbar-actions'>
            <Button variant='ghost' onClick={requestCurrentLocation}>
              Use nearby
            </Button>
            <Button variant='ghost' onClick={clearFilters}>
              Reset
            </Button>
          </div>
        </div>

        <div
          id='explore-advanced-filters'
          className={`explore-filter-panel ${isMobileFiltersOpen ? 'explore-filter-panel--open' : 'explore-filter-panel--closed'}`}
        >
          <div className='filter-row filter-row--search-secondary'>
            <input
              value={state.city}
              placeholder='City'
              onChange={(event) => setParam('city', event.target.value)}
              aria-label='Filter by city'
            />

            <input
              value={state.zipCode}
              placeholder='ZIP code'
              onChange={(event) => setParam('zip', event.target.value)}
              aria-label='Filter by ZIP code'
            />

            <input
              value={state.stateCode}
              placeholder='State (e.g. CA)'
              onChange={(event) =>
                setParam('state', event.target.value.toUpperCase())
              }
              maxLength={2}
              aria-label='Filter by state'
            />
          </div>

          {activeFilters.length ? (
            <div className='active-filter-row'>
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type='button'
                  className='active-filter-chip'
                  onClick={() => setParam(filter.key, '')}
                  aria-label={`Remove ${filter.label}`}
                >
                  {filter.label} ×
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Card>

      <p className='sr-only' aria-live='polite'>
        {summary}. {resultsContext}
      </p>

      {error ? <p className='error-copy'>{error}</p> : null}
      {locationNotice ? (
        <p className='page-subtitle'>{locationNotice}</p>
      ) : null}

      {loading ? (
        <Card>
          <Skeleton lines={6} />
        </Card>
      ) : (
        <div
          className={`search-results-layout search-results-layout--${state.view}`}
        >
          {showList ? (
            <div className='search-results-list'>
              {!items.length ? (
                <Card className='no-results-card'>
                  <h2>No parks found for this search.</h2>
                  <p className='page-subtitle'>
                    Try a different park name, state, city, ZIP code, or nearby
                    location.
                  </p>
                  <div className='results-actions'>
                    <Button
                      variant='secondary'
                      onClick={() => setParam('radiusKm', '100')}
                    >
                      Expand radius to 100 km
                    </Button>
                    <Button variant='ghost' onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </div>
                </Card>
              ) : null}

              {items.map((park) => (
                <Card
                  key={park.id}
                  className={`search-trail-card ${park.id === activeParkId ? 'ui-card--active' : ''}`.trim()}
                >
                  <img
                    className='trail-thumb'
                    src={park.heroImageUrl || PARK_PLACEHOLDER}
                    alt={park.name}
                    loading='lazy'
                    onError={onImageError}
                    onMouseEnter={() => setActiveParkId(park.id)}
                    onClick={() => setActiveParkId(park.id)}
                  />
                  <div className='search-trail-card__body'>
                    <h2>{park.name}</h2>
                    <p className='search-trail-card__park'>{park.category}</p>
                    <p className='search-trail-card__meta'>
                      {formatLocation(park)}
                    </p>
                    <div className='chip-row'>
                      <Chip tone='nature'>
                        {park.category || 'National Park'}
                      </Chip>
                      {park.state ? <Chip tone='sky'>{park.state}</Chip> : null}
                      {park.zipCode ? (
                        <Chip tone='warm'>ZIP {park.zipCode}</Chip>
                      ) : null}
                      {park.distanceFromSearchKm ? (
                        <Chip tone='warm'>
                          {park.distanceFromSearchKm.toFixed(1)} km away
                        </Chip>
                      ) : null}
                    </div>
                    <p className='page-subtitle'>
                      {park.summary ||
                        'A destination worth adding to your park passbook.'}
                    </p>
                  </div>
                  <div className='feature-actions search-trail-card__actions'>
                    <Link to={`/parks/${park.slug}`}>View park</Link>
                  </div>
                </Card>
              ))}

              {pageCount > 1 ? (
                <div className='results-actions'>
                  <Button
                    variant='secondary'
                    disabled={state.page <= 1}
                    onClick={() =>
                      setParam('page', String(Math.max(1, state.page - 1)))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={state.page >= pageCount}
                    onClick={() =>
                      setParam(
                        'page',
                        String(Math.min(pageCount, state.page + 1)),
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {showMap ? (
            <div className='search-results-map'>
              <TrailExploreMap
                trails={items}
                activeTrailId={activeParkId}
                onPickTrail={setActiveParkId}
                markerLimit={120}
              />
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
};

export default ExplorePage;
