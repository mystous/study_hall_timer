import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimeTable } from './contexts/TimeTableContext';
import './css/Daily.css';

const Daily = () => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const {fetchOneDaySchedule } = useTimeTable();
    const [dailySchedules, setDailySchedules] = useState([]);

    useEffect(() => {
            //const result = fetchOneDaySchedule(currentDate);
            //setDailySchedules(result || []);
            //console.log(result);
    }, [currentDate]);

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        setCurrentDate(newDate);
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
                    onChange={(e) => setCurrentDate(new Date(e.target.value))}
                    style={{
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <button
                    onClick={() => setCurrentDate(new Date())}
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
                {dailySchedules.length === 0 ? (
                    <p className="no-schedules">{t('daily.noSchedules')}</p>
                ) : (
                    dailySchedules.map((schedule) => (
                        <div key={schedule.id} className="schedule-item">
                            <div className="schedule-time">
                                {schedule.start_time} - {schedule.end_time}
                            </div>
                            <div className="schedule-content">
                                <h3>{schedule.title}</h3>
                                <p>{schedule.description}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Daily;
