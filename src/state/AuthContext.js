import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { signOut } from '../api/v1/auth';

const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem('tb.auth.session');
    if (!raw) {
      return { user: null, tokens: null };
    }

    const parsed = JSON.parse(raw);
    return {
      user: parsed.user || null,
      tokens: parsed.tokens || null,
    };
  } catch (error) {
    return { user: null, tokens: null };
  }
};

const writeStoredSession = (session) => {
  localStorage.setItem('tb.auth.session', JSON.stringify(session));
};

const clearStoredSession = () => {
  localStorage.removeItem('tb.auth.session');
};

export const AuthProvider = ({ children }) => {
  const initial = readStoredSession();
  const [user, setUser] = useState(initial.user);
  const [tokens, setTokens] = useState(initial.tokens);

  useEffect(() => {
    const onSessionUpdate = (event) => {
      const nextSession = event?.detail || readStoredSession();
      setUser(nextSession?.user || null);
      setTokens(nextSession?.tokens || null);
    };

    const onSessionInvalid = () => {
      setUser(null);
      setTokens(null);
      clearStoredSession();
    };

    window.addEventListener('tb-auth-session-updated', onSessionUpdate);
    window.addEventListener('tb-auth-session-invalid', onSessionInvalid);
    return () => {
      window.removeEventListener('tb-auth-session-updated', onSessionUpdate);
      window.removeEventListener('tb-auth-session-invalid', onSessionInvalid);
    };
  }, []);

  const signInSession = (nextUser, nextTokens) => {
    setUser(nextUser);
    setTokens(nextTokens);
    writeStoredSession({ user: nextUser, tokens: nextTokens });
  };

  const signOutSession = async () => {
    const refreshToken = tokens?.refreshToken;
    const accessToken = tokens?.accessToken;

    try {
      if (accessToken) {
        await signOut({ refreshToken }, accessToken);
      }
    } catch (error) {
      // Local session must always be cleared even if API signout fails.
    } finally {
      setUser(null);
      setTokens(null);
      clearStoredSession();
    }
  };

  const value = useMemo(
    () => ({
      user,
      tokens,
      isAuthenticated: Boolean(tokens?.accessToken),
      signInSession,
      signOutSession,
    }),
    [tokens, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
