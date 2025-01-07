import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import './css/TimeTable.css';

function TimeTable() {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState(6); // 기본값 8시
  const [endTime, setEndTime] = useState(26);    // 기본값 26시

  const getMondayDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };
  const today = new Date();
  const currentMonday = getMondayDate(today);
  



  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = startTime; hour <= endTime; hour++) {
      const displayHour = hour > 24 ? hour - 24 : hour;
      const nextHour = (hour + 1) > 24 ? hour - 23 : hour + 1;
      // 시간 형식을 i18n 포맷으로 변경
      const timeLabel = t('timeFormat', {
        start: String(displayHour).padStart(2, '0'),
        end: String(nextHour).padStart(2, '0')
      });
      slots.push({
        time: timeLabel,
        isFirstHalf: true
      });
      slots.push({
        time: timeLabel,
        isFirstHalf: false
      });
    }
    return slots;
  };

    // 시간 입력 처리 함수
    const handleStartTimeChange = (e) => {
      const value = parseInt(e.target.value);
      if (value >= 0 && value <= 48) {
        setStartTime(value);
      }
    };
  
    const handleEndTimeChange = (e) => {
      const value = parseInt(e.target.value);
      if (value >= 0 && value <= 48) {
        setEndTime(value);
      }
    };

  return (
    
    <div className="timetable-container">
          {/* 시간 설정 UI */}
    <div className="time-settings">
      <div>
        <label>{t('startTime')}: </label>
        <input 
          type="number" 
          min="0" 
          max="23" 
          value={startTime}
          onChange={handleStartTimeChange}
        />
        &nbsp;
        <label>{t('endTime')}: </label>
        <input 
          type="number" 
          min="0" 
          max="23" 
          value={endTime}
          onChange={handleEndTimeChange}
        />
      </div>
    </div>
      <h1>{t('timetable')}</h1>
      <div className="timetable">
        <table>
          <thead>
            <tr>
              <th>{t('time')}</th>
              <th>{currentMonday.getMonth() + 1}/{currentMonday.getDate()}<br/>{t('monday')} </th>
              <th>{new Date(currentMonday.getTime() + 86400000).getMonth() + 1}/{new Date(currentMonday.getTime() + 86400000).getDate()}<br/>{t('tuesday')} </th>
              <th>{new Date(currentMonday.getTime() + 86400000 * 2).getMonth() + 1}/{new Date(currentMonday.getTime() + 86400000 * 2).getDate()}<br/>{t('wednesday')} </th>
              <th>{new Date(currentMonday.getTime() + 86400000 * 3).getMonth() + 1}/{new Date(currentMonday.getTime() + 86400000 * 3).getDate()}<br/>{t('thursday')} </th>
              <th>{new Date(currentMonday.getTime() + 86400000 * 4).getMonth() + 1}/{new Date(currentMonday.getTime() + 86400000 * 4).getDate()}<br/>{t('friday')} </th>
              <th style={{color: 'blue'}}>{new Date(currentMonday.getTime() + 86400000 * 5).getMonth() + 1}/{new Date(currentMonday.getTime() + 86400000 * 5).getDate()}<br/>{t('saturday')} </th>
              <th style={{color: 'red'}}>{new Date(currentMonday.getTime() + 86400000 * 6).getMonth() + 1}/{new Date(currentMonday.getTime() + 86400000 * 6).getDate()}<br/>{t('sunday')} </th>
            </tr>
          </thead>
          <tbody>
            {generateTimeSlots().map((slot, index) => (
              <tr key={index}>
                {slot.isFirstHalf && <td rowSpan="2">{slot.time}</td>}
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="/" className="back-button">{t('backToHome')}</Link>
    </div>
  );
}

export default TimeTable;