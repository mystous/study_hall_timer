import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="App-header">
      <h2>{t('logout.loggingOut')}</h2>
    </div>
  );
};

export default Logout;
