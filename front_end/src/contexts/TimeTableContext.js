import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../common/AuthContext';

const TimeTableContext = createContext();

export const TimeTableProvider = ({ children }) => {
  const [timeTableData, setTimeTableData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [startWithMonday, setStartWithMonday] = useState(() => {
    const savedStartWithMonday = localStorage.getItem('startWithMonday');
    return savedStartWithMonday ? savedStartWithMonday === 'true' : false;
  });
  const [updateTimes, setUpdateTimes] = useState(0);
  const { user } = useAuth();

  const getMondayDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    
    // If already Monday (day === 1), return date directly
    if (day === 1) {
      d.setHours(0, 0, 0, 0);
      return d;
    }

    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 일요일인 경우 이전 주 월요일로
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    return monday;
  };

  const getSundayDate = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    
    // If already Sunday (day === 0), return date directly
    if (day === 0) {
      d.setHours(0, 0, 0, 0);
      return d;
    }

    const diff = d.getDate() - day; // 현재 날짜에서 요일만큼 빼면 이번주 일요일
    const sunday = new Date(d.setDate(diff));
    sunday.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    return sunday;
  };



  const [currentStartDay, setCurrentStartDay] = useState(startWithMonday ? getMondayDate(new Date()) : getSundayDate(new Date()));

  const setCurrentStartDaywithToday = () => {
    setCurrentStartDay(startWithMonday ? getMondayDate(new Date()) : getSundayDate(new Date()));
    console.log('currentStartDay is setted', currentStartDay);
  }

  const getCurrentStartDay = () => {
    return currentStartDay;
  }
  const fetchSubjects = async () => {
    try {
      if (!user) {
        return;
      }
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


  const fetchSchedule = async () => {
    try {
      if (!user) {
        return;
      }
      console.log(user);
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
        console.log('result is ', result);
        console.log('startDate is ', startDate, 'endDate is ', endDate);
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
    setCurrentStartDaywithToday,
    fetchSchedule
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