import React, { createContext, useState, useContext } from 'react';
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

    // useEffect를 사용하여 `groups` 상태가 변경될 때마다 `localStorage`에 저장
   

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
