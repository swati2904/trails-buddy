import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useAuth } from '../state/AuthContext';
import {
  getPassbookStamps,
  getVisitedParks,
  removeVisitedPark,
  updateVisitedPark,
} from '../api/v1/user';
import {
  getApiErrorMessage,
  shouldForceSignOut,
} from '../api/v1/errorMessages';
import Button from '../components/ui/Button';

const TOTAL_NATIONAL_PARKS = 63;

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

const toDateInputValue = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

const ProfilePage = () => {
  const { user, isAuthenticated, tokens, signOutSession } = useAuth();
  const [visitedParks, setVisitedParks] = useState([]);
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingVisitId, setEditingVisitId] = useState('');
  const [editDate, setEditDate] = useState(toDateInputValue());
  const [editNote, setEditNote] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');

  const loadPassbook = useCallback(async () => {
    if (!isAuthenticated) {
      setVisitedParks([]);
      setStamps([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [visits, stampCollection] = await Promise.all([
        getVisitedParks(tokens?.accessToken),
        getPassbookStamps(tokens?.accessToken),
      ]);

      setVisitedParks(Array.isArray(visits?.items) ? visits.items : []);
      setStamps(
        Array.isArray(stampCollection?.items) ? stampCollection.items : [],
      );
    } catch (loadError) {
      if (shouldForceSignOut(loadError)) {
        await signOutSession();
        return;
      }
      setError(getApiErrorMessage(loadError, 'Unable to load passbook.'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, signOutSession, tokens?.accessToken]);

  useEffect(() => {
    loadPassbook();
  }, [loadPassbook]);

  const uniqueVisitedParks = useMemo(() => {
    const ids = new Set(
      visitedParks
        .map((item) => String(item?.parkId || '').trim())
        .filter(Boolean),
    );

    return ids.size;
  }, [visitedParks]);

  const progressPercent = useMemo(() => {
    if (!uniqueVisitedParks) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((uniqueVisitedParks / TOTAL_NATIONAL_PARKS) * 100),
    );
  }, [uniqueVisitedParks]);

  const startEditVisit = (visit) => {
    setEditingVisitId(String(visit?.visitId || ''));
    setEditDate(toDateInputValue(visit?.visitDate));
    setEditNote(visit?.note || '');
    setSaveStatus('idle');
  };

  const cancelEdit = () => {
    setEditingVisitId('');
    setEditDate(toDateInputValue());
    setEditNote('');
    setSaveStatus('idle');
  };

  const saveVisit = async (visitId) => {
    setSaveStatus('saving');

    try {
      const updated = await updateVisitedPark(
        visitId,
        {
          visitDate: new Date(editDate).toISOString(),
          note: editNote.trim(),
        },
        tokens?.accessToken,
      );

      setVisitedParks((current) =>
        current.map((item) =>
          String(item.visitId) === String(visitId) ? updated : item,
        ),
      );
      setSaveStatus('saved');
      setEditingVisitId('');
    } catch (saveError) {
      if (shouldForceSignOut(saveError)) {
        await signOutSession();
        return;
      }
      setSaveStatus('error');
      setError(getApiErrorMessage(saveError, 'Unable to update visit.'));
    }
  };

  const deleteVisit = async (visitId) => {
    try {
      await removeVisitedPark(visitId, tokens?.accessToken);
      setVisitedParks((current) =>
        current.filter((item) => String(item.visitId) !== String(visitId)),
      );
    } catch (deleteError) {
      if (shouldForceSignOut(deleteError)) {
        await signOutSession();
        return;
      }
      setError(getApiErrorMessage(deleteError, 'Unable to remove visit.'));
    }
  };

  return (
    <section className='page-block'>
      <Card className='passbook-header-card'>
        <h1 className='page-title'>National Park Passbook</h1>
        {!isAuthenticated ? (
          <>
            <p className='page-subtitle'>
              Start your park passport, collect digital stamps, and track your
              journey across U.S. National Parks.
            </p>
            <div className='feature-actions'>
              <Link to='/signin'>Sign in</Link>
              <Link to='/signup'>Create account</Link>
            </div>
          </>
        ) : (
          <>
            <p className='page-subtitle'>
              Welcome, {user?.displayName || 'Park Explorer'}.
            </p>
            <p className='page-subtitle'>{uniqueVisitedParks} parks visited</p>
            <div className='passbook-progress'>
              <div
                className='passbook-progress__bar'
                style={{ width: `${progressPercent}%` }}
                aria-hidden
              />
            </div>
            <p className='page-subtitle'>
              Keep your memories alive with stamps, notes, and visit dates.
            </p>
            <div className='chip-row'>
              <span className='ui-chip ui-chip--warm'>
                Stamps: {stamps.length}
              </span>
              <span className='ui-chip ui-chip--nature'>
                Visits: {visitedParks.length}
              </span>
              <span className='ui-chip ui-chip--sky'>
                Progress: {progressPercent}%
              </span>
            </div>
            <div className='feature-actions'>
              <Link to='/explore'>Explore parks</Link>
              <Button variant='ghost' onClick={signOutSession}>
                Log out
              </Button>
            </div>
          </>
        )}
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}

      {isAuthenticated ? (
        <>
          <Card>
            <h2>Digital stamp collection</h2>
            {loading ? (
              <p className='page-subtitle'>Loading stamps...</p>
            ) : null}
            {!loading && stamps.length ? (
              <div className='passbook-stamp-grid'>
                {stamps.map((stamp) => (
                  <article
                    key={`${stamp.stampCode}-${stamp.visitDate}`}
                    className='passbook-stamp-card passbook-stamp-card--memory'
                  >
                    <div className='passbook-stamp-card__head'>
                      <div>
                        <p className='passbook-stamp-card__eyebrow'>
                          Digital passbook stamp
                        </p>
                        <h3>{stamp.parkName}</h3>
                      </div>
                      <div
                        className='passbook-stamp-seal'
                        aria-label='Digital stamp seal'
                      >
                        <span>STAMPED</span>
                      </div>
                    </div>
                    <div className='passbook-stamp-meta'>
                      <span>{stamp.stampCode || 'STAMP'}</span>
                      <span>{formatVisitDate(stamp.visitDate)}</span>
                    </div>
                    {stamp.note ? (
                      <p className='passbook-memory-note'>{stamp.note}</p>
                    ) : (
                      <p className='page-subtitle'>
                        Add a note to make this memory even more vivid.
                      </p>
                    )}
                    {stamp.parkSlug ? (
                      <div className='feature-actions'>
                        <Link to={`/parks/${stamp.parkSlug}`}>Open park</Link>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : null}
            {!loading && !stamps.length ? (
              <Card className='no-results-card'>
                <h3>Your first stamp is waiting</h3>
                <p className='page-subtitle'>
                  Visit any park detail page and mark it as visited to start
                  your passbook.
                </p>
                <div className='feature-actions'>
                  <Link to='/explore'>Find your first park</Link>
                </div>
              </Card>
            ) : null}
          </Card>

          <Card>
            <h2>Visited parks</h2>
            {loading ? (
              <p className='page-subtitle'>Loading visits...</p>
            ) : null}
            {!loading && visitedParks.length ? (
              <div className='park-trails-list'>
                {visitedParks.map((visit) => {
                  const isEditing =
                    String(editingVisitId) === String(visit.visitId);

                  return (
                    <article key={visit.visitId} className='park-trail-row'>
                      {!isEditing ? (
                        <>
                          <div>
                            <h3>{visit.parkName}</h3>
                            <p className='page-subtitle'>
                              {visit.state || 'United States'} •{' '}
                              {formatVisitDate(visit.visitDate)}
                            </p>
                            {visit.note ? (
                              <p className='page-subtitle'>{visit.note}</p>
                            ) : null}
                          </div>
                          <div className='feature-actions'>
                            <Button
                              variant='secondary'
                              onClick={() => startEditVisit(visit)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant='ghost'
                              onClick={() => deleteVisit(visit.visitId)}
                            >
                              Remove
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className='auth-form' style={{ width: '100%' }}>
                          <label>
                            <span>Visit date</span>
                            <input
                              type='date'
                              value={editDate}
                              onChange={(event) =>
                                setEditDate(event.target.value)
                              }
                            />
                          </label>
                          <label>
                            <span>Note</span>
                            <input
                              value={editNote}
                              onChange={(event) =>
                                setEditNote(event.target.value)
                              }
                            />
                          </label>
                          <div className='feature-actions'>
                            <Button
                              onClick={() => saveVisit(visit.visitId)}
                              disabled={saveStatus === 'saving'}
                            >
                              {saveStatus === 'saving'
                                ? 'Saving...'
                                : 'Save visit'}
                            </Button>
                            <Button variant='ghost' onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : null}
            {!loading && !visitedParks.length ? (
              <p className='page-subtitle'>
                No visits logged yet. Your first park memory starts on the park
                detail page.
              </p>
            ) : null}
          </Card>
        </>
      ) : null}
    </section>
  );
};

export default ProfilePage;
