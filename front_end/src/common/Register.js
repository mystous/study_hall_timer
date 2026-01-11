import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/Login.css'; // Reuse login styles
import { toast } from 'react-toastify';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error(t('passwordsDoNotMatch'));
            return;
        }

        try {
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:9090';

            console.log('Registering to:', backendUrl);
            const response = await fetch(`${backendUrl}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(t('registrationSuccess'));
                navigate('/login');
            } else {
                toast.error(data.message || t('registrationFailed'));
            }
        } catch (err) {
            console.error('Registration error:', err);
            toast.error((t('serverConnectionFailed') || 'Server error') + ': ' + (err.message || err));
        }
    };

    return (
        <div className="login-container">
            <h2>{t('register')}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>{t('username')}</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>{t('password')}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>{t('confirmPassword')}</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{t('register')}</button>
            </form>
        </div>
    );
}

export default Register;
