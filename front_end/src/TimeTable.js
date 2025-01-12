import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './css/TimeTable.css';
import { useAuth } from './common/AuthContext';
import { useTimeTable } from './contexts/TimeTableContext';

function TimeTable() {
    const { t } = useTranslation();
    const location = useLocation();
    const [startTime, setStartTime] = useState(() => {
        const savedStartTime = localStorage.getItem('startTime');
        return savedStartTime ? parseInt(savedStartTime) : 6;
    });
    const [endTime, setEndTime] = useState(() => {
        const savedEndTime = localStorage.getItem('endTime'); 
        return savedEndTime ? parseInt(savedEndTime) : 26;
    });
    const { user } = useAuth();
    const { schedules, 
            subjects, 
            currentStartDay, 
            setCurrentStartDay, 
            getMondayDate, 
            getCurrentStartDay, 
            startWithMonday,
            updateTimes,
            setStartWithMonday,
            setCurrentStartDaywithToday
          } = useTimeTable();
    let scheduleStartDay = getCurrentStartDay();
    const savedStartWithMonday = localStorage.getItem('startWithMonday');
    if (savedStartWithMonday !== null) {
        setStartWithMonday(savedStartWithMonday === 'true');
    }

    useEffect(() => {
        scheduleStartDay.setTime(getCurrentStartDay().getTime());
        console.log('scheduleStartDay is ', scheduleStartDay);
    }, [currentStartDay]);

    useEffect(() => {
        console.log('subjects is updated');
        handleUpdateTimes();
    }, [updateTimes]); 
 
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
            localStorage.setItem('startTime', value);
        }
    };
  
    const handleEndTimeChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 0 && value <= 48) {
            setEndTime(value);
            localStorage.setItem('endTime', value);
        }
    };

    let cellId = 0;

    const createScheduleBar = (startRowIndex, dayIndex, height, color, text, id) => {
      const rowElement = document.querySelector(`.timetable tbody tr:nth-child(${startRowIndex + 1})`);
      if (rowElement) {
          const cell = rowElement.children[(startRowIndex % 2 === 0 ? dayIndex + 1 : dayIndex)]; // +1 because first column is time
          if (cell) {
              // Create schedule bar container
              const scheduleBar = document.createElement('div');
              scheduleBar.classList.add('schedule-bar');
              scheduleBar.setAttribute('data-schedule-id', 'schedule-bar-' + id);
              scheduleBar.style.cssText = `
                  position: absolute;
                  top: 0;
                  left: 10%;
                  width: 40%;
                  height: ${height/30 * 47}px;
                  background-color: ${color};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  padding: 0px;
                  overflow: auto;
                  word-wrap: break-word;
                  white-space: normal;
                  font-weight: bold;
                  border: 1px solid #444;
              `;
              scheduleBar.textContent = text;
              
              // Set cell position to relative for absolute positioning of bar
              cell.style.position = 'relative';
              cell.appendChild(scheduleBar);
          }
      }
  };


    const handleUpdateTimes = () => {
      console.log('updateTimes is ', updateTimes);

        // Remove all elements with data-schedule-id- attribute
        const removeExistingSchedules = () => {
            document.querySelectorAll('[data-schedule-id]').forEach(element => {
                element.remove();
            });
        };
        removeExistingSchedules();
        // Clear existing schedules
        const cells = document.querySelectorAll('.timetable td:not(:first-child)');
        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.style.background = 'none';
        });

        console.log('schedules is ', schedules);

      
        // Display schedules as bars
        schedules.forEach(schedule => {
            console.log('schedule is ', schedule);
            // Helper function to create schedule bar
            
            const getScheduleIndices = (scheduleTime) => {
                // Calculate days difference between schedule date and current start day
                const startDayNum = currentStartDay.toISOString().split('T')[0].split('-')[2];
                const scheduleDayNum = scheduleTime.split('T')[0].split('-')[2];
                const dayIndex = parseInt(scheduleDayNum) - parseInt(startDayNum);
                console.log('startDayNum is ', startDayNum, 'scheduleDayNum is ', scheduleDayNum, 'dayIndex is ', dayIndex);
                // Calculate row index based on hour and minute relative to startTime
                
                // Extract hours and minutes from scheduleTime
                const scheduleHour = parseInt(scheduleTime.split('T')[1].split(':')[0]);
                const scheduleMinute = parseInt(scheduleTime.split('T')[1].split(':')[1]);

                // Convert both times to minutes since midnight for easier comparison
                const scheduleTimeInMinutes = scheduleHour * 60 + scheduleMinute;
                const startTimeInMinutes = startTime * 60;

                // Calculate difference in minutes
                const minuteDiff = scheduleTimeInMinutes - startTimeInMinutes;

                // Calculate rowIndex based on 30-minute intervals
                // Each hour has 2 rows (one for :00 and one for :30)
                const rowIndex = Math.floor(minuteDiff / 30);

                console.log('minuteDiff is ', minuteDiff, 'rowIndex is ', rowIndex);
       


                
                return { rowIndex, dayIndex };
            };

            const { rowIndex, dayIndex } = getScheduleIndices(schedule.start_time);
            
            console.log(rowIndex, dayIndex, schedule.scheduled_time, schedule.study_subject.color, schedule.study_subject.subjectname, schedule.schedule_id);
            createScheduleBar(rowIndex, dayIndex, schedule.scheduled_time, schedule.study_subject.color, schedule.study_subject.subjectname, schedule.schedule_id);
            
            // const startHour = parseInt(schedule.start_time.split(':')[0]);
            // const endHour = parseInt(schedule.end_time.split(':')[0]);
            // const dayIndex = startWithMonday ? 
            //     (schedule.day_of_week === 0 ? 6 : schedule.day_of_week - 1) : 
            //     schedule.day_of_week;
            
            // // Calculate row indices for start and end times
            // const startRowIndex = (startHour - startTime) * 2;
            // const endRowIndex = (endHour - startTime) * 2;
            
            // // Get all cells for this schedule
            // for (let i = startRowIndex; i < endRowIndex; i++) {
            //     const rowElement = document.querySelector(`.timetable tbody tr:nth-child(${i + 1})`);
            //     if (rowElement) {
            //         const cell = rowElement.children[dayIndex + 1]; // +1 because first column is time
            //         if (cell) {
            //             // Create schedule bar
            //             cell.style.background = '#e3f2fd';
            //             cell.style.position = 'relative';
                        
            //             // Only add text in first cell of schedule
            //             if (i === startRowIndex) {
            //                 const scheduleText = document.createElement('div');
            //                 scheduleText.style.cssText = `
            //                     position: absolute;
            //                     top: 0;
            //                     left: 0;
            //                     right: 0;
            //                     bottom: 0;
            //                     display: flex;
            //                     align-items: center;
            //                     justify-content: center;
            //                     font-size: 12px;
            //                     padding: 2px;
            //                     overflow: hidden;
            //                     text-overflow: ellipsis;
            //                     white-space: nowrap;
            //                 `;
            //                 scheduleText.textContent = schedule.subject_name;
            //                 cell.appendChild(scheduleText);
            //             }
            //         }
            //     }
            // }
        });
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
        // Create container for 2 columns
        const subjectsContainer = document.createElement('div');
        subjectsContainer.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1px;
            width: 100%;
        `;
        dialog.appendChild(subjectsContainer);

        // Sort subjects by unit_time and map to heights starting from 50px
        const baseHeight = 30;
        const heightGap = 20;
        const sortedUnitTimes = Array.from(new Set(Array.from(subjects).map(s => s.unit_time))).sort((a,b) => a - b);
        const heightMap = Object.fromEntries(sortedUnitTimes.map((time, i) => [time, baseHeight + (i * heightGap)]));

        // Split subjects into left and right columns
        const leftSubjects = Array.from(subjects).slice(0, Math.ceil(subjects.size/2));
        const rightSubjects = Array.from(subjects).slice(Math.ceil(subjects.size/2));

        const getTimeText = (unitTime) => {
            const hours = Math.floor(unitTime / 60);
            const minutes = unitTime % 60;
            return hours > 0 ? (minutes > 0 ?
                `${hours}${t('hours')} ${minutes}${t('minutes')}` : 
                `${hours}${t('hours')}`) : 
                `${minutes}${t('minutes')}`;
        };

        // Create a subject element with given subject and index
        const createSubjectElement = (subject, index, totalLength) => {
            const subjectEl = document.createElement('div');
            const timeText = getTimeText(subject.unit_time);
            const boldText = document.createElement('strong');
            boldText.textContent = `${subject.subjectname} - ${timeText}`;
            subjectEl.appendChild(boldText);
            subjectEl.draggable = true;
            subjectEl.style.cssText = `
                padding: 10px;
                margin: 5px 5px ${index === totalLength-1 ? '5px' : '15px'} 5px;
                height: ${heightMap[subject.unit_time]}px;
                background: ${subject.color || '#f0f0f0'};
                border-radius: 4px;
                cursor: move;
                border: 1px solid gray;
                display: flex;
                align-items: center;
            `;
            subjectEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', subject.subjectname);
            });
            return subjectEl;
        };

        // Create left column subjects
        leftSubjects.forEach((subject, index) => {
            const subjectEl = createSubjectElement(subject, index, leftSubjects.length);
            subjectsContainer.appendChild(subjectEl);
        });

        // Create right column subjects  
        rightSubjects.forEach((subject, index) => {
            const subjectEl = createSubjectElement(subject, index, rightSubjects.length);
            subjectsContainer.appendChild(subjectEl);
        });
        // Cleanup function to remove event listeners and dialog
        const cleanup = () => {
            // Remove visibility change event listener
            document.removeEventListener('visibilitychange', () => {});
            
            // Remove drag event listeners from cells
            const cells = document.querySelectorAll('.timetable-cell');
            cells.forEach(cell => {
                cell.removeEventListener('dragover', () => {});
                cell.removeEventListener('drop', () => {});
            });

            // Remove dialog if it exists
            const dialog = document.querySelector('subject-selection-dialog');
            if (dialog) {
                dialog.remove();
            }
        };
        
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
    };

    const handleStartWithMondayChange = (e) => {
      setStartWithMonday(e.target.checked);
        localStorage.setItem('startWithMonday',startWithMonday);
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
                    &nbsp;&nbsp;
                    <label>{t('startWithMonday')}: </label>
                    <input
                        type="checkbox"
                        checked={startWithMonday}
                        onChange={(e) => {
                            setStartWithMonday(e.target.checked);
                        }}
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
                <span>
                    {scheduleStartDay.getFullYear()} W{String(Math.ceil((scheduleStartDay.getTime() - new Date(scheduleStartDay.getFullYear(), 0, 1).getTime()) / (7 * 86400000))).padStart(2, '0')}
                    <button
                        onClick={() => setCurrentStartDaywithToday()}
                        style={{
                            marginLeft: '15px',
                            padding: '3px 8px',
                            backgroundColor: '#EEEEEE',
                            color: 'black', 
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {t('thisWeek')}
                    </button>
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', justifyContent: 'center' }}>
                <button 
                    onClick={() => {
                        setCurrentStartDay(new Date(currentStartDay.getTime() - 7 * 86400000));
                    }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}
                >
                    ◀
                </button>
                <h1>{t('timetable')}</h1>
                <button
                    onClick={() => {
                        setCurrentStartDay(new Date(currentStartDay.getTime() + 7 * 86400000));
                    }}
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
                            {startWithMonday ? (
                                <>
                                    <th>{scheduleStartDay.getMonth() + 1}/{scheduleStartDay.getDate()}<br/>{t('monday')} </th>
                                    <th>{new Date(scheduleStartDay.getTime() + 86400000).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000).getDate()}<br/>{t('tuesday')} </th>
                                    <th>{new Date(scheduleStartDay.getTime() + 86400000 * 2).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 2).getDate()}<br/>{t('wednesday')} </th>
                                    <th>{new Date(scheduleStartDay.getTime() + 86400000 * 3).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 3).getDate()}<br/>{t('thursday')} </th>
                                    <th>{new Date(scheduleStartDay.getTime() + 86400000 * 4).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 4).getDate()}<br/>{t('friday')} </th>
                                    <th style={{color: 'blue'}}>{new Date(scheduleStartDay.getTime() + 86400000 * 5).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 5).getDate()}<br/>{t('saturday')} </th>
                                    <th style={{color: 'red'}}>{new Date(scheduleStartDay.getTime() + 86400000 * 6).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 6).getDate()}<br/>{t('sunday')} </th>
                                </>
                            ) : (
                                <>
                                    <th style={{color: 'red'}}>{scheduleStartDay.getMonth() + 1}/{scheduleStartDay.getDate()}<br/>{t('sunday')} </th>
                                    <th>{new Date(scheduleStartDay.getTime() + 86400000).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000).getDate()}<br/>{t('monday')} </th>
                                    <th>{new Date(scheduleStartDay.getTime() + 86400000 * 2).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 2).getDate()}<br/>{t('tuesday')} </th>
                                    <th>{new Date(scheduleStartDay.getTime() + 86400000 * 3).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 3).getDate()}<br/>{t('wednesday')} </th>
                                    <th>{new Date(scheduleStartDay.getTime() + 86400000 * 4).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 4).getDate()}<br/>{t('thursday')} </th>
                                    <th>{new Date(scheduleStartDay.getTime() + 86400000 * 5).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 5).getDate()}<br/>{t('friday')} </th>
                                    <th style={{color: 'blue'}}>{new Date(scheduleStartDay.getTime() + 86400000 * 6).getMonth() + 1}/{new Date(scheduleStartDay.getTime() + 86400000 * 6).getDate()}<br/>{t('saturday')} </th>
                                </>
                            )}
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