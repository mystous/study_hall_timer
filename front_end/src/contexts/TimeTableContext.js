import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../common/AuthContext';

const TimeTableContext = createContext();

export const TimeTableProvider = ({ children }) => {
  const [timeTableData, setTimeTableData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [startWithMonday, setStartWithMonday] = useState(false);
  const [updateTimes, setUpdateTimes] = useState(0);
  const { user } = useAuth();

  const getMondayDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const getSundayDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const [currentStartDay, setCurrentStartDay] = useState(getMondayDate(new Date()));

  const getCurrentStartDay = () => {
    return currentStartDay;
  }
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

  const setCurrentStartDaywithToday = () => {
    setCurrentStartDay(startWithMonday ? getMondayDate(new Date()) : getSundayDate(new Date()));
  }

  useEffect(() => {
    setCurrentStartDaywithToday();
    fetchSchedule();
  }, [startWithMonday]);

  const fetchSchedule = async () => {
    try {
      const startDate = currentStartDay;
      const endDate = new Date(currentStartDay);
      endDate.setDate(endDate.getDate() + 6);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/time_table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          username: user.username
        })
      });

      const data = await response.json();
      if (data.success) {
        const result = data.schedules;
        setSchedules(result);
        // schedules.forEach(schedule => {
        //  console.log('Schedule:', schedule);
        // });
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };


  const initializeData = async () => {
        fetchSubjects();
        fetchSchedule();
        setUpdateTimes(updateTimes + 1);
        console.log('updateTimes is ', updateTimes);
  };

  const finalizeData = async () => {
    // 실제 초기화 로직 구현
    // Remove any existing subject selection dialog
    const existingDialog = document.querySelector('.subject-selection-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }
  };

  const value = {
    timeTableData,
    setTimeTableData,
    initializeData,
    finalizeData,
    getMondayDate,
    getCurrentStartDay,
    subjects,
    schedules,
    startWithMonday,
    updateTimes,
    setStartWithMonday,
    currentStartDay,
    setCurrentStartDay,
    setCurrentStartDaywithToday
  }

  return (
    <TimeTableContext.Provider value={value}>
      {children}
    </TimeTableContext.Provider>
  );
};

export const useTimeTable = () => {
  const context = useContext(TimeTableContext);
  if (!context) {
    throw new Error('useTimeTable must be used within a TimeTableProvider');
  }
  return context;
}; 