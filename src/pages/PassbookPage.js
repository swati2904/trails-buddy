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

const getParkSealMonogram = (parkName) => {
  const words = String(parkName || '')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return 'NP';
  }

  const ignore = new Set(['NATIONAL', 'PARK', 'OF', 'THE', 'AND']);
  const significant = words.filter((word) => !ignore.has(word.toUpperCase()));
  const source = significant.length ? significant : words;

  if (source.length === 1) {
    return source[0].slice(0, 2).toUpperCase();
  }

  return `${source[0][0] || ''}${source[1][0] || ''}`.toUpperCase();
};

const getSealThemeClass = (parkName) => {
  const key = String(parkName || '').toUpperCase();
  if (!key) {
    return 'passbook-stamp-seal--theme-1';
  }
  const themes = 5;
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 997;
  }
  return `passbook-stamp-seal--theme-${(hash % themes) + 1}`;
};

const PassbookPage = () => {
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
    <section className='page-block passbook-page page-shell'>
      <header className='page-shell__intro'>
        <p className='page-shell__eyebrow'>Passbook</p>
        <h1 className='page-shell__title'>Your park passport</h1>
        <p className='page-shell__lede'>
          Stamps and visit history—separate from your account settings on
          Profile.
        </p>
      </header>

      {!isAuthenticated ? (
        <div className='passbook-guest-showcase' aria-hidden='false'>
          <div className='passbook-guest-showcase__rings'>
            <span className='passbook-guest-showcase__ring passbook-guest-showcase__ring--1' />
            <span className='passbook-guest-showcase__ring passbook-guest-showcase__ring--2' />
            <span className='passbook-guest-showcase__ring passbook-guest-showcase__ring--3' />
          </div>
          <div className='passbook-guest-showcase__copy'>
            <p className='passbook-guest-showcase__tag'>Preview</p>
            <p className='passbook-guest-showcase__headline'>
              Collect stamps for every park you visit
            </p>
            <p className='passbook-guest-showcase__sub'>
              After you sign in, each visit can earn a dated digital stamp and
              optional note—your personal national-parks story.
            </p>
          </div>
        </div>
      ) : null}

      <Card className='passbook-header-card'>
        {!isAuthenticated ? (
          <>
            <p className='page-subtitle'>
              Sign in to save stamps and visits. Your data stays on your account.
            </p>
            <div className='feature-actions passbook-guest-cta'>
              <Link className='ui-btn ui-btn--primary ui-btn--md' to='/signin'>
                Sign in
              </Link>
              <Link
                className='ui-btn ui-btn--secondary ui-btn--md'
                to='/signup'
              >
                Create account
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className='page-subtitle'>
              {user?.displayName || 'Explorer'}, you have visited{' '}
              <strong>{uniqueVisitedParks}</strong> unique parks.
            </p>
            <div className='passbook-progress'>
              <div
                className='passbook-progress__bar'
                style={{ width: `${progressPercent}%` }}
                aria-hidden
              />
            </div>
            <div className='chip-row'>
              <span className='ui-chip ui-chip--warm'>Stamps: {stamps.length}</span>
              <span className='ui-chip ui-chip--nature'>
                Visit rows: {visitedParks.length}
              </span>
              <span className='ui-chip ui-chip--sky'>
                Progress: {progressPercent}%
              </span>
            </div>
            <div className='feature-actions passbook-header-actions'>
              <Link to='/explore'>Explore parks</Link>
              <Link to='/profile'>Account</Link>
            </div>
          </>
        )}
      </Card>

      {error ? <p className='error-copy'>{error}</p> : null}

      {isAuthenticated ? (
        <>
          <Card className='passbook-page__stamps'>
            <h2 className='section-title'>Digital stamps</h2>
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
                        <p className='passbook-stamp-card__eyebrow'>Stamp</p>
                        <h3>{stamp.parkName}</h3>
                      </div>
                      <div
                        className={`passbook-stamp-seal ${getSealThemeClass(stamp.parkName)}`}
                        aria-label={`${stamp.parkName || 'Park'} seal stamp`}
                      >
                        <span className='passbook-stamp-seal__ringtext'>
                          National Parks Explorer
                        </span>
                        <span className='passbook-stamp-seal__mono'>
                          {getParkSealMonogram(stamp.parkName)}
                        </span>
                        <span className='passbook-stamp-seal__sub'>Seal</span>
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
                        Add a note from the park page on your next visit.
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
                <h3 className='section-title'>No stamps yet</h3>
                <p className='page-subtitle'>
                  Mark a park as visited on its detail page to earn your first
                  stamp.
                </p>
                <div className='feature-actions'>
                  <Link to='/explore'>Find a park</Link>
                </div>
              </Card>
            ) : null}
          </Card>

          <Card className='passbook-page__visits'>
            <h2 className='section-title'>Visit log</h2>
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
                No visits yet. Log a visit from any park detail page.
              </p>
            ) : null}
          </Card>
        </>
      ) : null}
    </section>
  );
};

export default PassbookPage;
