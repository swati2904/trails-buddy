import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import ListAssignmentControl from '../components/ui/ListAssignmentControl';
import TrailExploreMap from '../components/Map/TrailExploreMap';
import { searchTrails } from '../api/v1/trails';
import { addFavorite, getFavorites } from '../api/v1/user';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';

const PAGE_SIZE = 30;

const applyClientSort = (items, sortMode) => {
  const next = [...items];

  switch (sortMode) {
    case 'nearest':
      return next.sort(
        (a, b) =>
          (a.distanceFromSearchKm ?? a.distanceKm ?? Number.MAX_VALUE) -
          (b.distanceFromSearchKm ?? b.distanceKm ?? Number.MAX_VALUE),
      );
    case 'easiest': {
      const rank = { easy: 1, moderate: 2, hard: 3 };
      return next.sort(
        (a, b) =>
          (rank[a.difficulty] || 99) - (rank[b.difficulty] || 99) ||
          (a.distanceKm || 0) - (b.distanceKm || 0),
      );
    }
    case 'shortest':
      return next.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    case 'longest':
      return next.sort((a, b) => (b.distanceKm || 0) - (a.distanceKm || 0));
    default:
      return next;
  }
};

const applyClientFilters = ({
  items,
  category,
  lengthBand,
  activityType,
  radiusKm,
}) => {
  return items.filter((trail) => {
    if (category && trail.parkCategory !== category) {
      return false;
    }

    if (
      activityType &&
      String(trail.activityType || '').toLowerCase() !==
        String(activityType).toLowerCase()
    ) {
      return false;
    }

    if (lengthBand) {
      const distance = Number(trail.distanceKm || 0);
      if (lengthBand === 'short' && distance > 5) {
        return false;
      }
      if (lengthBand === 'medium' && (distance <= 5 || distance > 12)) {
        return false;
      }
      if (lengthBand === 'long' && distance <= 12) {
        return false;
      }
    }

    if (radiusKm) {
      const radius = Number(radiusKm);
      const measuredDistance = Number(
        trail.distanceFromSearchKm ?? trail.distanceKm ?? Number.MAX_VALUE,
      );
      if (Number.isFinite(radius) && measuredDistance > radius) {
        return false;
      }
    }

    return true;
  });
};

