import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState(null);
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
      const groupResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/user/groups`, {
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
      if (groupData.success) {
        setGroups(groupData.groups);
      }
      
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

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
