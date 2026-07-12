import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import { getToken, getUser, setToken, setUser, clearAuth } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setLocalUser] = useState(null);
  const [token, setLocalToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();
    if (savedToken && savedUser) {
      setLocalToken(savedToken);
      setLocalUser(savedUser);
    }
    setLoading(false);
  }, []);

  /**
   * Handles user login
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      
      setToken(receivedToken);
      setUser(receivedUser);
      setLocalToken(receivedToken);
      setLocalUser(receivedUser);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Handles user logout
   */
  const logout = () => {
    clearAuth();
    setLocalToken(null);
    setLocalUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
