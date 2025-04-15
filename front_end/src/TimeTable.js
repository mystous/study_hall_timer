import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './css/TimeTable.css';
import { useAuth } from './common/AuthContext';
import { useTimeTable } from './contexts/TimeTableContext';
import SubjectAdd from './SubjectAdd';


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
        setCurrentStartDaywithToday,
        setSchedules,
        fetchSchedule,
        fetchScheduleByDate,
        createSchedule,
        maxScheduleId,
        setMaxScheduleId,
        imageinaryScheduleIds,
        removedSchedules,
        setRemovedSchedules,
        deleteSchedule,
        categories,
        fetchSubjects,
        createSubject,
        setSubjects,
        updateSchedule,
        lastWeekSchedules,
        setLastWeekSchedules,
        fetchLastWeekSchedules
    } = useTimeTable();


    useEffect(() => {
        handleUpdateTimes();
    }, [updateTimes]);


    const [subject_info, setSubjectInfo] = useState(null);
    const [schedule_dirty_flag, setScheduleDirtyFlag] = useState(false);

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
            handleUpdateTimes();
        }
    };

    const handleEndTimeChange = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 0 && value <= 48) {
            setEndTime(value);
            localStorage.setItem('endTime', value);
            handleUpdateTimes();
        }
    };

    let cellId = 0;

    const createScheduleBar = (startRowIndex, dayIndex, height, color, text, id, imageinary_schedule_id) => {
        if (dayIndex < 0) {
            return;
        }

        const rowElement = document.querySelector(`.timetable tbody tr:nth-child(${startRowIndex + 1})`);
        if (rowElement) {
            const cell = rowElement.children[(startRowIndex % 2 === 0 ? dayIndex + 1 : dayIndex)]; // +1 because first column is time
            if (cell) {
                // Create schedule bar container
                const scheduleBar = document.createElement('div');
                scheduleBar.classList.add('schedule-bar');
                if (id != -1) {
                    scheduleBar.setAttribute('data-schedule-id', 'schedule-bar-' + id);
                }
                else {
                    scheduleBar.setAttribute('data-schedule-id', 'schedule-bar-' + imageinary_schedule_id);
                }
                scheduleBar.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 10%;
                    width: 80%;
                    height: ${height / 30 * 32}px;
                    background-color: ${color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
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
                // Add double click handler
                scheduleBar.addEventListener('contextmenu', (e) => {
                    e.preventDefault();

                    // Remove any existing context menus
                    const existingMenu = document.querySelector('.context-menu');
                    if (existingMenu) {
                        existingMenu.remove();
                    }

                    // Create context menu
                    const contextMenu = document.createElement('div');
                    contextMenu.className = 'context-menu';
                    contextMenu.style.cssText = `
                        position: fixed;
                        z-index: 1000;
                        background: white;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        padding: 5px 0;
                        box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
                        left: ${e.clientX}px;
                        top: ${e.clientY}px;
                    `;

                    // Create menu items
                    const menuItems = [
                        {
                            text: t('menu.edit'),
                            action: () => {
                                contextMenu.remove();
                                // Create edit dialog
                                const editDialog = document.createElement('div');
                                editDialog.style.cssText = `
                                    position: fixed;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    background: white;
                                    padding: 20px;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    z-index: 1001;
                                `;

                                const scheduleId = parseInt(scheduleBar.getAttribute('data-schedule-id').split('-')[2]);
                                let schedule;
                                if (scheduleId < imageinaryScheduleIds) {
                                    schedule = schedules.find(s => s.schedule_id === scheduleId);
                                }
                                else {
                                    schedule = schedules.find(s => s.imageinary_schedule_id === scheduleId);
                                }

                                const subject = schedule.study_subject.subjectname;

                                editDialog.innerHTML = `
                                    <h3 style="margin-top:0">${t('edit.title')}</h3>
                                    <p>${t('edit.subject')}: ${subject}</p>
                                    <div style="margin:10px 0">
                                        <div>
                                            <label for="timeInput">${t('edit.time')}:</label>
                                            <input 
                                                id="timeInput"
                                                type="number" 
                                                value="${schedule.scheduled_time}"
                                                min="1"
                                                style="width: 60px; margin-left: 10px"
                                            />
                                            <span>${t('minutes')}</span>
                                        </div>
                                        <div>
                                            <label for="start_time_input">${t('edit.start_time')}:</label>
                                            <input 
                                                id="start_time_input"
                                                type="text" 
                                                value="${schedule.start_time}"
                                                style="width: 200px; margin-left: 10px"
                                            />
                                        </div>
                                        <div>
                                            <lable for="subject_name_input">${t('edit.subject_name')}:</lable>
                                            <input 
                                                id="subject_name_input"
                                                type="text"
                                                value="${schedule.special_text || schedule.study_subject.subjectname}"
                                                style="width: 180px; margin-left: 10px"
                                            />
                                        </div>
                                    </div>
                                    <div style="text-align:right;margin-top:20px">
                                        <button id="cancel-edit" className="edit-button">${t('cancel')}</button>
                                        <button id="save-edit" className="edit-button" style="margin-left:10px"}>${t('save')}</button>
                                    </div>
                                `;

                                document.body.appendChild(editDialog);

                                // Add event listeners
                                document.getElementById('cancel-edit').onclick = () => {
                                    editDialog.remove();
                                };

                                const handleScheduleUpdate = (scheduleId) => {
                                    const newTime = parseInt(editDialog.querySelector('input').value);
                                    const newStartTime = editDialog.querySelector('#start_time_input').value;
                                    const newSpecialText = editDialog.querySelector('#subject_name_input').value;

                                    if (newTime < 1) {
                                        alert(t('edit.invalidTime'));
                                        return;
                                    }

                                    if (scheduleId < imageinaryScheduleIds) {
                                        setSchedules(prevSchedules =>
                                            prevSchedules.map(s =>
                                                (s.schedule_id === scheduleId)
                                                    ? { ...s, scheduled_time: newTime, start_time: newStartTime, special_text: newSpecialText, modified: true }
                                                    : s
                                            )
                                        );
                                    } else {
                                        setSchedules(prevSchedules =>
                                            prevSchedules.map(s =>
                                                (s.imageinary_schedule_id === scheduleId)
                                                    ? { ...s, scheduled_time: newTime, start_time: newStartTime, special_text: newSpecialText }
                                                    : s
                                            )
                                        );
                                    }
                                    setScheduleDirtyFlag(true);
                                    editDialog.remove();
                                };

                                document.getElementById('save-edit').onclick = () => {
                                    handleScheduleUpdate(scheduleId);
                                };

                                editDialog.addEventListener('keypress', (e) => {
                                    if (e.key === 'Enter') {
                                        handleScheduleUpdate(scheduleId);
                                    }
                                });
                            }
                        },
                        {
                            text: t('menu.delete'),
                            action: () => {
                                const confirmDelete = window.confirm(t('deleteScheduleConfirm', { subject: text }));
                                if (confirmDelete) {
                                    const scheduleId = parseInt(scheduleBar.getAttribute('data-schedule-id').split('-')[2]);
                                    if (scheduleId < imageinaryScheduleIds) {
                                        setRemovedSchedules(prevRemovedSchedules => [
                                            ...prevRemovedSchedules,
                                            schedules.find(s => s.schedule_id === scheduleId)
                                        ]);

                                        setSchedules(prevSchedules => prevSchedules.filter(s => s.schedule_id !== scheduleId));
                                    }
                                    else {
                                        setSchedules(prevSchedules => prevSchedules.filter(s => s.imageinary_schedule_id !== imageinary_schedule_id));
                                    }

                                    setScheduleDirtyFlag(true);
                                }
                                contextMenu.remove();
                            }
                        }
                    ];

                    menuItems.forEach(item => {
                        const menuItem = document.createElement('div');
                        menuItem.textContent = item.text;
                        menuItem.style.cssText = `
                            padding: 5px 20px;
                            cursor: pointer;
                            &:hover {
                                background: #f0f0f0;
                            }
                        `;
                        menuItem.addEventListener('click', item.action);
                        contextMenu.appendChild(menuItem);
                    });

                    document.body.appendChild(contextMenu);

                    // Close menu when clicking outside
                    document.addEventListener('click', function closeMenu(e) {
                        if (!contextMenu.contains(e.target)) {
                            contextMenu.remove();
                            document.removeEventListener('click', closeMenu);
                        }
                    });
                });
                scheduleBar.addEventListener('dblclick', () => {
                    // Create confirmation dialog
                    scheduleBar.style.userSelect = 'none';

                });
            }
        }
    };

    const handleUpdateTimes = () => {
        const removeExistingSchedules = () => {
            document.querySelectorAll('[data-schedule-id]').forEach(element => {
                element.remove();
            });
        };
        removeExistingSchedules();
        const cells = document.querySelectorAll('.timetable td:not(:first-child)');
        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.style.background = 'none';
        });

        schedules.forEach(schedule => {
            const getScheduleIndices = (scheduleTime) => {
                // Calculate days since Jan 1, 1900
                const startDayNum = Math.floor((currentStartDay.getTime() - new Date(1900, 0, 1).getTime()) / (24 * 60 * 60 * 1000));
                const [year, month, day] = scheduleTime.split('T')[0].split('-');
                const scheduleDayNum = Math.floor((new Date(year, month - 1, day).getTime() - new Date(1900, 0, 1).getTime()) / (24 * 60 * 60 * 1000));

                const dayIndex = scheduleDayNum - startDayNum;
                // console.log('startDayNum is ', startDayNum, 'scheduleDayNum is ', scheduleDayNum, 'dayIndex is ', dayIndex);

                const scheduleHour = parseInt(scheduleTime.substring(11, 13));
                const scheduleMinute = parseInt(scheduleTime.substring(14, 16));

                const scheduleTimeInMinutes = scheduleHour * 60 + scheduleMinute;
                const startTimeInMinutes = startTime * 60;

                const minuteDiff = scheduleTimeInMinutes - startTimeInMinutes;
                let rowIndex = Math.floor(minuteDiff / 30);

                let adjust = 0;

                if (rowIndex < 0) {
                    adjust = minuteDiff;
                    rowIndex = 0;
                }
                return { rowIndex, dayIndex, adjust };
            };

            const { rowIndex, dayIndex, adjust } = getScheduleIndices(schedule.start_time);
            //console.log('rowIndex is ', rowIndex, 'dayIndex is ', dayIndex, 'adjust is ', adjust);
            if (adjust + schedule.scheduled_time > 0) {
                createScheduleBar(rowIndex, dayIndex, schedule.scheduled_time + adjust, schedule.study_subject.color, 
                    schedule.special_text || schedule.study_subject.subjectname, schedule.schedule_id, schedule.imageinary_schedule_id);
            }

            const getNightScheduleIndices = (scheduleTime) => {

                const scheduleHour = parseInt(scheduleTime.substring(11, 13));
                const scheduleMinute = parseInt(scheduleTime.substring(14, 16));

                if (scheduleHour >= 6) {
                    return { rowIndex: -1, dayIndex: -1, adjust: 0 };
                }

                // Calculate days since Jan 1, 1900 to handle month boundaries correctly
                const getDayNum = (date) => {
                    return Math.floor((date.getTime() - new Date(1900, 0, 1).getTime()) / (24 * 60 * 60 * 1000));
                };
                const startDayNum = getDayNum(currentStartDay);
                const scheduleDate = new Date(scheduleTime);
                const scheduleDayNum = getDayNum(scheduleDate);
                const dayIndex = scheduleDayNum - startDayNum - 2;

                const scheduleTimeInMinutes = (scheduleHour + 24) * 60 + scheduleMinute;
                const startTimeInMinutes = startTime * 60;

                const minuteDiff = scheduleTimeInMinutes - startTimeInMinutes;
                let rowIndex = Math.floor(minuteDiff / 30);

                let adjust = 0;
                if (rowIndex < 0) {
                    adjust = minuteDiff;
                    rowIndex = 0;
                }
                return { rowIndex, dayIndex, adjust };
            };  
            const nightIndices = getNightScheduleIndices(schedule.start_time);
            const rowIndex_night = nightIndices.rowIndex;
            const dayIndex_night = nightIndices.dayIndex;
            const adjust_night = nightIndices.adjust;
            if (rowIndex_night != -1 && dayIndex_night != -1) {
    
                createScheduleBar(rowIndex_night, dayIndex_night, schedule.scheduled_time + adjust_night, schedule.study_subject.color, 
                    schedule.special_text || schedule.study_subject.subjectname, schedule.schedule_id, schedule.imageinary_schedule_id);
            }
        });
    };

    useEffect(() => {
        handleUpdateTimes();
    }, [schedules]);

    const handleTimeUpdate = (event, refresh = false) => {
        // Remove any existing dialogs first
        const existingDialog = document.querySelector('.subject-selection-dialog');
        if (existingDialog && refresh !== true) {
            return;
        }

        let dialog;
        let subjectsContainer;
        let currentPage = 1;
        const itemsPerPage = 30;

        if (refresh === false) {
            dialog = document.createElement('div');
            dialog.className = 'subject-selection-dialog';
            dialog.style.cssText = `
                position: absolute;
                left: ${event.clientX}px;
                top: ${event.clientY}px;
                transform: none;
                background: white;
                padding: 10px;
                border-radius: 4px;
                box-shadow: 0 1px 5px rgba(0,0,0,0.1);
                z-index: 100;
                cursor: move;
                margin: 0;
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
            `;

            // Make dialog draggable
            let isDragging = false;
            let currentX, currentY, initialX, initialY;
            let xOffset = 0, yOffset = 0;

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
            subjectsContainer = document.createElement('div');
            subjectsContainer.id = 'subjects-container';
            subjectsContainer.style.cssText = `
                display: grid;
                grid-template-columns: 1fr 1fr;
                margin-top: 20px;
                gap: 1px;
                width: 100%;
            `;
            dialog.appendChild(subjectsContainer);

        }

        if (refresh) {
            dialog = document.querySelector('.subject-selection-dialog');

            subjectsContainer = document.getElementById('subjects-container');
            if (subjectsContainer) {
                while (subjectsContainer.firstChild) {
                    subjectsContainer.removeChild(subjectsContainer.firstChild);
                }
            }

            console.log('subjectsContainer is ', subjects);
        }

        const getTimeText = (unitTime) => {
            const hours = Math.floor(unitTime / 60);
            const minutes = unitTime % 60;
            return hours > 0 ? (minutes > 0 ?
                `${hours}${t('hours')} ${minutes}${t('minutes')}` :
                `${hours}${t('hours')}`) :
                `${minutes}${t('minutes')}`;
        };

        // Sort subjects by unit_time and map to heights starting from 50px
        const baseHeight = 30;
        const heightGap = 20;
        const sortedUnitTimes = Array.from(new Set(Array.from(subjects).map(s => s.unit_time))).sort((a, b) => a - b);
        const heightMap = Object.fromEntries(sortedUnitTimes.map((time, i) => [time, baseHeight + (i * heightGap)]));

        const allSubjects = Array.from(subjects);
        const totalPages = Math.ceil(allSubjects.length / itemsPerPage);

        const renderPage = (page) => {
            // Clear existing subjects
            while (subjectsContainer.firstChild) {
                subjectsContainer.removeChild(subjectsContainer.firstChild);
            }

            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageSubjects = allSubjects.slice(startIndex, endIndex);

            // Split subjects into left and right columns
            const leftSubjects = pageSubjects.slice(0, Math.ceil(pageSubjects.length / 2));
            const rightSubjects = pageSubjects.slice(Math.ceil(pageSubjects.length / 2));

            // Create a subject element with given subject and index
            const createSubjectElement = (subject, index, totalLength) => {
                const subjectEl = document.createElement('div');
                const timeText = getTimeText(subject.unit_time);
                const boldText = document.createElement('strong');
                boldText.textContent = `${subject.subjectname} - ${timeText}`;
                subjectEl.appendChild(boldText);

                subjectEl.id = `subject-${subject.subject_id}`;
                subjectEl.draggable = true;
                subjectEl.subject_info = subject;

                subjectEl.style.cssText = `
                    padding: 5px;
                    margin: 2.5px 2.5px ${index === totalLength - 1 ? '2.5px' : '7.5px'} 2.5px;
                    height: ${heightMap[subject.unit_time] / 2}px;
                    background: ${subject.color || '#f0f0f0'};
                    border-radius: 2px;
                    cursor: move;
                    border: 1px solid gray;
                    display: flex;
                    align-items: center;
                `;

                subjectEl.addEventListener('dragend', (e) => {
                    const element = document.elementFromPoint(e.clientX, e.clientY);
                    subjectEl.style.opacity = '1';

                    if (element) {
                        const mouseUpEvent = new MouseEvent('mouseup', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                            clientX: e.clientX,
                            clientY: e.clientY
                        });
                        element.dispatchEvent(mouseUpEvent);
                    }

                    setSubjectInfo(null);
                });

                subjectEl.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });

                subjectEl.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', subjectEl.id);
                    e.dataTransfer.effectAllowed = 'move';
                    subjectEl.style.opacity = '0.5';
                    setSubjectInfo(subjectEl.subject_info);
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

            // Update pagination controls
            const paginationContainer = document.getElementById('pagination-container') || document.createElement('div');
            paginationContainer.id = 'pagination-container';
            paginationContainer.style.cssText = `
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 10px;
            `;
            paginationContainer.innerHTML = '';

            if (totalPages > 1) {
                // Previous button
                if (page > 1) {
                    const prevButton = document.createElement('button');
                    prevButton.textContent = '←';
                    prevButton.onclick = () => renderPage(page - 1);
                    prevButton.style.cssText = `
                        margin: 0 5px;
                        padding: 5px 10px;
                        cursor: pointer;
                    `;
                    paginationContainer.appendChild(prevButton);
                }

                // Page numbers
                for (let i = 1; i <= totalPages; i++) {
                    const pageButton = document.createElement('button');
                    pageButton.textContent = i;
                    pageButton.onclick = () => renderPage(i);
                    pageButton.style.cssText = `
                        margin: 0 5px;
                        padding: 5px 10px;
                        cursor: pointer;
                        background: ${i === page ? '#282c34' : 'white'};
                        color: ${i === page ? 'white' : 'black'};
                    `;
                    paginationContainer.appendChild(pageButton);
                }

                // Next button
                if (page < totalPages) {
                    const nextButton = document.createElement('button');
                    nextButton.textContent = '→';
                    nextButton.onclick = () => renderPage(page + 1);
                    nextButton.style.cssText = `
                        margin: 0 5px;
                        padding: 5px 10px;
                        cursor: pointer;
                    `;
                    paginationContainer.appendChild(nextButton);
                }

                if (!document.getElementById('pagination-container')) {
                    dialog.appendChild(paginationContainer);
                }
            }
        };

        // Initial render of first page
        renderPage(currentPage);

        // Cleanup function to remove event listeners and dialog
        const cleanup = () => {
            document.removeEventListener('visibilitychange', () => { });

            const cells = document.querySelectorAll('.timetable-cell');
            cells.forEach(cell => {
                cell.removeEventListener('dragover', () => { });
                cell.removeEventListener('drop', () => { });
            });

            const dialog = document.querySelector('subject-selection-dialog');
            if (dialog) {
                dialog.remove();
            }
        };

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = t('close');
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

        // Add subject button
        const addSubjectBtn = document.createElement('button');
        addSubjectBtn.textContent = t('addSubject');
        addSubjectBtn.onclick = () => {
            const subjectAdd = new SubjectAdd({
                t,
                categories: categories,
                onSave: (subject_name, category_id, subject_color, subject_unit_time) => {
                    createSubject(subject_name, category_id, subject_color, subject_unit_time);
                }
            });
            subjectAdd.show();
        };
        addSubjectBtn.style.cssText = `
            margin: 10px;
            padding: 5px 10px;
            background: #282c34;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        dialog.appendChild(addSubjectBtn);

        document.body.appendChild(dialog);
    };

    const handleStartWithMondayChange = (e) => {
        setStartWithMonday(e.target.checked);
        localStorage.setItem('startWithMonday', e.target.checked);
        fetchScheduleByDate(currentStartDay);
    };

    const updateModifiedSchedules = () => {
        createSchedule();
        updateSchedule();
        setLastWeekSchedules([]);
        setScheduleDirtyFlag(false);
    };

    const handleDragEnd = (e, index, cellIndex) => {
        if (!subject_info) return;
        // Calculate day and time from indices
        const currentDate = new Date(currentStartDay);
        currentDate.setDate(currentDate.getDate() + cellIndex);

        // Calculate hours and minutes (30 min intervals)
        const hours = Math.floor(startTime + (index / 2));
        const minutes = (index % 2) * 30;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        const formattedDate = currentDate.toLocaleDateString();
        const [year, month, day] = formattedDate.split(". ").filter(part => part !== "").map(part => part.replace(".", ""));

        let adjustedYear = year;
        let adjustedMonth = month;
        let adjustedDay = day;
        let adjustedHours = hours;

        if (hours >= 24) {
            // Adjust date by adding a day
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            [adjustedYear, adjustedMonth, adjustedDay] = nextDate.toLocaleDateString()
                .split(". ")
                .filter(part => part !== "")
                .map(part => part.replace(".", ""));
            
            // Adjust hours to be within 24 hour range
            adjustedHours = hours - 24;
        }

        const adjustedTimeString = `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const formattedDateTime = `${adjustedYear}-${adjustedMonth.padStart(2, '0')}-${adjustedDay.padStart(2, '0')}T${adjustedTimeString}:00.000Z`;

        const newSchedule = {
            schedule_id: -1, // ID for create new schedule
            imageinary_schedule_id: maxScheduleId,
            start_time: formattedDateTime,
            scheduled_time: subject_info.unit_time,
            subject_id: subject_info.subject_id,
            study_subject: {
                category: {
                    category_name: "자기주도",
                },
                category_id: 1,
                color: subject_info.color,
                subject_id: subject_info.subject_id,
                subjectname: subject_info.subjectname
            },
            modified: false
        };
        setMaxScheduleId(maxScheduleId + 1);
        // Add new schedule to existing schedules
        setSchedules(prevSchedules => [...prevSchedules, newSchedule]);
        setScheduleDirtyFlag(true);
        handleUpdateTimes();
    };

    const copyLastWeekSchedules = () => {
        fetchLastWeekSchedules();
    }

    useEffect(() => {
        //console.log('lastWeekSchedules is ', lastWeekSchedules);
        if (lastWeekSchedules.length > 0) {
            for (let i = 0; i < lastWeekSchedules.length; i++) {
                const schedule = lastWeekSchedules[i];
                if(schedule.dimmed != 1) {
                    const scheduleDate = new Date(schedule.start_time);
                    scheduleDate.setDate(scheduleDate.getDate() + 7);
                    schedule.start_time = scheduleDate.toISOString();
                    schedule.scheduled_time = schedule.scheduled_time;
                    schedule.schedule_id = -1;
                    schedule.imageinary_schedule_id = maxScheduleId;
                    setMaxScheduleId(maxScheduleId + 1);
                    setSchedules(prevSchedules => [...prevSchedules, schedule]);
                    console.log('New schedule is ', schedule);
                }
            }
            setScheduleDirtyFlag(true);
            handleUpdateTimes();
        }
    }, [lastWeekSchedules]);

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
                        max="28"
                        value={endTime}
                        onChange={handleEndTimeChange}
                    />
                    &nbsp;&nbsp;
                    <label>{t('startWithMonday')}: </label>
                    <input
                        type="checkbox"
                        checked={startWithMonday}
                        onChange={(e) => {
                            handleStartWithMondayChange(e);
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
                    &nbsp;&nbsp;
                    <button
                        style={{
                            padding: '5px 10px',
                            backgroundColor: schedule_dirty_flag ? '#ff4444' : '#ffcccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: schedule_dirty_flag ? 'pointer' : 'not-allowed',
                            opacity: schedule_dirty_flag ? 1 : 0.6
                        }}
                        onClick={(e) => {
                            if (schedule_dirty_flag) {
                                updateModifiedSchedules();
                                deleteSchedule();
                                fetchScheduleByDate(currentStartDay);
                            }
                        }}
                        disabled={!schedule_dirty_flag}
                    >
                        {t('updateSchedule')}
                    </button>
                    &nbsp;&nbsp;
                    <button
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                        onClick={(e)=>{ copyLastWeekSchedules();}}
                    >
                        {t('copyLastWeek')}
                    </button>
                </div>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '10px', marginTop: '20px', fontSize: '25px', fontWeight: 'bold', color: 'gray' }}>
                <span>
                    {currentStartDay.getFullYear()} W{String(Math.ceil((currentStartDay.getTime() - new Date(currentStartDay.getFullYear(), 0, 1).getTime()) / (7 * 86400000))).padStart(2, '0')}
                    <button
                        onClick={() => {
                            setCurrentStartDaywithToday();
                            fetchScheduleByDate(currentStartDay);
                        }}
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
                        const newDate = new Date(currentStartDay.getTime() - 7 * 86400000);
                        // console.log('newDate is ', newDate);
                        setCurrentStartDay(newDate);
                        fetchScheduleByDate(newDate);
                    }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}
                >
                    ◀
                </button>
                <h1>{t('timetable')}</h1>
                <button
                    onClick={() => {
                        setCurrentStartDay(new Date(currentStartDay.getTime() + 7 * 86400000));
                        fetchScheduleByDate(new Date(currentStartDay.getTime() + 7 * 86400000));
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
                                    <th>{currentStartDay.getMonth() + 1}/{currentStartDay.getDate()}<br />{t('monday')} </th>
                                    <th>{new Date(currentStartDay.getTime() + 86400000).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000).getDate()}<br />{t('tuesday')} </th>
                                    <th>{new Date(currentStartDay.getTime() + 86400000 * 2).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 2).getDate()}<br />{t('wednesday')} </th>
                                    <th>{new Date(currentStartDay.getTime() + 86400000 * 3).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 3).getDate()}<br />{t('thursday')} </th>
                                    <th>{new Date(currentStartDay.getTime() + 86400000 * 4).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 4).getDate()}<br />{t('friday')} </th>
                                    <th style={{ color: 'blue' }}>{new Date(currentStartDay.getTime() + 86400000 * 5).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 5).getDate()}<br />{t('saturday')} </th>
                                    <th style={{ color: 'red' }}>{new Date(currentStartDay.getTime() + 86400000 * 6).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 6).getDate()}<br />{t('sunday')} </th>
                                </>
                            ) : (
                                <>
                                    <th style={{ color: 'red' }}>{currentStartDay.getMonth() + 1}/{currentStartDay.getDate()}<br />{t('sunday')} </th>
                                    <th>{new Date(currentStartDay.getTime() + 86400000).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000).getDate()}<br />{t('monday')} </th>
                                    <th>{new Date(currentStartDay.getTime() + 86400000 * 2).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 2).getDate()}<br />{t('tuesday')} </th>
                                    <th>{new Date(currentStartDay.getTime() + 86400000 * 3).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 3).getDate()}<br />{t('wednesday')} </th>
                                    <th>{new Date(currentStartDay.getTime() + 86400000 * 4).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 4).getDate()}<br />{t('thursday')} </th>
                                    <th>{new Date(currentStartDay.getTime() + 86400000 * 5).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 5).getDate()}<br />{t('friday')} </th>
                                    <th style={{ color: 'blue' }}>{new Date(currentStartDay.getTime() + 86400000 * 6).getMonth() + 1}/{new Date(currentStartDay.getTime() + 86400000 * 6).getDate()}<br />{t('saturday')} </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {generateTimeSlots().map((slot, index) => (
                            <tr key={index}>
                                {slot.isFirstHalf && <td rowSpan="2">{slot.time}</td>}
                                <td className={`timetable-cell-${index}-0`} onMouseUp={(e) => handleDragEnd(e, index, 0)}></td>
                                <td className={`timetable-cell-${index}-1`} onMouseUp={(e) => handleDragEnd(e, index, 1)}></td>
                                <td className={`timetable-cell-${index}-2`} onMouseUp={(e) => handleDragEnd(e, index, 2)}></td>
                                <td className={`timetable-cell-${index}-3`} onMouseUp={(e) => handleDragEnd(e, index, 3)}></td>
                                <td className={`timetable-cell-${index}-4`} onMouseUp={(e) => handleDragEnd(e, index, 4)}></td>
                                <td className={`timetable-cell-${index}-5`} onMouseUp={(e) => handleDragEnd(e, index, 5)}></td>
                                <td className={`timetable-cell-${index}-6`} onMouseUp={(e) => handleDragEnd(e, index, 6)}></td>
                     
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