import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useTranslation } from 'react-i18next';
import '../css/Login.css';
import { saveGroups } from './utils';
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      saveGroups(data.groups);
      navigate('/'); // 로그인 성공 시 홈으로 이동
    } catch (err) {
      setError(t('login.error'));
    }
  };

  return (
    <div className="login-container">
      <h2>{t('login.login')}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>{t('login.username')}</label>
          <input
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>{t('login.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{t('login.login')}</button>
        <p style={{ marginTop: '10px', textAlign: 'center' }}>
          {t('noAccount')} <span onClick={() => navigate('/register')} style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>{t('register')}</span>
        </p>
      </form>
    </div>
  );
}

export default Login;
