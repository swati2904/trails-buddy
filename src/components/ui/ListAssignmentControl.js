import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addTrailToList, getLists } from '../../api/v1/user';
import { getApiErrorMessage, shouldForceSignOut } from '../../api/v1/errorMessages';
import { useAuth } from '../../state/AuthContext';
import Button from './Button';

const ListAssignmentControl = ({ trailId }) => {
  const { isAuthenticated, tokens, signOutSession } = useAuth();
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadLists = useCallback(async () => {
    if (!isAuthenticated) {
      setLists([]);
      setSelectedListId('');
      return;
    }

    try {
      const result = await getLists(tokens?.accessToken);
      const nextLists = result.items || [];
      setLists(nextLists);
      if (nextLists.length > 0) {
        setSelectedListId(nextLists[0].id);
      }
    } catch (error) {
      if (shouldForceSignOut(error)) {
        signOutSession();
      }
      setMessage(getApiErrorMessage(error, 'Unable to load lists.'));
    }
  }, [isAuthenticated, signOutSession, tokens?.accessToken]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const onAssign = async () => {
    if (!selectedListId || !trailId) {
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await addTrailToList(selectedListId, trailId, tokens?.accessToken);
      setMessage('Trail added to list.');
    } catch (error) {
      if (shouldForceSignOut(error)) {
        signOutSession();
      }
      setMessage(getApiErrorMessage(error, 'Unable to add trail to list.'));
    } finally {
      setLoading(false);
    }
  };

  const hasLists = useMemo(() => lists.length > 0, [lists.length]);

  if (!isAuthenticated) {
    return <Link to='/signin'>Sign in to add to a list</Link>;
  }

  if (!hasLists) {
    return <Link to='/my-lists'>Create a list first</Link>;
  }

  return (
    <div className='list-assign-control'>
      <select
        value={selectedListId}
        onChange={(event) => setSelectedListId(event.target.value)}
      >
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>
      <Button variant='ghost' onClick={onAssign} disabled={loading}>
        {loading ? 'Adding...' : 'Add To List'}
      </Button>
      {message ? <span className='list-assign-message'>{message}</span> : null}
    </div>
  );
};

export default ListAssignmentControl;
