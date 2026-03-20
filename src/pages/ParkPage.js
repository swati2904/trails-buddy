import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import { getParkBySlug } from '../api/v1/parks';
import { searchTrails } from '../api/v1/trails';
import TrailExploreMap from '../components/Map/TrailExploreMap';
import { getApiErrorMessage } from '../api/v1/errorMessages';

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
    <section className='page-block'>
      <Card>
        <img className='trail-hero' src={park.heroImageUrl} alt={park.name} />
        <h1 className='page-title'>{park.name}</h1>
        <p className='page-subtitle'>{park.summary}</p>
        <div className='chip-row'>
          <Chip>{park.category}</Chip>
          {park.state ? <Chip>{park.state}</Chip> : null}
          <Chip>{park.topTrails.length} available trails</Chip>
        </div>
      </Card>

      <Card>
        <h2>Park Area Map</h2>
        <p className='page-subtitle'>
          View trails in and around the park area.
        </p>
        <TrailExploreMap
          trails={nearbyTrails}
          activeTrailId={activeTrailId}
          onPickTrail={setActiveTrailId}
          markerLimit={120}
        />
      </Card>

      <Card>
        <h2>Available Trails</h2>
        <ul className='link-list'>
          {park.topTrails.map((trail) => (
            <li key={trail.id}>
              <Link to={`/trail/${trail.slug}`}>
                {trail.name} ({trail.difficulty}, {trail.rating} stars)
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2>Nearby Trails</h2>
        <ul className='link-list'>
          {nearbyTrails.map((trail) => (
            <li key={trail.id}>
              <Link to={`/trail/${trail.slug}`}>
                {trail.name} ({trail.parkCategory}, {trail.distanceKm} km)
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}
    </section>
  );
};

export default ParkPage;
