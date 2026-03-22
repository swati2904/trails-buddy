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

const TRAIL_HERO_FALLBACK =
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=60';

const valueOrFallback = (value, fallback) => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return value;
};

const TrailDetailPage = () => {
  const { isAuthenticated, tokens, signOutSession } = useAuth();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [trail, setTrail] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState('5');
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
          rating: Number(rating),
          comment: comment.trim(),
          condition: 'good',
          activity: 'hiking',
        },
        tokens?.accessToken,
      );

      const refreshedReviews = await getTrailReviews(trail.id, 1, 20);
      setReviews(refreshedReviews.items || []);
      setComment('');
      setRating('5');
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
    <section className='trail-detail-page'>
      <Card className='trail-detail-hero'>
        <img
          className='trail-hero'
          src={trail.thumbnailUrl || TRAIL_HERO_FALLBACK}
          alt={trail.name}
          loading='lazy'
        />
        <div className='trail-detail-hero__overlay' />
        <div className='trail-detail-hero__content'>
          <h1 className='page-title'>{trail.name}</h1>
          <p className='page-subtitle'>
            {trail.parkName} •{' '}
            {valueOrFallback(
              trail.state || trail.location,
              'Location unavailable',
            )}
          </p>
          <div className='chip-row'>
            <Chip tone='nature'>
              {valueOrFallback(trail.parkCategory, 'Park')}
            </Chip>
            <Chip tone='nature'>
              {valueOrFallback(trail.difficulty, 'general')}
            </Chip>
            <Chip tone='warm'>
              {Number(trail?.rating) > 0
                ? `${Number(trail.rating).toFixed(1)} rated`
                : 'Not yet rated'}
            </Chip>
            {trail.distanceFromSearchKm ? (
              <Chip tone='sky'>
                {trail.distanceFromSearchKm.toFixed(1)} km away
              </Chip>
            ) : null}
          </div>

          <div className='feature-actions'>
            {trail.parkSlug ? (
              <Link to={`/parks/${trail.parkSlug}`}>
                <Button variant='secondary'>Explore this park</Button>
              </Link>
            ) : null}
            <Button
              variant='ghost'
              onClick={onSaveFavorite}
              disabled={!isAuthenticated}
            >
              {isAuthenticated
                ? savedFavorite
                  ? 'Saved to favorites'
                  : 'Save trail'
                : 'Sign in to save'}
            </Button>
          </div>
        </div>
      </Card>

      <div className='trail-stats-grid'>
        <Card className='trail-stat-card'>
          <h3>Distance</h3>
          <p>
            {valueOrFallback(
              trail.stats?.distanceKm || trail.distanceKm,
              'N/A',
            )}{' '}
            km
          </p>
        </Card>
        <Card className='trail-stat-card'>
          <h3>Elevation</h3>
          <p>
            {valueOrFallback(
              trail.stats?.elevationGainM || trail.elevationGainM,
              'N/A',
            )}{' '}
            m
          </p>
        </Card>
        <Card className='trail-stat-card'>
          <h3>Route Type</h3>
          <p>
            {valueOrFallback(
              trail.stats?.routeType || trail.routeType,
              'Unknown',
            )}
          </p>
        </Card>
      </div>

      <Card>
        <h2>About this trail</h2>
        <p>{valueOrFallback(trail.summary, 'No description available yet.')}</p>
        {searchParams.get('q') ? (
          <p className='page-subtitle'>
            Result for: <strong>{searchParams.get('q')}</strong>
          </p>
        ) : null}
        <ListAssignmentControl trailId={trail.id} />
      </Card>

      <Card>
        <h2>Route map</h2>
        <p className='page-subtitle'>
          Preview the route and trailhead so you can start with confidence.
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
        <h2>Trail notes and reviews</h2>
        <div className='review-compose'>
          <label htmlFor='trail-review-rating' className='sr-only'>
            Review rating
          </label>
          <select
            id='trail-review-rating'
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            disabled={!isAuthenticated}
            aria-label='Select review rating'
          >
            <option value='5'>5 - Excellent</option>
            <option value='4'>4 - Great</option>
            <option value='3'>3 - Good</option>
            <option value='2'>2 - Tough</option>
            <option value='1'>1 - Poor</option>
          </select>
          <label htmlFor='trail-review-comment' className='sr-only'>
            Review comment
          </label>
          <textarea
            id='trail-review-comment'
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder='Share conditions, scenery, and pro tips for future hikers'
            disabled={!isAuthenticated}
            aria-label='Write your trail review'
          />
          <Button onClick={submitReview} disabled={!isAuthenticated}>
            {isAuthenticated ? 'Post trail note' : 'Sign in to post'}
          </Button>
        </div>
        <div className='review-list'>
          {reviews.length ? (
            reviews.map((review) => (
              <article key={review.id} className='review-item'>
                <strong>{review?.user?.displayName || 'Trail Explorer'}</strong>
                <p>{valueOrFallback(review.comment, 'No written review.')}</p>
              </article>
            ))
          ) : (
            <p className='page-subtitle'>
              No reviews yet. Be the first to share conditions.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
};

export default TrailDetailPage;
