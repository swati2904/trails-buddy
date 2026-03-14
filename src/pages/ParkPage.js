import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { getParkBySlug } from '../api/v1/parks';

const ParkPage = () => {
  const { slug } = useParams();
  const [park, setPark] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const data = await getParkBySlug(slug);
      setPark(data);
      setLoading(false);
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
      </Card>

      <Card>
        <h2>Top Trails</h2>
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
    </section>
  );
};

export default ParkPage;
