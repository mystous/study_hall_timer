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
import Sidebar from './common/Sidebar';
import SubjectManagement from './SubjectManagement';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [apiResponse, setApiResponse] = React.useState('');
  const { user, isAuthenticated } = useAuth();
  const [lastPath, setLastPath] = useState('');
  const { initializeData, finalizeData } = useTimeTable();
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  useEffect(() => {
    if (location.pathname === '/timetable' && user) {
      initializeData();
    }
    else if (lastPath === '/timetable') {
      finalizeData();
    }
    setLastPath(location.pathname);
  }, [location, user]);

  return (
    <div className="app-container">
      <Sidebar isMenuVisible={isMenuVisible} setIsMenuVisible={setIsMenuVisible} />

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
          <Route path="/subjects" element={
            <ProtectedRoute>
              <SubjectManagement />
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