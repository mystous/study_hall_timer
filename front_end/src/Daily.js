import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimeTable } from './contexts/TimeTableContext';
import './css/Daily.css';

const Daily = () => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const { fetchOneDaySchedule, oneDaySchedules } = useTimeTable();
    const [dailySchedules, setDailySchedules] = useState([]);
    const hasRun = useRef(false);

    useEffect(() => {
        // Initial fetch
        fetchOneDaySchedule(currentDate);
    }, [currentDate]);

    useEffect(() => {
        if (!hasRun.current) return;
        console.log('hasRun', hasRun.current);
        console.log('schedules', oneDaySchedules);
    }, [oneDaySchedules]);

    const handleChangeDay = (newDate) => {
        setCurrentDate(newDate);
    };

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        handleChangeDay(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        handleChangeDay(newDate);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    return (
        <div className="daily-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', justifyContent: 'center' }}>
                <input
                    type="date"
                    value={currentDate.toISOString().split('T')[0]}
                    onChange={(e) => handleChangeDay(new Date(e.target.value))}
                    style={{
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <button
                    onClick={() => handleChangeDay(new Date())}
                    style={{
                        marginLeft: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#EEEEEE',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    {t('today')}
                </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', justifyContent: 'center' }}>
                <button
                    onClick={handlePrevDay}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}
                >◀</button>
                <h2>{formatDate(currentDate)}</h2>
                <button
                    onClick={handleNextDay}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}
                >
                    ▶
                </button>
            </div>

            <div className="daily-schedule-list">
                {oneDaySchedules.length === 0 ? (
                    <p className="no-schedules">{t('daily.noSchedules')}</p>
                ) : (
                    oneDaySchedules.map((schedule) => {
                        const startDate = new Date(schedule.start_time);
                        const startHour = String(startDate.getHours()).padStart(2, '0');
                        const startMinute = String(startDate.getMinutes()).padStart(2, '0');

                        const endDate = new Date(startDate.getTime() + schedule.scheduled_time * 60000);
                        const endHour = String(endDate.getHours()).padStart(2, '0');
                        const endMinute = String(endDate.getMinutes()).padStart(2, '0');

                        return (
                            <div key={schedule.schedule_id} className="schedule-item" style={{ borderLeft: `5px solid ${schedule.study_subject.color}` }}>
                                <div className="schedule-time">
                                    {startHour}:{startMinute} - {endHour}:{endMinute} ({schedule.scheduled_time} min)
                                </div>
                                <div className="schedule-content">
                                    <h3>{schedule.study_subject.subjectname}</h3>
                                    <p>{schedule.special_text}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Daily;
