import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveGroups } from './utils';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  //const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (username, password) => {
    try {


      // API 호출 예시
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('accessToken', data.token.accessToken);
      localStorage.setItem('refreshToken', data.token.refreshToken);
      // Get user's groups using access token
      const groupResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/user/user_groups`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!groupResponse.ok) {
        throw new Error('Failed to fetch user groups');
      }

      const groupData = await groupResponse.json();

      return groupData;

    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    saveGroups([]);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Simple JWT decode to get username
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);

        if (payload && payload.username) {
          setUser({ username: payload.username });
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Failed to decode token", e);
        logout();
      }
    }
  }, []);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        // Optionally update user state if needed, but usually just token is enough for implicit auth
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    // Silent Refresh Logic
    const checkTokenAndRefresh = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      try {
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);

        // Token expiry time in seconds
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);

        // Refresh if expires in less than 5 minutes
        if (exp - now < 300) {
          await refreshAccessToken();
        }
      } catch (e) {
        // If decoding failed, token might be invalid, try refresh
        await refreshAccessToken();
      }
    };

    // Check immediately on mount
    checkTokenAndRefresh();

    // Check periodically (e.g. every 1 minute)
    const intervalId = setInterval(checkTokenAndRefresh, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
