import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem('userEmail') || ''
  );
  const [username, setUsername] = useState(
    localStorage.getItem('username') || ''
  );

  const login = (newToken, email, user) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('username', user);
    setToken(newToken);
    setUserEmail(email);
    setUsername(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    setToken(null);
    setUserEmail('');
    setUsername('');
  };

  const signup = async (userData) => {};

  return (
    <AuthContext.Provider
      value={{ token, userEmail, username, login, logout, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// In the code above, we have created a context called  AuthContext  and a provider called  AuthProvider . The provider contains the state and methods to manage the authentication state. We have also created a custom hook called  useAuth  to access the context in other components.
// Will use the context in the  App  component.
