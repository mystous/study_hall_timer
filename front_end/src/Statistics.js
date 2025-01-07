import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Statistics.css';

const Statistics = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('day'); // 'day', 'week', 'month'
  const [studyData, setStudyData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // API로부터 데이터를 가져오는 함수
    fetchStudyData(timeRange);
  }, [timeRange]);

  const fetchStudyData = (range) => {
    // TODO: API 연동
    // 임시 데이터
    const mockData = {
      day: [
        { subject: "math", hours: 2 },
        { subject: "english", hours: 1.5 },
        { subject: "science", hours: 1 },
      ],
      week: [
        { subject: "math", hours: 10 },
        { subject: "english", hours: 8 },
        { subject: "science", hours: 6 },
      ],
      month: [
        { subject: "math", hours: 40 },
        { subject: "english", hours: 30 },
        { subject: "science", hours: 25 },
      ],
    };

    setStudyData(mockData[range]);
    setTotalHours(mockData[range].reduce((acc, curr) => acc + curr.hours, 0));
  };

  return (
    <div className="statistics-container">
      <h1>{t('statistics.title')}</h1>
      
      <div className="time-range-selector">
        <button 
          className={timeRange === 'day' ? 'active' : ''} 
          onClick={() => setTimeRange('day')}
        >
          {t('statistics.timeRange.daily')}
        </button>
        <button 
          className={timeRange === 'week' ? 'active' : ''} 
          onClick={() => setTimeRange('week')}
        >
          {t('statistics.timeRange.weekly')}
        </button>
        <button 
          className={timeRange === 'month' ? 'active' : ''} 
          onClick={() => setTimeRange('month')}
        >
          {t('statistics.timeRange.monthly')}
        </button>
        <div className="custom-range">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-picker"
          />
          <span>~</span>
          <input
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-picker"
          />
          <button 
            className="apply-range"
            onClick={() => fetchStudyData('custom')}
          >
            {t('statistics.timeRange.apply')}
          </button>
        </div>
      </div>

      <div className="statistics-summary">
        <h2>
          {timeRange === 'day' 
            ? t('statistics.summary.today')
            : timeRange === 'week'
            ? t('statistics.summary.thisWeek')
            : t('statistics.summary.thisMonth')}
        </h2>
        <p className="total-hours">{totalHours}{t('statistics.summary.hours')}</p>
      </div>

      <div className="statistics-detail">
        <h3>{t('statistics.detail.bySubject')}</h3>
        {studyData.map((item, index) => (
          <div key={index} className="subject-row">
            <div className="subject-name">
              {t(`statistics.detail.subjects.${item.subject}`)}
            </div>
            <div className="subject-hours">
              <div 
                className="hours-bar" 
                style={{ width: `${(item.hours / totalHours) * 100}%` }}
              ></div>
              <span>{item.hours}{t('statistics.summary.hours')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
