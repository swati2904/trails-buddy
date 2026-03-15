import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const ExplorePage = () => {
  const location = useLocation();
  const { isAuthenticated, tokens, signOutSession } = useAuth();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationNotice, setLocationNotice] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [activeTrailId, setActiveTrailId] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [geoState, setGeoState] = useState('idle');
  const requestedGeoRef = useRef(false);

  const query = params.get('q') || '';
  const difficulty = params.get('difficulty') || '';
  const sort = params.get('sort') || 'relevance';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next, { replace: true });
  };

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

  useEffect(() => {
    const run = async () => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery && !userLocation) {
        if (geoState === 'locating' || geoState === 'idle') {
          setLoading(true);
          return;
        }

        setItems([]);
        setActiveTrailId('');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const request = {
          difficulty,
          sort,
          page: 1,
          pageSize: 20,
        };

        if (trimmedQuery) {
          request.q = trimmedQuery;
        } else if (userLocation) {
          request.lat = userLocation.lat;
          request.lon = userLocation.lon;
          request.radiusKm = 75;
        }

        const result = await searchTrails({
          ...request,
        });
        const nextItems = Array.isArray(result?.items) ? result.items : [];
        setItems(nextItems);
        setActiveTrailId(nextItems?.[0]?.id || '');

        if (!trimmedQuery && userLocation && nextItems.length === 0) {
          setLocationNotice(
            'No nearby trails found for your current location.',
          );
        }
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load trails.'));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [query, difficulty, sort, userLocation, geoState]);

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
        <div className='filter-row'>
          <input
            value={query}
            placeholder='Search by ZIP, city, or state'
            onChange={(event) => setParam('q', event.target.value)}
          />
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
            value={sort}
            onChange={(event) => setParam('sort', event.target.value)}
          >
            <option value='relevance'>Relevance</option>
            <option value='distance'>Distance</option>
            <option value='rating'>Rating</option>
            <option value='popular'>Popular</option>
          </select>
        </div>
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}
      {locationNotice ? (
        <p className='page-subtitle'>{locationNotice}</p>
      ) : null}

      {!loading ? (
        <TrailExploreMap
          trails={items}
          activeTrailId={activeTrailId}
          onPickTrail={setActiveTrailId}
        />
      ) : null}

      {loading ? (
        <Card>
          <Skeleton lines={6} />
        </Card>
      ) : (
        <div className='cards-grid'>
          {items.map((trail) => (
            <Card
              key={trail.id}
              className={trail.id === activeTrailId ? 'ui-card--active' : ''}
            >
              <img
                className='trail-thumb'
                src={trail.thumbnailUrl}
                alt={trail.name}
                onMouseEnter={() => setActiveTrailId(trail.id)}
              />
              <h2>{trail.name}</h2>
              <p>{trail.location}</p>
              <div className='chip-row'>
                <Chip>{trail.difficulty}</Chip>
                <Chip>{trail.distanceKm} km</Chip>
                <Chip>{trail.rating} stars</Chip>
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
        </div>
      )}
    </section>
  );
};

export default ExplorePage;
