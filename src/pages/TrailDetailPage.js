import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Skeleton from '../components/ui/Skeleton';
import {
  createTrailReview,
  getTrailBySlug,
  getTrailReviews,
} from '../api/v1/trails';
import Button from '../components/ui/Button';
import ListAssignmentControl from '../components/ui/ListAssignmentControl';
import TrailRouteMap from '../components/Map/TrailRouteMap';
import { addFavorite } from '../api/v1/user';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import { useAuth } from '../state/AuthContext';

const TrailDetailPage = () => {
  const { isAuthenticated, tokens, signOutSession } = useAuth();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [trail, setTrail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [savedFavorite, setSavedFavorite] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const trailData = await getTrailBySlug(slug);
        setTrail(trailData);

        if (trailData) {
          const reviewData = await getTrailReviews(trailData.id, 1, 20);
          setReviews(reviewData.items);
        }
      } catch (loadError) {
        if (shouldForceSignOut(loadError)) {
          signOutSession();
        }
        setError(
          getApiErrorMessage(loadError, 'Unable to load trail details.'),
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [signOutSession, slug]);

  const submitReview = async () => {
    if (!trail || !comment.trim()) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    try {
      await createTrailReview(
        trail.id,
        {
          rating: 5,
          comment: comment.trim(),
          condition: 'good',
          activity: 'hiking',
        },
        tokens?.accessToken,
      );

      const refreshedReviews = await getTrailReviews(trail.id, 1, 20);
      setReviews(refreshedReviews.items || []);
      setComment('');
    } catch (submitError) {
      if (shouldForceSignOut(submitError)) {
        signOutSession();
      }
      setError(getApiErrorMessage(submitError, 'Unable to submit review.'));
    }
  };

  const onSaveFavorite = async () => {
    if (!trail || !isAuthenticated) {
      return;
    }
    try {
      await addFavorite(trail.id, tokens?.accessToken);
      setSavedFavorite(true);
    } catch (saveError) {
      if (shouldForceSignOut(saveError)) {
        signOutSession();
      }
      setError(getApiErrorMessage(saveError, 'Unable to save favorite.'));
    }
  };

  if (loading) {
    return (
      <section className='page-block'>
        <Card>
          <Skeleton lines={8} />
        </Card>
      </section>
    );
  }

  if (!trail) {
    return (
      <section className='page-block'>
        <Card>
          <h1 className='page-title'>Trail Not Found</h1>
          <p className='page-subtitle'>
            This trail does not exist in the current catalog.
          </p>
          <Link to='/explore'>Back to explore</Link>
        </Card>
      </section>
    );
  }

  return (
    <section className='page-block'>
      <Card>
        <img className='trail-hero' src={trail.thumbnailUrl} alt={trail.name} />
        <h1 className='page-title'>{trail.name}</h1>
        <p className='page-subtitle'>
          {trail.parkName} · {trail.state || trail.location}
        </p>
        <div className='chip-row'>
          <Chip>{trail.parkCategory}</Chip>
          <Chip>{trail.difficulty}</Chip>
          <Chip>{trail.stats?.distanceKm || trail.distanceKm} km</Chip>
          <Chip>
            {trail.stats?.elevationGainM || trail.elevationGainM} m elevation
          </Chip>
          <Chip>{trail.routeType}</Chip>
          {trail.distanceFromSearchKm ? (
            <Chip>{trail.distanceFromSearchKm.toFixed(1)} km from search</Chip>
          ) : null}
        </div>
        {trail.summary ? <p>{trail.summary}</p> : null}
        {searchParams.get('q') ? (
          <p className='page-subtitle'>
            Result for: <strong>{searchParams.get('q')}</strong>
          </p>
        ) : null}
        <div className='feature-actions'>
          {trail.parkSlug ? (
            <Link to={`/parks/${trail.parkSlug}`}>
              <Button variant='secondary'>Open Park Page</Button>
            </Link>
          ) : null}
          <Button
            variant='ghost'
            onClick={onSaveFavorite}
            disabled={!isAuthenticated}
          >
            {isAuthenticated
              ? savedFavorite
                ? 'Saved To Favorites'
                : 'Save To Favorites'
              : 'Sign In To Save'}
          </Button>
        </div>
        <ListAssignmentControl trailId={trail.id} />
      </Card>

      <Card>
        <h2>Trail Snapshot</h2>
        <ul className='detail-list'>
          <li>Park Category: {trail.parkCategory}</li>
          <li>Park: {trail.parkName}</li>
          <li>Difficulty: {trail.difficulty}</li>
          <li>Length: {trail.distanceKm} km</li>
          <li>Elevation Gain: {trail.elevationGainM} m</li>
          <li>Route Type: {trail.routeType}</li>
          <li>Activity: {trail.activityType}</li>
          <li>Location: {trail.state || trail.location}</li>
        </ul>
      </Card>

      <Card>
        <h2>AI Summary Placeholder</h2>
        <p className='page-subtitle'>
          This section is reserved for a concise AI-generated hike summary.
        </p>
        <p>
          {trail.aiSummary ||
            'Soon: a short trail insight covering terrain, crowd patterns, and suggested start time.'}
        </p>
      </Card>

      <Card>
        <h2>Related And Nearby Trails</h2>
        <p className='page-subtitle'>
          This section is reserved for future recommendation endpoints (similar
          trails, nearby alternatives, and personalized picks).
        </p>
      </Card>

      <Card>
        <h2>Route Map</h2>
        <p className='page-subtitle'>
          Preview trailhead and route shape before starting your hike.
        </p>
        <TrailRouteMap trail={trail} />
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}

      {Array.isArray(trail?.conditions?.highlights) &&
      trail.conditions.highlights.length ? (
        <Card>
          <h2>Current Conditions</h2>
          <ul>
            {trail.conditions.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <h2>Reviews</h2>
        <div className='review-compose'>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder='Share trail conditions and tips'
            disabled={!isAuthenticated}
          />
          <Button onClick={submitReview} disabled={!isAuthenticated}>
            {isAuthenticated ? 'Post Review' : 'Sign In To Post'}
          </Button>
        </div>
        <div className='review-list'>
          {reviews.map((review) => (
            <article key={review.id} className='review-item'>
              <strong>{review.user.displayName}</strong>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      </Card>
    </section>
  );
};

export default TrailDetailPage;
