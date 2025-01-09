import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './css/TimeTable.css';
import { useAuth } from './common/AuthContext';

function TimeTable() {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState(6); // 기본값 8시
  const [endTime, setEndTime] = useState(26);    // 기본값 26시
  const [subjects, setSubjects] = useState([]);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/subjects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            username: user.username
          })
        });
        const data = await response.json();
        if (data.success) {
          const result  = data.subjects;
          setSubjects(result);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        // 에러 시 기본 과목 사용
        setSubjects(['Math', 'Science', 'English', 'History']);
      }
    };

    fetchSubjects();
  }, []);

  const getMondayDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };
  const [currentMonday, setCurrentMonday] = useState(getMondayDate(new Date()));

  const today = new Date();
//  const currentMonday = getMondayDate(today);
  
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


    const handleTimeUpdate = (event) => {
      // Remove any existing dialogs first
      const existingDialog = document.querySelector('.subject-selection-dialog');
      if (existingDialog) {
        return;
      }

      // Open popup dialog for subject selection
      const dialog = document.createElement('div');
      dialog.className = 'subject-selection-dialog';
      dialog.style.cssText = `
        position: absolute;
        left: ${event.clientX}px;
        top: ${event.clientY}px;
        transform: none;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        cursor: move;
        margin: 0;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      `;

      // Make dialog draggable
      let isDragging = false;
      let currentX;
      let currentY;
      let initialX;
      let initialY;
      let xOffset = 0;
      let yOffset = 0;

      dialog.addEventListener('mousedown', (e) => {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === dialog) {
          isDragging = true;
        }
      });

      const mouseMoveHandler = (e) => {
        if (isDragging) {
          e.preventDefault();
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
          xOffset = currentX;
          yOffset = currentY;
          dialog.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
      };

      const mouseUpHandler = () => {
        isDragging = false;
      };

      // Add event listeners for dragging
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);

      // Add subject options that can be dragged
      Array.from(subjects).forEach(subject => {
        const subjectEl = document.createElement('div');
        subjectEl.textContent = subject.subjectname;
        subjectEl.draggable = true;
        subjectEl.style.cssText = `
          padding: 10px;
          margin: 5px;
          background: ${subject.color || '#f0f0f0'};
          border-radius: 4px;
          cursor: move;
          border: 1px solid gray;
        `;
        subjectEl.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', subject.subjectname);
        });
        dialog.appendChild(subjectEl);
      });

      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.onclick = () => {
        cleanup();
        dialog.remove();
      };
      closeBtn.style.cssText = `
        margin-top: 10px;
        padding: 5px 10px;
        background: #282c34;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;
      dialog.appendChild(closeBtn);

      document.body.appendChild(dialog);

      // Make timetable cells droppable
      const cells = document.querySelectorAll('.timetable-cell');
      cells.forEach(cell => {
        cell.addEventListener('dragover', (e) => {
          e.preventDefault();
        });
        cell.addEventListener('drop', (e) => {
          e.preventDefault();
          const subject = e.dataTransfer.getData('text/plain');
          cell.textContent = subject;
          cell.style.background = '#e3f2fd';
        });
      });

      // Cleanup function to remove event listeners and dialog
      const cleanup = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        dialog.remove();
      };

      // Add event listener for page visibility change
      document.addEventListener('visibilitychange', cleanup, { once: true });

           
      // Add event listener for page unload
      window.addEventListener('beforeunload', cleanup, { once: true });
    };

  useEffect(() => {
    return () => {
      // Clean up any remaining dialogs when component unmounts
      const dialogs = document.querySelectorAll('.subject-selection-dialog');
      dialogs.forEach(dialog => dialog.remove());
    };
  }, [location]);

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
        &nbsp;&nbsp;
        <button
          style={{
            padding: '5px 10px',
            backgroundColor: '#282c34',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={(e) => handleTimeUpdate(e)}
        >
          {t('update')}
        </button>
      </div>
    </div>
      <div style={{ textAlign: 'center', marginBottom: '10px', marginTop: '20px', fontSize: '25px', fontWeight: 'bold', color: 'gray' }}>
        {currentMonday.getFullYear()} W{String(Math.ceil((currentMonday.getTime() - new Date(currentMonday.getFullYear(), 0, 1).getTime()) / (7 * 86400000))).padStart(2, '0')}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', justifyContent: 'center' }}>
        <button 
          onClick={() => setCurrentMonday(new Date(currentMonday.getTime() - 7 * 86400000))}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}
        >
          ◀
        </button>
        <h1>{t('timetable')}</h1>
        <button
          onClick={() => setCurrentMonday(new Date(currentMonday.getTime() + 7 * 86400000))}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}
        >
          ▶
        </button>
      </div>
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