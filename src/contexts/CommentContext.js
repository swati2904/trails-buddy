import { createContext, useState, useEffect, useContext } from 'react';
import { fetchComments } from '../api/ReviewApi';

const CommentContext = createContext();

export const CommentProvider = ({ children, trailId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await fetchComments(trailId);
        setComments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, [trailId]);

  return (
    <CommentContext.Provider value={{ comments, loading, error, setComments }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => useContext(CommentContext);
