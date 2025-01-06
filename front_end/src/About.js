import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './css/About.css';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{t('about.title')}</h1>
      <div style={{ marginTop: '20px' }}>
        <h2>{t('about.introduction.title')}</h2>
        <p>{t('about.introduction.description')}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>{t('about.features.title')}</h2>
        <div>
          <p>{t('about.features.timetable')}</p>
          <p>{t('about.features.timer')}</p>
          <p>{t('about.features.multilingual')}</p>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>{t('about.version.title')}</h2>
        <p>{t('home.version')}</p>
      </div>

      <Link 
        to="/" 
        style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#282c34',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}
      >
        {t('backToHome')}
      </Link>
    </div>
  );
};

export default About;

