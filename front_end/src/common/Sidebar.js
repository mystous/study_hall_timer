import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { isAdmin } from './utils';
import '../css/App.css'; // Ensure CSS is available

const Sidebar = ({ isMenuVisible, setIsMenuVisible }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { isAuthenticated } = useAuth();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <div className="menu-toggle-container" style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1000
            }}>
                <button
                    className="menu-toggle"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                    onClick={() => {
                        setIsMenuVisible(!isMenuVisible);
                    }}
                >
                    {isMenuVisible ? <span style={{ color: 'white' }}>◀</span> : <span style={{ color: 'black' }}>▶</span>}
                </button>
            </div>

            <nav className="nav-menu" style={{ display: isMenuVisible ? 'block' : 'none' }}>
                <div className="menu-content">
                    <ul>
                        <li onClick={() => navigate('/')}>{t('nav.home')}</li>
                        <li onClick={() => navigate('/about')}>{t('nav.about')}</li>
                        {!isAuthenticated && (
                            <li onClick={() => navigate('/login')}>{t('nav.login')}</li>
                        )}
                        {isAuthenticated && (
                            <>
                                <li onClick={() => navigate('/timetable')}>{t('nav.timetable')}</li>
                                <li onClick={() => navigate('/daily')}>{t('nav.daily')}</li>
                                <li onClick={() => navigate('/statistics')}>{t('nav.statistics')}</li>
                                <li onClick={() => navigate('/personalinfo')}>{t('nav.personalinfo')}</li>
                            </>
                        )}
                        {isAdmin() && (
                            <li onClick={() => navigate('/admin')}>{t('nav.admin')}</li>
                        )}

                        {isAuthenticated && (
                            <li onClick={() => navigate('/logout')}>{t('nav.logout')}</li>
                        )}

                        <li className="language-selector" style={{
                            position: 'fixed',
                            bottom: '20px',
                            left: '10px',
                            paddingBottom: '20px'
                        }}>
                            <span
                                onClick={() => changeLanguage('ko')}
                                className={i18n.language === 'ko' ? 'active' : ''}
                            >
                                ko
                            </span>
                            {' | '}
                            <span
                                onClick={() => changeLanguage('en')}
                                className={i18n.language === 'en' ? 'active' : ''}
                            >
                                en
                            </span>
                            {' | '}
                            <span
                                onClick={() => changeLanguage('ch')}
                                className={i18n.language === 'ch' ? 'active' : ''}
                            >
                                ch
                            </span>
                            {' | '}
                            <span
                                onClick={() => changeLanguage('jp')}
                                className={i18n.language === 'jp' ? 'active' : ''}
                            >
                                jp
                            </span>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
