import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import { getParkBySlug, searchNearbyParks, searchParks } from '../api/v1/parks';
import { addVisitedPark, getVisitedParks } from '../api/v1/user';
import TrailExploreMap from '../components/Map/TrailExploreMap';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';

const PARK_HERO_FALLBACK =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60';

const onImageError = (event) => {
  if (event.currentTarget.dataset.fallbackApplied === 'true') {
    return;
  }

  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = PARK_HERO_FALLBACK;
};

const formatVisitDate = (value) => {
  if (!value) {
    return 'Date not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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

const hasCoordinate = (item) =>
  Number.isFinite(item?.lat) && Number.isFinite(item?.lon);

const formatCoord = (value) =>
  Number.isFinite(Number(value)) ? Number(value).toFixed(5) : 'N/A';

const ParkPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, tokens, signOutSession } = useAuth();
  const [park, setPark] = useState(null);
  const [nearbyParks, setNearbyParks] = useState([]);
  const [activeParkId, setActiveParkId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [visitStatus, setVisitStatus] = useState('idle');
  const [visitMessage, setVisitMessage] = useState('');
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [visitNote, setVisitNote] = useState('');
  const [visitsForPark, setVisitsForPark] = useState([]);
  const [lastStampCode, setLastStampCode] = useState('');
  const [viewerLat, setViewerLat] = useState(null);
  const [viewerLon, setViewerLon] = useState(null);
  const [routeMeta, setRouteMeta] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      return undefined;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViewerLat(pos.coords.latitude);
        setViewerLon(pos.coords.longitude);
      },
      () => {
        setViewerLat(null);
        setViewerLon(null);
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 12_000 },
    );

    return undefined;
  }, [slug]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      setRouteMeta(null);

      try {
        const data = await getParkBySlug(slug);
        let resolvedPark = data;

        if (!hasCoordinate(data)) {
          try {
            const fallback = await searchParks({
              q: data?.name || slug,
              page: 1,
              pageSize: 20,
            });
            const fallbackItems = Array.isArray(fallback?.items)
              ? fallback.items
              : [];
            const matched =
              fallbackItems.find((item) => item.slug === data.slug) ||
              fallbackItems.find((item) => item.id === data.id) ||
              fallbackItems.find((item) => item.name === data.name);
            if (matched && hasCoordinate(matched)) {
              resolvedPark = {
                ...data,
                lat: matched.lat,
                lon: matched.lon,
              };
            }
          } catch {
            // Keep rendering detail page even when coordinate fallback search fails.
          }
        }

        setPark(resolvedPark);

        if (hasCoordinate(resolvedPark)) {
          const nearby = await searchNearbyParks({
            lat: resolvedPark.lat,
            lon: resolvedPark.lon,
            radiusKm: 280,
            page: 1,
            pageSize: 8,
          });

          const nearbyItems = Array.isArray(nearby?.items)
            ? nearby.items.filter((item) => item.slug !== resolvedPark.slug)
            : [];

          setNearbyParks(nearbyItems);
          setActiveParkId(resolvedPark.id || '');
        } else {
          setNearbyParks([]);
          setActiveParkId(resolvedPark.id || '');
        }
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load park details.'));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug]);

  useEffect(() => {
    const loadVisitedParks = async () => {
      if (!isAuthenticated || !park?.id) {
        setVisitsForPark([]);
        return;
      }

      try {
        const result = await getVisitedParks(tokens?.accessToken);
        const visits = Array.isArray(result?.items)
          ? result.items.filter(
              (item) => String(item?.parkId) === String(park.id),
            )
          : [];
        setVisitsForPark(visits);
      } catch (loadError) {
        if (shouldForceSignOut(loadError)) {
          await signOutSession();
          return;
        }
        setVisitsForPark([]);
      }
    };

    loadVisitedParks();
  }, [isAuthenticated, park?.id, signOutSession, tokens?.accessToken]);

  const alreadyVisited = useMemo(
    () => visitsForPark.length > 0,
    [visitsForPark],
  );

  const markVisited = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setVisitMessage('Sign in to add this park to your passbook.');
      return;
    }

    if (!park?.id) {
      return;
    }

    setVisitStatus('saving');
    setVisitMessage('');

    try {
      const savedVisit = await addVisitedPark(
        {
          parkId: park.id,
          visitDate: visitDate ? new Date(visitDate).toISOString() : undefined,
          note: visitNote.trim(),
        },
        tokens?.accessToken,
      );

      setVisitsForPark((current) => [savedVisit, ...current]);
      setLastStampCode(savedVisit?.stampCode || '');
      setVisitStatus('saved');
      setVisitMessage('Stamped in your passbook. Adventure logged.');
    } catch (saveError) {
      if (shouldForceSignOut(saveError)) {
        setVisitStatus('error');
        setVisitMessage('Your session expired. Please sign in and try again.');
        await signOutSession();
        navigate('/signin');
        return;
      }
      setVisitStatus('error');
      setVisitMessage(
        getApiErrorMessage(saveError, 'Unable to save park visit.'),
      );
    }
  };

  if (loading) {
    return (
      <section className='page-block'>
        <Card>
          <Skeleton lines={7} />
        </Card>
      </section>
    );
  }

  if (!park) {
    return (
      <section className='page-block'>
        <Card>
          <h1 className='page-title'>Park Not Found</h1>
          <p className='page-subtitle'>The selected park is not available.</p>
        </Card>
      </section>
    );
  }

  const mapItems = [park, ...nearbyParks];
  const hasParkCoordinate = hasCoordinate(park);
  const hasMapData = mapItems.some(hasCoordinate);
  const showNearbySection = nearbyParks.length > 0;
  const hasViewerLocation =
    Number.isFinite(viewerLat) && Number.isFinite(viewerLon);

  const heroLocationLine =
    [park.city, park.state].filter(Boolean).join(', ') ||
    park.state ||
    'United States';

  return (
    <section className='park-detail-page'>
      <Card className='park-detail-hero'>
        <img
          className='trail-hero'
          src={park.heroImageUrl || PARK_HERO_FALLBACK}
          alt={park.name}
          loading='lazy'
          onError={onImageError}
        />
        <div className='trail-detail-hero__overlay' />
        <div className='trail-detail-hero__content'>
          <h1 className='page-title'>{park.name}</h1>
          <p className='page-subtitle'>{heroLocationLine}</p>
          <div className='chip-row chip-row--tight'>
            {showCategoryChip(park) ? (
              <Chip tone='nature'>{park.category}</Chip>
            ) : null}
            {park.state ? <Chip tone='sky'>{park.state}</Chip> : null}
            {park.zipCode ? <Chip tone='warm'>ZIP {park.zipCode}</Chip> : null}
            {alreadyVisited ? <Chip tone='warm'>Visited</Chip> : null}
          </div>
          <div className='feature-actions'>
            <Link to='/passbook'>Open passbook</Link>
            <Link to='/explore'>Back to explore</Link>
          </div>
          {visitMessage ? (
            <p className='page-subtitle'>{visitMessage}</p>
          ) : null}
          {lastStampCode ? (
            <p className='page-subtitle'>Digital stamp code: {lastStampCode}</p>
          ) : null}
        </div>
      </Card>

      <div className='park-detail-layout'>
        <div className='park-detail-layout__main'>
          <Card>
            <h2>Park story</h2>
            <p className='park-story__body'>
              {park.summary ||
                'Scenic trails, overlooks, and ranger programs make this park worth the trip. Add your visit to keep the memory in your passbook.'}
            </p>
          </Card>

          <Card className='park-route-card'>
            <div className='park-route-card__head'>
              <h2>Route map</h2>
              {hasParkCoordinate ? (
                <span className='ui-chip ui-chip--sky'>
                  End: {park.lat.toFixed(4)}, {park.lon.toFixed(4)}
                </span>
              ) : null}
            </div>
            <p className='page-subtitle'>
              {hasViewerLocation
                ? 'Showing route from your current location to the selected park pin.'
                : 'Allow location to show your route to this park.'}
            </p>
            <div className='park-route-meta'>
              <span className='ui-chip ui-chip--nature'>
                Start lat/lon: {formatCoord(viewerLat)}, {formatCoord(viewerLon)}
              </span>
              <span className='ui-chip ui-chip--warm'>
                End lat/lon: {formatCoord(park.lat)}, {formatCoord(park.lon)}
              </span>
              {routeMeta ? (
                <span className='ui-chip ui-chip--sky'>
                  Drive: {routeMeta.distanceKm.toFixed(1)} km •{' '}
                  {Math.max(1, Math.round(routeMeta.durationMin))} min
                </span>
              ) : null}
            </div>
            {hasMapData ? (
              <TrailExploreMap
                trails={mapItems}
                activeTrailId={activeParkId}
                onPickTrail={setActiveParkId}
                markerLimit={120}
                originLat={viewerLat}
                originLon={viewerLon}
                onRouteMetaChange={setRouteMeta}
              />
            ) : (
              <p className='page-subtitle park-route-card__empty'>
                Map data is not available for this park yet.
              </p>
            )}
          </Card>

          {visitsForPark.length ? (
            <Card>
              <h2>Your visits here</h2>
              <div className='park-trails-list'>
                {visitsForPark.map((visit, index) => (
                  <article
                    key={`${visit.visitId || 'visit'}-${visit.createdAt || visit.visitDate || 'date'}-${index}`}
                    className='park-trail-row'
                  >
                    <div>
                      <h3>{formatVisitDate(visit.visitDate)}</h3>
                      <p className='page-subtitle'>
                        {visit.note || 'No note added yet.'}
                      </p>
                    </div>
                    {visit.stampCode ? (
                      <Chip tone='warm'>{visit.stampCode}</Chip>
                    ) : null}
                  </article>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        <aside className='park-detail-layout__aside'>
          <Card>
            <h2>Mark this park as visited</h2>
            <p className='page-subtitle'>
              Add a date, save a note, and collect your digital stamp.
            </p>
            <form className='auth-form' onSubmit={markVisited}>
              <label>
                <span>Visit date</span>
                <input
                  type='date'
                  value={visitDate}
                  onChange={(event) => setVisitDate(event.target.value)}
                />
              </label>
              <label>
                <span>Memory note (optional)</span>
                <input
                  value={visitNote}
                  onChange={(event) => setVisitNote(event.target.value)}
                  placeholder='What made this park visit unforgettable?'
                  maxLength={280}
                />
              </label>
              <Button type='submit' disabled={visitStatus === 'saving'}>
                {!isAuthenticated
                  ? 'Sign in to stamp this park'
                  : visitStatus === 'saving'
                    ? 'Stamping park...'
                    : 'Add to passbook'}
              </Button>
            </form>
          </Card>

          {showNearbySection ? (
            <Card>
              <h2>Nearby parks to add next</h2>
              <div className='park-trails-list'>
                {nearbyParks.map((nearbyPark, index) => (
                  <article
                    key={`${nearbyPark.id || nearbyPark.slug || 'nearby'}-${nearbyPark.slug || 'park'}-${index}`}
                    className='park-trail-row'
                  >
                    <div>
                      <h3>{nearbyPark.name}</h3>
                      <p className='page-subtitle'>
                        {[nearbyPark.city, nearbyPark.state]
                          .filter(Boolean)
                          .join(', ') ||
                          nearbyPark.state ||
                          'United States'}
                      </p>
                    </div>
                    <Link to={`/parks/${nearbyPark.slug}`}>
                      <Button variant='secondary'>View park</Button>
                    </Link>
                  </article>
                ))}
              </div>
            </Card>
          ) : null}
        </aside>
      </div>

      {error ? <p className='error-copy'>{error}</p> : null}
    </section>
  );
};

export default ParkPage;
