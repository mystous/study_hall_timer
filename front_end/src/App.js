import React from 'react';
import { useTranslation } from 'react-i18next';
import './css/App.css';
import logo from './images/logo.svg';
import TimeTable from './TimeTable';
import About from './About';
import { Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="app-container">
      {/* 왼쪽 네비게이션 메뉴 */}
      <nav className="nav-menu">
        <ul>
          <li onClick={() => navigate('/')}>{t('nav.home')}</li>
          <li onClick={() => navigate('/timetable')}>{t('nav.timetable')}</li>
          <li onClick={() => navigate('/about')}>{t('nav.about')}</li>
        </ul>
      </nav>

      {/* 오른쪽 컨텐츠 영역 */}
      <main className="App">
        <Routes>
          <Route path="/" element={
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                {t('home.title')}&nbsp;{t('home.version')}
                <p></p>
              </p>
              <div>
                <button onClick={async () => {
                  try {
                    const response = await fetch('http://studyhalltimer.com:9090/api/v1/test');
                    const data = await response.json();
                    const currentText = document.querySelector('.App-header p').textContent;
                    document.querySelector('.App-header p p').textContent = data.timestamp;
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
          <Route path="/timetable" element={<TimeTable />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<div className="App-header">{t('error.pageNotFound')}</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;