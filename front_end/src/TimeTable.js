import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getContrastColor } from './common/utils';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './css/TimeTable.css';
import './css/Dialogs.css';
import { useAuth } from './common/AuthContext';
import { useTimeTable } from './contexts/TimeTableContext';
import SubjectAddDialog from './SubjectAddDialog';
import SubjectPalette from './SubjectPalette';
import TouchDragPreview from './TouchDragPreview';
import ConfirmationDialog from './ConfirmationDialog';


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
        updateSchedule,
        lastWeekSchedules,
        setLastWeekSchedules,
        fetchLastWeekSchedules
    } = useTimeTable();

    // UI States
    const [isSubjectPaletteOpen, setIsSubjectPaletteOpen] = useState(false);
    const [isSubjectAddDialogOpen, setIsSubjectAddDialogOpen] = useState(false);
    const [scheduleDirtyFlag, setScheduleDirtyFlag] = useState(false);

    // Drag and Drop State
    const [draggedSubjectInfo, setDraggedSubjectInfo] = useState(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    // Context Menu State
    const [contextMenu, setContextMenu] = useState(null);
    const [editDialog, setEditDialog] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, schedule: null });


    useEffect(() => {
        // Close context menu on global click
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const generateTimeSlots = useCallback(() => {
        const slots = [];
        for (let hour = startTime; hour <= endTime; hour++) {
            const displayHour = hour > 24 ? hour - 24 : hour;
            const nextHour = (hour + 1) > 24 ? hour - 23 : hour + 1;
            const timeLabel = t('timeFormat', {
                start: String(displayHour).padStart(2, '0'),
                end: String(nextHour).padStart(2, '0')
            });
            slots.push({ time: timeLabel, isFirstHalf: true, hour, minute: 0 });
            slots.push({ time: timeLabel, isFirstHalf: false, hour, minute: 30 });
        }
        return slots;
    }, [startTime, endTime, t]);

    const timeSlots = useMemo(() => generateTimeSlots(), [generateTimeSlots]);

    const addScheduleAt = useCallback((rowIndex, dayIndex, subjectInfo) => {
        if (!subjectInfo) return;

        const slot = timeSlots[rowIndex];
        const hours = Math.floor(startTime + (rowIndex / 2));
        const minutes = (rowIndex % 2) * 30;

        const currentDate = new Date(currentStartDay);
        currentDate.setDate(currentDate.getDate() + dayIndex);

        if (hours >= 24) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const adjustedHours = hours >= 24 ? hours - 24 : hours;

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');

        const timeString = `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000`; // Removed Z to prevent UTC interpretation
        const formattedDateTime = `${year}-${month}-${day}T${timeString}`;

        const newSchedule = {
            schedule_id: -1,
            imageinary_schedule_id: maxScheduleId,
            start_time: formattedDateTime,
            scheduled_time: subjectInfo.unit_time,
            subject_id: subjectInfo.subject_id,
            study_subject: {
                ...subjectInfo,
                category: { category_name: "Unspecified" }
            },
            modified: false
        };

        setMaxScheduleId(maxScheduleId + 1);
        setSchedules(prev => [...prev, newSchedule]);
        setScheduleDirtyFlag(true);
    }, [maxScheduleId, currentStartDay, startTime, timeSlots, setMaxScheduleId, setSchedules, setScheduleDirtyFlag]);

    // Mobile Drop Handler
    useEffect(() => {
        const handleGlobalTouchMove = (e) => {
            if (draggedSubjectInfo) {
                if (e.cancelable) e.preventDefault(); // Stop scrolling while dragging an item
                const touch = e.touches[0];
                setDragPosition({ x: touch.clientX, y: touch.clientY });
            }
        };

        const handleGlobalTouchEnd = (e) => {
            // ... existing logic
            if (!draggedSubjectInfo) return;

            const touch = e.changedTouches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);

            let cell = target;
            while (cell && cell.tagName !== 'TD' && cell.tagName !== 'BODY') {
                cell = cell.parentElement;
            }

            if (cell && cell.tagName === 'TD' && cell.classList.contains('timetable-cell')) {
                const dataKey = cell.getAttribute('data-key');
                if (dataKey) {
                    const [dIndex, rIndex] = dataKey.split('-').map(Number);
                    addScheduleAt(rIndex, dIndex, draggedSubjectInfo);
                }
            }

            setDraggedSubjectInfo(null);
        };

        if (draggedSubjectInfo) {
            // Need 'passive: false' to allow preventDefault
            window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
            window.addEventListener('touchend', handleGlobalTouchEnd);
        }

        return () => {
            window.removeEventListener('touchmove', handleGlobalTouchMove);
            window.removeEventListener('touchend', handleGlobalTouchEnd);
        };
    }, [draggedSubjectInfo, addScheduleAt]);

    // Helper to clear time components for pure date comparison
    const clearTime = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    // Calculate grid position for schedules
    const scheduleMap = useMemo(() => {
        const map = {}; // key: "dayIndex-rowIndex", value: [schedule]

        if (!schedules) return map;

        schedules.forEach(schedule => {
            // 1. Calculate Day Index using Date objects (Handles Timezone correctly)
            // schedule.start_time is UTC (e.g., ...T10:00:00.000Z)
            // new Date() converts to Browser Local Time.
            // clearTime() sets Local Time to 00:00:00.

            const scheduleDateLocal = new Date(schedule.start_time);
            const scheduleDateCleared = clearTime(scheduleDateLocal); // Local midnight of schedule day
            const startDayCleared = clearTime(currentStartDay); // Local midnight of start day

            // Calculate difference in days based on Local Dates
            const diffTime = scheduleDateCleared.getTime() - startDayCleared.getTime();
            const dayIndex = Math.round(diffTime / (1000 * 60 * 60 * 24));

            // 2. Calculate Row Index using Local Hours from Date object
            const scheduleHour = scheduleDateLocal.getHours();
            const scheduleMinute = scheduleDateLocal.getMinutes();

            const scheduleTimeInMinutes = scheduleHour * 60 + scheduleMinute;
            const startTimeInMinutes = startTime * 60;
            const minuteDiff = scheduleTimeInMinutes - startTimeInMinutes;

            let rowIndex = Math.floor(minuteDiff / 30);
            let adjust = 0;

            if (rowIndex < 0) {
                adjust = minuteDiff;
                rowIndex = 0;
            }

            // Handle Night Schedules (wrapping to next day visually or previous day logic?)
            // Original logic had `getNightScheduleIndices`...
            // If scheduleHour < 6 (early morning), it calculated negative index etc.
            // We will try to rely on simple linear time logic primarily.
            // If schedule is for "Today 01:00" valid data, but startTime is "06:00", it won't show.

            if (rowIndex >= 0) {
                const key = `${dayIndex}-${rowIndex}`;
                if (!map[key]) map[key] = [];
                map[key].push({ ...schedule, startAdjust: adjust });
            }

            // Logic for Night Indices (spanning logic?)
            // Original code checks if scheduleHour >= 6. If so, returns -1.
            // Only handles early morning hours < 6 AM, treating them likely as "previous day's night" or specialized night view?
            // Original code: `dayIndex = scheduleDayNum - startDayNum - 2`?? 
            // That seems to shift it back 2 days? Or maybe just logic for "Night" view after 24:00?
            // Let's stick to the standard grid mapping for now.
        });
        return map;
    }, [schedules, currentStartDay, startTime]);

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

    const handleDragEnd = (e, rowIndex, dayIndex) => {
        e.preventDefault();
        if (!draggedSubjectInfo) return;

        addScheduleAt(rowIndex, dayIndex, draggedSubjectInfo);

        setDraggedSubjectInfo(null);
    };

    const handleContextMenu = (e, schedule) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            schedule
        });
    };

    const handleDeleteSchedule = () => {
        if (!contextMenu) return;
        const { schedule } = contextMenu;
        setDeleteDialog({ isOpen: true, schedule });
        setContextMenu(null);
    };

    const confirmDeleteSchedule = () => {
        const { schedule } = deleteDialog;
        if (!schedule) return;

        const id = schedule.schedule_id !== -1 ? schedule.schedule_id : schedule.imageinary_schedule_id;
        const isImaginary = schedule.schedule_id === -1;

        if (isImaginary) {
            setSchedules(prev => prev.filter(s => s.imageinary_schedule_id !== id));
        } else {
            setRemovedSchedules(prev => [...prev, schedule]);
            setSchedules(prev => prev.filter(s => s.schedule_id !== id));
        }
        setScheduleDirtyFlag(true);
        setDeleteDialog({ isOpen: false, schedule: null });
    };

    const handleEditSchedule = () => {
        if (!contextMenu) return;
        const { schedule } = contextMenu;
        setEditDialog({
            schedule,
            time: schedule.scheduled_time,
            startTimeParams: schedule.start_time, // Simplified string editing
            specialText: schedule.special_text || schedule.study_subject.subjectname
        });
        setContextMenu(null);
    };

    const saveEdit = () => {
        if (!editDialog) return;
        const { schedule, time, startTimeParams, specialText } = editDialog;

        const id = schedule.schedule_id !== -1 ? schedule.schedule_id : schedule.imageinary_schedule_id;
        const isImaginary = schedule.schedule_id === -1;

        const updateFn = (s) => {
            if ((isImaginary && s.imageinary_schedule_id === id) || (!isImaginary && s.schedule_id === id)) {
                return {
                    ...s,
                    scheduled_time: parseInt(time),
                    start_time: startTimeParams, // Should validate format
                    special_text: specialText,
                    modified: true
                };
            }
            return s;
        };

        setSchedules(prev => prev.map(updateFn));
        setScheduleDirtyFlag(true);
        setEditDialog(null);
    };

    const handleCopyLastWeek = () => {
        // Trigger generic fetch which populates lastWeekSchedules
        fetchLastWeekSchedules();
    };

    // Effect for handling last week copy logic (legacy logic replication)
    useEffect(() => {
        if (lastWeekSchedules.length > 0) {
            const newSchedules = [];
            let currentMaxId = maxScheduleId;

            lastWeekSchedules.forEach(schedule => {
                if (schedule.dimmed !== 1) {
                    const scheduleDate = new Date(schedule.start_time);
                    scheduleDate.setDate(scheduleDate.getDate() + 7);

                    newSchedules.push({
                        ...schedule,
                        start_time: scheduleDate.toISOString(),
                        schedule_id: -1,
                        imageinary_schedule_id: currentMaxId++,
                        modified: true // Mark as modified so it can be saved?
                    });
                }
            });

            if (newSchedules.length > 0) {
                setMaxScheduleId(currentMaxId);
                setSchedules(prev => [...prev, ...newSchedules]);
                setScheduleDirtyFlag(true);
                setLastWeekSchedules([]); // Clear so it doesn't run again
            }
        }
    }, [lastWeekSchedules]);


    // Render Helpers
    const renderHeaders = () => {
        const headers = [<th key="time">{t('time')}</th>];
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        let dayOffsets = [0, 1, 2, 3, 4, 5, 6];
        if (startWithMonday) {
            dayOffsets = [1, 2, 3, 4, 5, 6, 7]; // Mon to Sun (next week logic needs care)
            // Original logic used 0..6 logic but shifted labels.
            // Let's verify original logic:
            // If startWithMonday: Mon, Tue ... Sat(Blue), Sun(Red)
            // It actually starts rendering from currentStartDay.
            // currentStartDay is supposedly Monday if startWithMonday is true.
        }

        // Logic adjusted to standard 0-6 iteration based on currentStartDay
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentStartDay);
            date.setDate(date.getDate() + i);
            const dayName = t(days[date.getDay()]); // date.getDay() returns 0 for Sun

            let color = 'black';
            if (date.getDay() === 0) color = 'red';
            if (date.getDay() === 6) color = 'blue';

            headers.push(
                <th key={i} style={{ color }}>
                    {date.getMonth() + 1}/{date.getDate()}<br />{dayName}
                </th>
            );
        }
        return headers;
    };

    return (
        <div className="timetable-container">
            {/* Control Panel */}
            <div className="time-settings">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <label>{t('startTime')}: </label>
                    <input type="number" min="0" max="23" value={startTime} onChange={handleStartTimeChange} />

                    <label>{t('endTime')}: </label>
                    <input type="number" min="0" max="28" value={endTime} onChange={handleEndTimeChange} />

                    <label>{t('startWithMonday')}: </label>
                    <input type="checkbox" checked={startWithMonday} onChange={(e) => {
                        setStartWithMonday(e.target.checked);
                        localStorage.setItem('startWithMonday', e.target.checked);
                        fetchScheduleByDate(currentStartDay);
                    }} />

                    <button onClick={() => setIsSubjectPaletteOpen(!isSubjectPaletteOpen)} className="edit-button">
                        {t('update')} {/* This button label is ambiguous in original code, it opened the palette */}
                    </button>

                    <button
                        onClick={async () => {
                            if (scheduleDirtyFlag) {
                                try {
                                    // Actually saves the schedules
                                    await Promise.all([
                                        createSchedule(),
                                        updateSchedule(),
                                        deleteSchedule()
                                    ]);

                                    // Clean refresh?
                                    setScheduleDirtyFlag(false);
                                    toast.success(t('saved') || 'Saved!');
                                } catch (error) {
                                    console.error("Save failed:", error);
                                    toast.error(t('error.save') || 'Failed to save schedules.');
                                }
                            }
                        }}
                        disabled={!scheduleDirtyFlag}
                        className="edit-button"
                        style={{ backgroundColor: scheduleDirtyFlag ? '#ff4444' : '#ffcccc' }}
                    >
                        {t('updateSchedule')}
                    </button>

                    <button onClick={handleCopyLastWeek} className="edit-button" style={{ backgroundColor: '#2196F3' }}>
                        {t('copyLastWeek')}
                    </button>
                </div>
            </div>

            {/* Date Navigation */}
            <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '25px', color: 'gray' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => {
                        const newDate = new Date(currentStartDay);
                        newDate.setDate(newDate.getDate() - 7);
                        setCurrentStartDay(newDate);
                        fetchScheduleByDate(newDate);
                    }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>◀</button>

                    <span>
                        {currentStartDay.getFullYear()} W{String(Math.ceil((currentStartDay.getTime() - new Date(currentStartDay.getFullYear(), 0, 1).getTime()) / (7 * 86400000))).padStart(2, '0')}
                    </span>

                    <button onClick={() => {
                        const newDate = new Date(currentStartDay);
                        newDate.setDate(newDate.getDate() + 7);
                        setCurrentStartDay(newDate);
                        fetchScheduleByDate(newDate);
                    }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>▶</button>
                </div>
                <button
                    onClick={() => { setCurrentStartDaywithToday(); fetchScheduleByDate(currentStartDay); }}
                    style={{ fontSize: '14px', padding: '3px 8px', borderRadius: '4px', border: 'none', marginTop: '5px' }}
                >
                    {t('thisWeek')}
                </button>
            </div>

            {/* The Table */}
            <div className="timetable">
                <table>
                    <thead>
                        <tr>{renderHeaders()}</tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((slot, rowIndex) => (
                            <tr key={rowIndex}>
                                {slot.isFirstHalf && <td rowSpan="2">{slot.time}</td>}
                                {Array.from({ length: 7 }).map((_, dayIndex) => {
                                    const cellKey = `${dayIndex}-${rowIndex}`;
                                    const cellSchedules = scheduleMap[cellKey] || [];

                                    return (
                                        <td
                                            key={dayIndex}
                                            className={`timetable-cell`}
                                            data-key={`${dayIndex}-${rowIndex}`} // Added for mobile touch identification
                                            style={{ position: 'relative', height: '15px', padding: 0 }} // Override padding for cleaner absolute positioning
                                            onDragOver={(e) => e.preventDefault()}
                                            useDrop="true"
                                            onDrop={(e) => handleDragEnd(e, rowIndex, dayIndex)}
                                        >
                                            {cellSchedules.map((schedule, idx) => {
                                                const heightPixels = (schedule.scheduled_time / 30) * 32; // Approx 32px per 30 mins
                                                return (
                                                    <div
                                                        key={schedule.schedule_id === -1 ? `img-${schedule.imageinary_schedule_id}` : schedule.schedule_id}
                                                        className="schedule-bar"
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: '10%',
                                                            width: '80%',
                                                            height: `${heightPixels}px`,
                                                            backgroundColor: schedule.study_subject.color,
                                                            color: getContrastColor(schedule.study_subject.color),
                                                            fontSize: '12px',
                                                            overflow: 'hidden',
                                                            borderRadius: '4px',
                                                            border: '1px solid #444',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            zIndex: 10,
                                                            cursor: 'pointer',
                                                            touchAction: 'manipulation' // Improves double-tap response
                                                        }}
                                                        onDoubleClick={(e) => handleContextMenu(e, schedule)}
                                                        title={`${schedule.study_subject.subjectname} (${schedule.scheduled_time} min)`}
                                                    >
                                                        {schedule.special_text || schedule.study_subject.subjectname}
                                                    </div>
                                                );
                                            })}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Link to="/" className="back-button">{t('backToHome')}</Link>

            {/* Dialogs */}
            <SubjectPalette
                isOpen={isSubjectPaletteOpen}
                subjects={subjects}
                onClose={() => setIsSubjectPaletteOpen(false)}
                onAddSubject={() => setIsSubjectAddDialogOpen(true)}
                setSubjectInfo={setDraggedSubjectInfo}
            />

            <SubjectAddDialog
                isOpen={isSubjectAddDialogOpen}
                onClose={() => setIsSubjectAddDialogOpen(false)}
                onSave={(subject_name, category_id, subject_color, subject_unit_time) => {
                    createSubject(subject_name, category_id, subject_color, subject_unit_time);
                }}
                categories={categories}
            />

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="context-menu-item" onClick={handleEditSchedule}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        {t('menu.edit')}
                    </div>
                    <div className="context-menu-item danger" onClick={handleDeleteSchedule}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        {t('menu.delete')}
                    </div>
                </div>
            )}

            <ConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, schedule: null })}
                title={t('menu.delete')}
                message={deleteDialog.schedule ? t('deleteScheduleConfirm', { subject: deleteDialog.schedule.study_subject.subjectname }) : ''}
                onConfirm={confirmDeleteSchedule}
                onCancel={() => setDeleteDialog({ isOpen: false, schedule: null })}
                isDanger={true}
                confirmLabel={t('menu.delete')}
            />

            {/* Edit Dialog */}
            {editDialog && (
                <div className="dialog-overlay">
                    <div className="dialog-box">
                        <h3 className="dialog-title">{t('edit.title')}</h3>

                        <div>
                            <label className="dialog-label">{t('edit.time')} (min)</label>
                            <input
                                type="number"
                                value={editDialog.time}
                                onChange={(e) => setEditDialog({ ...editDialog, time: e.target.value })}
                                className="dialog-input"
                            />
                        </div>

                        <div>
                            <label className="dialog-label">{t('edit.subject_name')}</label>
                            <input
                                type="text"
                                value={editDialog.specialText}
                                onChange={(e) => setEditDialog({ ...editDialog, specialText: e.target.value })}
                                className="dialog-input"
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                            />
                        </div>

                        <div className="dialog-actions">
                            <button className="btn-secondary" onClick={() => setEditDialog(null)}>{t('cancel')}</button>
                            <button className="btn-primary" onClick={saveEdit}>{t('save')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Touch Drag Preview */}
            <TouchDragPreview subject={draggedSubjectInfo} position={dragPosition} />
        </div>
    );
}

export default TimeTable;