const ExplorePage = () => {
  const location = useLocation();
  const { isAuthenticated, tokens, signOutSession } = useAuth();
  const [params, setParams] = useSearchParams();
  const [queryInput, setQueryInput] = useState(params.get('q') || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [locationNotice, setLocationNotice] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [activeTrailId, setActiveTrailId] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [geoState, setGeoState] = useState('idle');
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [visibleCardCount, setVisibleCardCount] = useState(18);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const requestedGeoRef = useRef(false);
  const itemsRef = useRef([]);
  const cardRefs = useRef({});

  const query = params.get('q') || '';
  const category = params.get('category') || '';
  const difficulty = params.get('difficulty') || '';
  const lengthBand = params.get('length') || '';
  const activityType = params.get('activity') || '';
  const radiusKm = params.get('radiusKm') || '50';
  const sort = params.get('sort') || 'most-relevant';

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params);
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const clearAllFilters = useCallback(() => {
    const next = new URLSearchParams();
    if (query.trim()) {
      next.set('q', query.trim());
    }
    next.set('sort', 'most-relevant');
    setParams(next, { replace: true });
  }, [query, setParams]);

  useEffect(() => {
    setQueryInput(query);
  }, [query]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (queryInput === query) {
        return;
      }

      setParam('q', queryInput.trim());
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, queryInput, setParam]);

  useEffect(() => {
    if (query.trim()) {
      setLocationNotice('');
      return;
    }

    if (userLocation || requestedGeoRef.current) {
      return;
    }

    if (!navigator.geolocation) {
      setGeoState('unsupported');
      setLocationNotice(
        'Location is unavailable in this browser. Search by ZIP or city.',
      );
      return;
    }

    requestedGeoRef.current = true;
    setGeoState('locating');
    setLocationNotice('Finding trails near your current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: Number(position.coords.latitude),
          lon: Number(position.coords.longitude),
        });
        setGeoState('ready');
        setLocationNotice('Showing nearby trails from your current location.');
      },
      () => {
        setGeoState('denied');
        setLocationNotice(
          'Location access was denied. Search by ZIP or city to find trails.',
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      },
    );
  }, [query, userLocation]);

  const fetchTrails = useCallback(
    async (nextPage = 1, append = false) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery && !userLocation) {
        if (geoState === 'locating' || geoState === 'idle') {
          setLoading(true);
          return;
        }

        setItems([]);
        setHasMorePages(false);
        setActiveTrailId('');
        setLoading(false);
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const request = {
          q: trimmedQuery,
          category,
          difficulty,
          length: lengthBand,
          activity: activityType,
          radiusKm,
          sort: sort === 'most-relevant' ? 'relevance' : sort,
          page: nextPage,
          pageSize: PAGE_SIZE,
        };

        if (!trimmedQuery && userLocation) {
          request.lat = userLocation.lat;
          request.lon = userLocation.lon;
        }

        const result = await searchTrails(request);
        const incomingItems = Array.isArray(result?.items) ? result.items : [];

        const mergedItems = append
          ? [...itemsRef.current, ...incomingItems]
          : incomingItems;
        const filteredItems = applyClientFilters({
          items: mergedItems,
          category,
          lengthBand,
          activityType,
          radiusKm,
        });
        const sortedItems = applyClientSort(filteredItems, sort);

        setItems(sortedItems);
        setActiveTrailId((current) => current || sortedItems?.[0]?.id || '');

        const total = Number(result?.total || sortedItems.length);
        setHasMorePages(nextPage * PAGE_SIZE < total);
        setPage(nextPage);

        if (!trimmedQuery && userLocation && sortedItems.length === 0) {
          setLocationNotice(
            'No nearby trails found for your current location.',
          );
        }
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load trails.'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      activityType,
      category,
      difficulty,
      geoState,
      lengthBand,
      query,
      radiusKm,
      sort,
      userLocation,
    ],
  );

  useEffect(() => {
    setVisibleCardCount(18);
    fetchTrails(1, false);
  }, [
    fetchTrails,
    query,
    category,
    difficulty,
    lengthBand,
    activityType,
    radiusKm,
    sort,
    userLocation,
    geoState,
  ]);

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
        setError(getApiErrorMessage(loadError, 'Unable to load favorites.'));
      }
    };

    loadFavorites();
  }, [isAuthenticated, signOutSession, tokens?.accessToken]);

  const summary = useMemo(() => {
    if (loading) {
      return 'Loading trails...';
    }
    return `${items.length} trails found`;
  }, [items.length, loading]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCardCount),
    [items, visibleCardCount],
  );

  const canRevealMoreCards = visibleCardCount < items.length;

  const activeFilters = useMemo(() => {
    const list = [];

    if (category) {
      list.push({ key: 'category', label: `Category: ${category}` });
    }
    if (difficulty) {
      list.push({ key: 'difficulty', label: `Difficulty: ${difficulty}` });
    }
    if (lengthBand) {
      list.push({ key: 'length', label: `Length: ${lengthBand}` });
    }
    if (activityType) {
      list.push({ key: 'activity', label: `Activity: ${activityType}` });
    }
    if (radiusKm && radiusKm !== '50') {
      list.push({ key: 'radiusKm', label: `Radius: ${radiusKm} km` });
    }
    if (sort && sort !== 'most-relevant') {
      list.push({ key: 'sort', label: `Sort: ${sort}` });
    }

    return list;
  }, [activityType, category, difficulty, lengthBand, radiusKm, sort]);

  const resultsContext = useMemo(() => {
    if (query.trim()) {
      return `Results for "${query.trim()}"`;
    }

    if (userLocation) {
      return 'Using your current location';
    }

    return 'Use search to discover trails by place, park, or trail name';
  }, [query, userLocation]);

  useEffect(() => {
    if (!activeTrailId) {
      return;
    }

    const element = cardRefs.current[activeTrailId];
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeTrailId]);

  const pageHeading =
    location.pathname === '/search'
      ? 'Search Trails'
      : location.pathname === '/nearby'
        ? 'Nearby Trails'
        : 'Explore Trails';

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

  return (
    <section className='page-block'>
      <Card className='explore-filters'>
        <h1 className='page-title'>{pageHeading}</h1>
        <p className='page-subtitle'>{summary}</p>
        <p className='page-subtitle'>{resultsContext}</p>

        <div className='filter-row filter-row--search-primary'>
          <input
            value={queryInput}
            placeholder='Search by ZIP, city, state, park, or trail'
            onChange={(event) => setQueryInput(event.target.value)}
          />
          <select
            value={category}
            onChange={(event) => setParam('category', event.target.value)}
          >
            <option value=''>All Park Categories</option>
            <option value='National Parks'>National Parks</option>
            <option value='State Parks'>State Parks</option>
            <option value='Regional Parks'>Regional Parks</option>
          </select>

          <select
            value={sort}
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
              variant='secondary'
              onClick={() => setShowMoreFilters((current) => !current)}
            >
              {showMoreFilters ? 'Hide Filters' : 'More Filters'}
            </Button>
            <Button variant='ghost' onClick={clearAllFilters}>
              Reset
            </Button>
          </div>
        </div>

        {showMoreFilters ? (
          <div className='filter-row filter-row--search-secondary'>
            <select
              value={difficulty}
              onChange={(event) => setParam('difficulty', event.target.value)}
            >
              <option value=''>All Difficulties</option>
              <option value='easy'>Easy</option>
              <option value='moderate'>Moderate</option>
              <option value='hard'>Hard</option>
            </select>
            <select
              value={lengthBand}
              onChange={(event) => setParam('length', event.target.value)}
            >
              <option value=''>Any Length</option>
              <option value='short'>Short (0-5 km)</option>
              <option value='medium'>Medium (5-12 km)</option>
              <option value='long'>Long (12+ km)</option>
            </select>
            <select
              value={activityType}
              onChange={(event) => setParam('activity', event.target.value)}
            >
              <option value=''>All Activities</option>
              <option value='hiking'>Hiking</option>
              <option value='walking'>Walking</option>
              <option value='trail-running'>Trail Running</option>
              <option value='mountain-biking'>Mountain Biking</option>
            </select>
            <select
              value={radiusKm}
              onChange={(event) => setParam('radiusKm', event.target.value)}
            >
              <option value='10'>10 km radius</option>
              <option value='25'>25 km radius</option>
              <option value='50'>50 km radius</option>
              <option value='100'>100 km radius</option>
            </select>
          </div>
        ) : null}

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
            <button
              type='button'
              className='active-filter-clear'
              onClick={clearAllFilters}
            >
              Clear all
            </button>
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
        <div className='search-results-layout'>
          <div className='search-results-list'>
            {!visibleItems.length ? (
              <Card className='no-results-card'>
                <h2>No trails match this search yet</h2>
                <p className='page-subtitle'>
                  Try broadening your filters or search in a nearby city, state,
                  or park.
                </p>
                <div className='results-actions'>
                  <Button
                    variant='secondary'
                    onClick={() => setParam('radiusKm', '100')}
                  >
                    Expand Radius To 100 km
                  </Button>
                  <Button variant='ghost' onClick={clearAllFilters}>
                    Reset Filters
                  </Button>
                </div>
              </Card>
            ) : null}

            {visibleItems.map((trail) => (
              <Card
                key={trail.id}
                className={trail.id === activeTrailId ? 'ui-card--active' : ''}
                ref={(element) => {
                  cardRefs.current[trail.id] = element;
                }}
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
                  {trail.distanceFromSearchKm ? (
                    <Chip>{trail.distanceFromSearchKm.toFixed(1)} km away</Chip>
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

            <div className='results-actions'>
              {canRevealMoreCards ? (
                <Button
                  variant='secondary'
                  onClick={() => setVisibleCardCount((count) => count + 12)}
                >
                  Load More Cards
                </Button>
              ) : null}
              {hasMorePages ? (
                <Button
                  onClick={() => fetchTrails(page + 1, true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading More Trails...' : 'Load More Results'}
                </Button>
              ) : null}
            </div>
          </div>

          <div className='search-results-map'>
            <TrailExploreMap
              trails={items}
              activeTrailId={activeTrailId}
              onPickTrail={setActiveTrailId}
              markerLimit={150}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ExplorePage;
