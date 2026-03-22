import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import { getParkBySlug } from '../api/v1/parks';
import { searchTrails } from '../api/v1/trails';
import TrailExploreMap from '../components/Map/TrailExploreMap';
import { getApiErrorMessage } from '../api/v1/errorMessages';

const PARK_HERO_FALLBACK =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=60';

const ParkPage = () => {
  const { slug } = useParams();
  const [park, setPark] = useState(null);
  const [nearbyTrails, setNearbyTrails] = useState([]);
  const [activeTrailId, setActiveTrailId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getParkBySlug(slug);
        setPark(data);

        if (Array.isArray(data?.nearbyTrails) && data.nearbyTrails.length) {
          setNearbyTrails(data.nearbyTrails);
          setActiveTrailId(data.nearbyTrails?.[0]?.id || '');
          return;
        }

        const nearby = await searchTrails({
          q: data?.name,
          category: data?.category,
          sort: 'nearest',
          page: 1,
          pageSize: 8,
        });

        const items = Array.isArray(nearby?.items) ? nearby.items : [];
        setNearbyTrails(items);
        setActiveTrailId(items?.[0]?.id || '');
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load park details.'));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug]);

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
            {park.summary || 'No description available yet.'}
          </p>
          <div className='chip-row'>
            <Chip>{park.category || 'Park'}</Chip>
            {park.state ? <Chip>{park.state}</Chip> : null}
            <Chip>{(park.topTrails || []).length} trails</Chip>
          </div>
        </div>
      </Card>

      <Card>
        <h2>Park map preview</h2>
        <p className='page-subtitle'>Explore trails in and around this park.</p>
        <TrailExploreMap
          trails={nearbyTrails}
          activeTrailId={activeTrailId}
          onPickTrail={setActiveTrailId}
          markerLimit={120}
        />
      </Card>

      <Card>
        <h2>Top trails in this park</h2>
        {Array.isArray(park.topTrails) && park.topTrails.length > 0 ? (
          <div className='park-trails-list'>
            {park.topTrails.map((trail) => (
              <article key={trail.id} className='park-trail-row'>
                <div>
                  <h3>{trail.name}</h3>
                  <p className='page-subtitle'>
                    {trail.difficulty || 'general'} •{' '}
                    {Number(trail.rating) > 0
                      ? `${Number(trail.rating).toFixed(1)} rated`
                      : 'Not yet rated'}
                  </p>
                </div>
                <Link to={`/trail/${trail.slug}`}>
                  <Button variant='secondary'>View</Button>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className='page-subtitle'>
            No park-specific trails are available yet.
          </p>
        )}
      </Card>

      <Card>
        <h2>Nearby Trails</h2>
        {nearbyTrails.length ? (
          <div className='park-trails-list'>
            {nearbyTrails.map((trail) => (
              <article key={trail.id} className='park-trail-row'>
                <div>
                  <h3>{trail.name}</h3>
                  <p className='page-subtitle'>
                    {trail.parkCategory || 'Park'} • {trail.distanceKm || 0} km
                  </p>
                </div>
                <Link to={`/trail/${trail.slug}`}>
                  <Button variant='ghost'>Open</Button>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className='page-subtitle'>
            No trails found near this area yet. Try nearby alternatives from the
            Explore page.
          </p>
        )}
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}
    </section>
  );
};

export default ParkPage;
