import React, { useState } from 'react';
import { AuthProvider } from './AuthContext';
import { useTranslation } from 'react-i18next';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin } = AuthProvider();
  const { t } = useTranslation();
  const onSubmit = (e) => {
    e.preventDefault();
    if (handleLogin(username, password)) {
      setUsername('');
      setPassword('');
    } else {
      alert('로그인 실패!');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label className="login-label">{t('login.username')}</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ height: '30px', verticalAlign: 'middle' }}
        />
      </div>
      <div>
        <label className="login-label">{t('login.password')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ height: '30px', verticalAlign: 'middle' }}
        />
      </div>
      <button type="submit">{t('login.login')}</button>
    </form>
  );
};

export default Login;