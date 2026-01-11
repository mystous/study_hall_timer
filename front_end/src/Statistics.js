import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './css/Statistics.css';
import axios from 'axios';

const Statistics = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('day'); // 'day', 'week', 'month'
  const [studyData, setStudyData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(false);
  const [displayPeriod, setDisplayPeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // API로부터 데이터를 가져오는 함수
    fetchStudyData(timeRange);
  }, [timeRange]);

  const isLightColor = (color) => {
    if (!color) return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 200; // Threshold for "light" color
  };

  const fetchStudyData = async (range) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      let start, end;
      const now = new Date();

      // Date Range Calculation (Same logic as backend previously)
      if (range === 'day') {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
      } else if (range === 'week') {
        const day = now.getDay() || 7;
        if (day !== 1) now.setHours(-24 * (day - 1));
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
        end.setHours(23, 59, 59, 999);
      } else if (range === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
      } else if (range === 'custom') {
        if (!startDate || !endDate) return;
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }

      // Fetch Raw Data
      // Format Period for Display
      const formatDate = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
      setDisplayPeriod(`${formatDate(start)} ~ ${formatDate(end)}`);

      const userId = new URLSearchParams(window.location.search).get('userId');

      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/time_table`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          userId: userId
        }
      });

      if (response.data.success) {
        processAndSetData(response.data.schedules);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAndSetData = (schedules) => {
    const categoryMap = {};
    let totalTime = 0;

    if (!schedules || schedules.length === 0) {
      setStudyData([]);
      setTotalHours(0);
      return;
    }

    schedules.forEach(schedule => {
      // Safe access to nested properties
      const subjectObj = schedule.study_subject || schedule.StudySubject || {};
      const categoryObj = subjectObj.category || (subjectObj.Category ? subjectObj.Category : {});

      const subjectName = subjectObj.subjectname || 'Unknown';
      const color = subjectObj.color || '#ccc';
      const categoryName = categoryObj.category_name || t('statistics.category.uncategorized') || 'Uncategorized';
      const categoryId = categoryObj.category_id || 'uncategorized';
      const categoryColor = categoryObj.color || color; // Use category color if available, else subject color

      const time = schedule.scheduled_time || 0;
      const subjectId = schedule.subject_id;

      // Group by Category
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          id: categoryId,
          name: categoryName,
          totalHours: 0,
          id: categoryId,
          name: categoryName,
          totalHours: 0,
          subjects: {},
          color: categoryColor
        };
      }

      categoryMap[categoryId].totalHours += time;

      // Group by Subject within Category
      if (!categoryMap[categoryId].subjects[subjectId]) {
        categoryMap[categoryId].subjects[subjectId] = {
          name: subjectName,
          hours: 0,
          color: color
        };
      }
      categoryMap[categoryId].subjects[subjectId].hours += time;

      totalTime += time;
    });

    // Convert Map to Array for rendering
    const categoryList = Object.values(categoryMap).map(cat => ({
      name: cat.name,
      color: cat.color,
      totalHours: parseFloat((cat.totalHours / 60).toFixed(1)),
      subjects: Object.values(cat.subjects).map(sub => ({
        name: sub.name,
        hours: parseFloat((sub.hours / 60).toFixed(1)),
        color: sub.color
      })).sort((a, b) => b.hours - a.hours)
    }));

    // Sort categories by total hours desc
    categoryList.sort((a, b) => b.totalHours - a.totalHours);

    setStudyData(categoryList);
    setTotalHours(parseFloat((totalTime / 60).toFixed(1)));
  };



  if (loading) return <div className="statistics-container">Loading...</div>;

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
        <p className="period-display">{displayPeriod}</p>

        {/* Category Breakdown Bar */}
        <div className="category-breakdown-bar">
          {studyData.map((category, index) => {
            const width = totalHours > 0 ? (category.totalHours / totalHours) * 100 : 0;
            if (width === 0) return null;
            return (
              <div
                key={index}
                className="breakdown-segment"
                style={{
                  width: `${width}%`,
                  backgroundColor: category.color,
                  border: isLightColor(category.color) ? '1px solid #ddd' : 'none'
                }}
                title={`${category.name}: ${category.totalHours}h (${width.toFixed(1)}%)`}
              />
            );
          })}
        </div>
      </div>

      <div className="statistics-detail">
        <h3>{t('statistics.detail.byCategory')}</h3>
        {studyData.map((category, catIndex) => (
          <div key={catIndex} className="category-section" style={{ borderLeft: `5px solid ${category.color}` }}>
            <div className="category-header">
              <div className="category-title-wrapper">
                <span
                  className="category-color-dot"
                  style={{
                    backgroundColor: category.color,
                    border: isLightColor(category.color) ? '1px solid #ccc' : 'none'
                  }}
                ></span>
                <span className="category-title">{category.name}</span>
              </div>
              <span className="category-time">{category.totalHours}{t('statistics.summary.hours')}</span>
            </div>
            <div className="category-subjects">
              {category.subjects.map((item, subIndex) => (
                <div key={subIndex} className="subject-row">
                  <div className="subject-name">
                    {item.name}
                  </div>
                  <div className="subject-hours">
                    <div
                      className="hours-bar"
                      style={{
                        width: `${totalHours > 0 ? (item.hours / (totalHours * 1.0)) * 100 : 0}%`,
                        backgroundColor: category.color,
                        border: isLightColor(category.color) ? '1px solid #ddd' : 'none'
                      }}
                    ></div>
                    <span>{item.hours}{t('statistics.summary.hours')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
