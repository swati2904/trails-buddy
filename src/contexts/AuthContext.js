import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem('userEmail') || ''
  );

  const login = (newToken, email) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userEmail', email);
    setToken(newToken);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail('');
  };

  const signup = async (userData) => {};

  return (
    <AuthContext.Provider value={{ token, userEmail, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// In the code above, we have created a context called  AuthContext  and a provider called  AuthProvider . The provider contains the state and methods to manage the authentication state. We have also created a custom hook called  useAuth  to access the context in other components.
// Will use the context in the  App  component.
