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
import ListAssignmentControl from '../components/ui/ListAssignmentControl';
import TrailExploreMap from '../components/Map/TrailExploreMap';
import { searchTrails } from '../api/v1/trails';
import {
  getFiltersMetadata,
  getSearchSuggestions,
  searchNearbyTrails,
} from '../api/v1/discovery';
import { addFavorite, getFavorites } from '../api/v1/user';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';
import { useDiscoveryState } from '../state/useDiscoveryState';

const PAGE_SIZE = 24;
const BASE_RADIUS_OPTIONS = [10, 25, 50, 100];

const ExplorePage = () => {
  const location = useLocation();
  const { isAuthenticated, tokens, signOutSession } = useAuth();
  const { state, setParam, patchParams, clearFilters } = useDiscoveryState();

  const [queryInput, setQueryInput] = useState(state.query || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationNotice, setLocationNotice] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [activeTrailId, setActiveTrailId] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [filtersMetadata, setFiltersMetadata] = useState(null);

  const requestedGeoRef = useRef(false);

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
        }
      } catch (loadError) {
        if (!cancelled) {
          setSuggestions([]);
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

  useEffect(() => {
    let cancelled = false;

    const loadFiltersMetadata = async () => {
      try {
        const metadata = await getFiltersMetadata({
          q: state.query.trim(),
        });
        if (!cancelled) {
          setFiltersMetadata(metadata);
        }
      } catch (loadError) {
        if (!cancelled) {
          setFiltersMetadata(null);
        }
      }
    };

    loadFiltersMetadata();

    return () => {
      cancelled = true;
    };
  }, [state.query]);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationNotice(
        'Location is unavailable in this browser. Search by ZIP or city.',
      );
      return;
    }

    setLocationNotice('Finding trails near your current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        patchParams({
          lat: Number(position.coords.latitude).toFixed(6),
          lon: Number(position.coords.longitude).toFixed(6),
          place: 'Current Location',
          q: '',
          page: 1,
        });
        setLocationNotice('Showing nearby trails for your current location.');
      },
      () => {
        setLocationNotice(
          'Location access was denied. Search by ZIP, city, state, park, or trail.',
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
    if (state.query.trim() || state.latitude || state.longitude) {
      return;
    }

    if (requestedGeoRef.current) {
      return;
    }

    requestedGeoRef.current = true;
    requestCurrentLocation();
  }, [requestCurrentLocation, state.latitude, state.longitude, state.query]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavoriteIds([]);
        return;
      }

      try {
        const result = await getFavorites(tokens?.accessToken);
        setFavoriteIds((result.items || []).map((item) => item.trailId));
      } catch (loadError) {
        if (shouldForceSignOut(loadError)) {
          signOutSession();
        }
      }
    };

    loadFavorites();
  }, [isAuthenticated, signOutSession, tokens?.accessToken]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const request = {
          q: state.query.trim(),
          category: state.category,
          difficulty: state.difficulty,
          activity: state.activity,
          routeType: state.routeType,
          state: state.stateCode,
          radiusKm: state.radiusKm,
          sort: state.sort === 'most-relevant' ? 'relevance' : state.sort,
          page: state.page,
          pageSize: PAGE_SIZE,
        };

        const hasCoordinates = Boolean(state.latitude && state.longitude);
        if (hasCoordinates && !request.q) {
          request.lat = Number(state.latitude);
          request.lon = Number(state.longitude);
        }

        const result =
          hasCoordinates && !request.q
            ? await searchNearbyTrails(request)
            : await searchTrails(request);

        const nextItems = Array.isArray(result?.items) ? result.items : [];
        setItems(nextItems);
        setActiveTrailId((current) => current || nextItems?.[0]?.id || '');
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load trails.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    state.activity,
    state.category,
    state.difficulty,
    state.latitude,
    state.longitude,
    state.page,
    state.query,
    state.radiusKm,
    state.routeType,
    state.sort,
    state.stateCode,
  ]);

  const summary = useMemo(() => {
    if (loading) {
      return 'Loading trails...';
    }

    return `${items.length} trails found`;
  }, [items.length, loading]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (state.category) {
      list.push({ key: 'category', label: `Category: ${state.category}` });
    }
    if (state.difficulty) {
      list.push({
        key: 'difficulty',
        label: `Difficulty: ${state.difficulty}`,
      });
    }
    if (state.activity) {
      list.push({ key: 'activity', label: `Activity: ${state.activity}` });
    }
    if (state.routeType) {
      list.push({ key: 'routeType', label: `Route: ${state.routeType}` });
    }
    if (state.stateCode) {
      list.push({ key: 'state', label: `State: ${state.stateCode}` });
    }
    if (state.radiusKm && state.radiusKm !== '50') {
      list.push({ key: 'radiusKm', label: `Radius: ${state.radiusKm} km` });
    }
    if (state.sort && state.sort !== 'most-relevant') {
      list.push({ key: 'sort', label: `Sort: ${state.sort}` });
    }

    return list;
  }, [
    state.activity,
    state.category,
    state.difficulty,
    state.radiusKm,
    state.routeType,
    state.sort,
    state.stateCode,
  ]);

  const radiusOptions = useMemo(() => {
    const serverOptions = Array.isArray(filtersMetadata?.radiusOptionsKm)
      ? filtersMetadata.radiusOptionsKm
      : [];

    return Array.from(new Set([...BASE_RADIUS_OPTIONS, ...serverOptions])).sort(
      (a, b) => a - b,
    );
  }, [filtersMetadata?.radiusOptionsKm]);

  const pageHeading =
    location.pathname === '/search'
      ? 'Search Trails'
      : location.pathname === '/nearby'
        ? 'Nearby Trails'
        : 'Explore Trails';

  const resultsContext = state.query.trim()
    ? `Results for "${state.query.trim()}"`
    : state.placeLabel
      ? `Using ${state.placeLabel}`
      : 'Search by ZIP, city, state, park, or trail name.';

  const showList = state.view === 'split' || state.view === 'list';
  const showMap = state.view === 'split' || state.view === 'map';

  const onSave = async (trailId) => {
    if (!isAuthenticated) {
      setError('Sign in to save favorites.');
      return;
    }

    try {
      await addFavorite(trailId, tokens?.accessToken);
      setFavoriteIds((current) =>
        current.includes(trailId) ? current : [...current, trailId],
      );
    } catch (saveError) {
      if (shouldForceSignOut(saveError)) {
        signOutSession();
      }
      setError(getApiErrorMessage(saveError, 'Unable to save favorite.'));
    }
  };

  const onPickSuggestion = (value) => {
    patchParams({ q: value, lat: '', lon: '', place: '' });
    setQueryInput(value);
    setSuggestions([]);
  };

  return (
    <section className='page-block'>
      <Card className='explore-filters'>
        <h1 className='page-title'>{pageHeading}</h1>
        <p className='page-subtitle'>{summary}</p>
        <p className='page-subtitle'>{resultsContext}</p>

        <div className='filter-row filter-row--search-primary'>
          <div className='search-input-stack'>
            <input
              value={queryInput}
              placeholder='Search ZIP, city, state, park, or trail'
              onChange={(event) => setQueryInput(event.target.value)}
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
                    onClick={() => onPickSuggestion(item.value)}
                  >
                    <span>{item.label}</span>
                    <small>{item.type}</small>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <select
            value={state.category}
            onChange={(event) => setParam('category', event.target.value)}
          >
            <option value=''>All Park Categories</option>
            {(
              filtersMetadata?.categories || [
                'National Parks',
                'State Parks',
                'Regional Parks',
              ]
            ).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={state.sort}
            onChange={(event) => setParam('sort', event.target.value)}
          >
            <option value='most-relevant'>Most Relevant</option>
            <option value='nearest'>Nearest</option>
            <option value='easiest'>Easiest</option>
            <option value='shortest'>Shortest</option>
            <option value='longest'>Longest</option>
          </select>

          <div className='filter-toolbar-actions'>
            <Button
              variant={state.view === 'list' ? 'primary' : 'secondary'}
              onClick={() => setParam('view', 'list')}
            >
              List
            </Button>
            <Button
              variant={state.view === 'map' ? 'primary' : 'secondary'}
              onClick={() => setParam('view', 'map')}
            >
              Map
            </Button>
            <Button
              variant={state.view === 'split' ? 'primary' : 'secondary'}
              onClick={() => setParam('view', 'split')}
            >
              Split
            </Button>
            <Button variant='ghost' onClick={requestCurrentLocation}>
              Use Current Location
            </Button>
            <Button variant='ghost' onClick={clearFilters}>
              Reset
            </Button>
          </div>
        </div>

        <div className='filter-row filter-row--search-secondary'>
          <select
            value={state.difficulty}
            onChange={(event) => setParam('difficulty', event.target.value)}
          >
            <option value=''>All Difficulties</option>
            {(
              filtersMetadata?.difficulties || ['easy', 'moderate', 'hard']
            ).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={state.activity}
            onChange={(event) => setParam('activity', event.target.value)}
          >
            <option value=''>All Activities</option>
            {(
              filtersMetadata?.activities || [
                'hiking',
                'walking',
                'trail-running',
                'mountain-biking',
              ]
            ).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={state.routeType}
            onChange={(event) => setParam('routeType', event.target.value)}
          >
            <option value=''>Any Route Type</option>
            {(
              filtersMetadata?.routeTypes || [
                'out-and-back',
                'loop',
                'point-to-point',
              ]
            ).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={state.radiusKm}
            onChange={(event) => setParam('radiusKm', event.target.value)}
          >
            {radiusOptions.map((value) => (
              <option key={value} value={String(value)}>
                {value} km radius
              </option>
            ))}
          </select>

          <select
            value={state.stateCode}
            onChange={(event) => setParam('state', event.target.value)}
          >
            <option value=''>All States</option>
            {(filtersMetadata?.states || []).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {activeFilters.length ? (
          <div className='active-filter-row'>
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type='button'
                className='active-filter-chip'
                onClick={() => setParam(filter.key, '')}
              >
                {filter.label} ×
              </button>
            ))}
          </div>
        ) : null}
      </Card>

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
                  <h2>No trails match this search yet</h2>
                  <p className='page-subtitle'>
                    Try broadening your filters or search by a nearby city,
                    state, or park.
                  </p>
                  <div className='results-actions'>
                    <Button
                      variant='secondary'
                      onClick={() => setParam('radiusKm', '100')}
                    >
                      Expand Radius To 100 km
                    </Button>
                    <Button variant='ghost' onClick={clearFilters}>
                      Reset Filters
                    </Button>
                  </div>
                </Card>
              ) : null}

              {items.map((trail) => (
                <Card
                  key={trail.id}
                  className={
                    trail.id === activeTrailId ? 'ui-card--active' : ''
                  }
                >
                  <img
                    className='trail-thumb'
                    src={trail.thumbnailUrl}
                    alt={trail.name}
                    onMouseEnter={() => setActiveTrailId(trail.id)}
                    onClick={() => setActiveTrailId(trail.id)}
                  />
                  <h2>{trail.name}</h2>
                  <p>
                    {trail.parkName} · {trail.location}
                  </p>
                  <div className='chip-row'>
                    <Chip>{trail.parkCategory}</Chip>
                    <Chip>{trail.difficulty}</Chip>
                    <Chip>{trail.distanceKm} km</Chip>
                    {trail.routeType ? <Chip>{trail.routeType}</Chip> : null}
                    {trail.distanceFromSearchKm ? (
                      <Chip>
                        {trail.distanceFromSearchKm.toFixed(1)} km away
                      </Chip>
                    ) : null}
                  </div>
                  <div className='feature-actions'>
                    <Link to={`/trail/${trail.slug}`}>Open details</Link>
                    <Button variant='ghost' onClick={() => onSave(trail.id)}>
                      {favoriteIds.includes(trail.id) ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                  <ListAssignmentControl trailId={trail.id} />
                </Card>
              ))}

              {items.length >= PAGE_SIZE ? (
                <div className='results-actions'>
                  <Button
                    variant='secondary'
                    disabled={state.page <= 1}
                    onClick={() =>
                      setParam('page', String(Math.max(1, state.page - 1)))
                    }
                  >
                    Previous Page
                  </Button>
                  <Button
                    onClick={() => setParam('page', String(state.page + 1))}
                  >
                    Next Page
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {showMap ? (
            <div className='search-results-map'>
              <TrailExploreMap
                trails={items}
                activeTrailId={activeTrailId}
                onPickTrail={setActiveTrailId}
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
