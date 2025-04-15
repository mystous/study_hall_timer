import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './css/App.css';
import logo from './images/logo.svg';
import TimeTable from './TimeTable';
import About from './About';
import PersonalInfo from './PersonalInfo';
import Statistics from './Statistics';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './common/Login';
import { AuthProvider } from './common/AuthContext';
import ProtectedRoute from './common/ProtectedRoute';
import { useAuth } from './common/AuthContext';
import Logout from './common/Logout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isAdmin } from './common/utils';
import Admin from './Admin';
import { TimeTableProvider, useTimeTable } from './contexts/TimeTableContext';
import Daily from './Daily';
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [apiResponse, setApiResponse] = React.useState('');
  const { user, isAuthenticated } = useAuth();
  const [lastPath, setLastPath] = useState('');
  const { initializeData, finalizeData } = useTimeTable();
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (location.pathname === '/timetable') {
      initializeData();
    }
    else if (lastPath === '/timetable') {
      finalizeData();
    }
    setLastPath(location.pathname);
  }, [location]);

  return (
    <div className="app-container">
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
            document.querySelector('.nav-menu').style.display = isMenuVisible ? 'none' : 'block';
          }}
        >
          {isMenuVisible ? <span style={{color: 'white'}}>◀</span> : <span style={{color: 'black'}}>▶</span>}
        </button>
      </div>
      {/* 왼쪽 네비게이션 메뉴 */}
      <nav className="nav-menu">
     
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

      {/* 오른쪽 컨텐츠 영역 */}
      <main className="App">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/" element={
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <div>
                <p>{t('home.title')}&nbsp;{t('home.version')}</p>
                <p>{apiResponse}</p>
              </div>
              <div>
                <button onClick={async () => {
                  try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/test`);
                    const data = await response.json();
                    setApiResponse(data.timestamp);
                  } catch (error) {
                    console.error('API 호출 에러:', error);
                    alert('서버 연결에 실패했습니다.');
                  }
                }}>
                  {t('home.testApi')}
                </button>
              </div>
            </header>
          } />
          <Route path="/timetable" element={
              <ProtectedRoute>
                  <TimeTable />
              </ProtectedRoute>
          } />
          <Route path="/daily" element={
              <ProtectedRoute>
                  <Daily />
              </ProtectedRoute>
          } />
          <Route path="/statistics" element={
              <ProtectedRoute>
                  <Statistics />
              </ProtectedRoute>
          } />
          <Route path="/personalinfo" element={
              <ProtectedRoute>
                  <PersonalInfo />
              </ProtectedRoute>
          } />
          <Route path="/admin" element={
              <ProtectedRoute>
                  <Admin />
              </ProtectedRoute>
          } />
          <Route path="/logout" element={
              <ProtectedRoute>
                  <Logout />
              </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<div className="App-header">{t('error.pageNotFound')}</div>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <TimeTableProvider>
      <AppContent />
    </TimeTableProvider>
  );
}

export default App;