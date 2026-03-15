import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

      setReviews((current) => [
        {
          id: `rvw_local_${Date.now()}`,
          user: { id: 'usr_local', displayName: 'You' },
          rating: 5,
          comment: comment.trim(),
          condition: 'good',
          activity: 'hiking',
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
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
        <img
          className='trail-hero'
          src={trail.media.heroImageUrl}
          alt={trail.name}
        />
        <h1 className='page-title'>{trail.name}</h1>
        <p className='page-subtitle'>{trail.summary}</p>
        <div className='chip-row'>
          <Chip>{trail.difficulty}</Chip>
          <Chip>{trail.stats.distanceKm} km</Chip>
          <Chip>{trail.stats.elevationGainM} m gain</Chip>
          <Chip>{trail.rating.average} stars</Chip>
        </div>
        <div className='feature-actions'>
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
        <h2>Route Map</h2>
        <p className='page-subtitle'>Trailhead pin and highlighted trail route.</p>
        <TrailRouteMap trail={trail} />
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}

      <Card>
        <h2>Current Conditions</h2>
        <ul>
          {trail.conditions.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

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
