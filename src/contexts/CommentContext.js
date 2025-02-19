import { createContext, useState, useEffect, useContext } from 'react';
import { fetchComments } from '../api/ReviewApi';

const CommentContext = createContext();

export const CommentProvider = ({ children, trailId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadComments = async (page = 0) => {
    try {
      setLoading(true);
      const data = await fetchComments(trailId, page);
      setComments(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(page);
  }, [trailId, page]);

  return (
    <CommentContext.Provider
      value={{
        comments,
        loading,
        error,
        setComments,
        page,
        setPage,
        totalPages,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => useContext(CommentContext);
