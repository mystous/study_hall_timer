import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './css/TimeTable.css';

function TimeTable() {
  const { t } = useTranslation();

  const getMondayDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 26; hour++) {
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

  return (
    <div className="timetable-container">
      <h1>{t('timetable')}</h1>
      <div className="timetable">
        <table>
          <thead>
            <tr>
              <th>{t('time')}</th>
              <th>{t('monday')}</th>
              <th>{t('tuesday')}</th>
              <th>{t('wednesday')}</th>
              <th>{t('thursday')}</th>
              <th>{t('friday')}</th>
              <th>{t('saturday')}</th>
              <th>{t('sunday')}</th>
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