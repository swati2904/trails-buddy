import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import { getParkBySlug, searchNearbyParks } from '../api/v1/parks';
import { addVisitedPark, getVisitedParks } from '../api/v1/user';
import TrailExploreMap from '../components/Map/TrailExploreMap';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';

const PARK_HERO_FALLBACK =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60';

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

const ParkPage = () => {
  const { slug } = useParams();
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

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getParkBySlug(slug);
        setPark(data);

        if (Number.isFinite(data?.lat) && Number.isFinite(data?.lon)) {
          const nearby = await searchNearbyParks({
            lat: data.lat,
            lon: data.lon,
            radiusKm: 280,
            page: 1,
            pageSize: 8,
          });

          const nearbyItems = Array.isArray(nearby?.items)
            ? nearby.items.filter((item) => item.slug !== data.slug)
            : [];

          setNearbyParks(nearbyItems);
          setActiveParkId(nearbyItems?.[0]?.id || data.id || '');
        } else {
          setNearbyParks([]);
          setActiveParkId(data.id || '');
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
        await signOutSession();
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

  return (
    <section className='park-detail-page'>
      <Card className='park-detail-hero'>
        <img
          className='trail-hero'
          src={park.heroImageUrl || PARK_HERO_FALLBACK}
          alt={park.name}
          loading='lazy'
        />
        <div className='trail-detail-hero__overlay' />
        <div className='trail-detail-hero__content'>
          <h1 className='page-title'>{park.name}</h1>
          <p className='page-subtitle'>
            {[park.city, park.state].filter(Boolean).join(', ') ||
              park.state ||
              'United States'}{' '}
            • {park.category || 'National Park'}
          </p>
          <div className='chip-row'>
            <Chip tone='nature'>{park.category || 'National Park'}</Chip>
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

      <Card>
        <h2>Park story</h2>
        <p className='page-subtitle'>
          {park.summary ||
            'A beautiful stop on your national parks journey. Add your visit and keep the memory in your passbook.'}
        </p>
      </Card>

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
          <Button
            type='submit'
            disabled={visitStatus === 'saving' || !isAuthenticated}
          >
            {!isAuthenticated
              ? 'Sign in to stamp this park'
              : visitStatus === 'saving'
                ? 'Stamping park...'
                : 'Add to passbook'}
          </Button>
        </form>
      </Card>

      <Card>
        <h2>Map preview</h2>
        <p className='page-subtitle'>
          See this park in context and discover nearby national parks.
        </p>
        <TrailExploreMap
          trails={mapItems}
          activeTrailId={activeParkId}
          onPickTrail={setActiveParkId}
          markerLimit={120}
        />
      </Card>

      <Card>
        <h2>Nearby parks to add next</h2>
        {nearbyParks.length ? (
          <div className='park-trails-list'>
            {nearbyParks.map((nearbyPark) => (
              <article key={nearbyPark.id} className='park-trail-row'>
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
        ) : (
          <p className='page-subtitle'>
            Nearby park suggestions are unavailable for this location.
          </p>
        )}
      </Card>

      {visitsForPark.length ? (
        <Card>
          <h2>Your visits here</h2>
          <div className='park-trails-list'>
            {visitsForPark.map((visit) => (
              <article key={visit.visitId} className='park-trail-row'>
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

      {error ? <p className='error-copy'>{error}</p> : null}
    </section>
  );
};

export default ParkPage;
