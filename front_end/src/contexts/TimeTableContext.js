import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../common/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const TimeTableContext = createContext();

export const TimeTableProvider = ({ children }) => {
  const { t } = useTranslation();
  const [timeTableData, setTimeTableData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [oneDaySchedules, setOneDaySchedules] = useState([]);
  const [lastWeekSchedules, setLastWeekSchedules] = useState([]);
  const [removedSchedules, setRemovedSchedules] = useState([]);
  const [modifiedSchedules, setModifiedSchedules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [maxScheduleId, setMaxScheduleId] = useState(100000);
  const [imageinaryScheduleIds, setImageinaryScheduleIds] = useState(100000);
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

  useEffect(() => {
    // console.log('startWithMonday is updated');
    const tuesday = new Date(currentStartDay);
    tuesday.setDate(tuesday.getDate() + 1); // Monday에서 하루 더함
    setCurrentStartDay(startWithMonday ? getMondayDate(tuesday) : getSundayDate(tuesday));
  }, [startWithMonday]);

  useEffect(() => {
    // console.log('removedSchedules is ', removedSchedules);
  }, [removedSchedules]);

  const [currentStartDay, setCurrentStartDay] = useState(startWithMonday ? getMondayDate(new Date()) : getSundayDate(new Date()));

  useEffect(() => {
    // console.log('useEffect : currentStartDay is ', currentStartDay);
  }, [currentStartDay]);

  const setCurrentStartDaywithToday = () => {
    setCurrentStartDay(startWithMonday ? getMondayDate(new Date()) : getSundayDate(new Date()));
    // console.log('currentStartDay is setted', currentStartDay);
  }

  const getCurrentStartDay = () => {
    return currentStartDay;
  }
  const fetchSubjects = async (targetUserId) => {
    try {
      if (!user) {
        // If no user, but userId param exists, allow fetching for observer mode
        const userIdParam = targetUserId || new URLSearchParams(window.location.search).get('userId');
        if (!userIdParam) {
          return;
        }
      }
      const userIdParam = targetUserId || new URLSearchParams(window.location.search).get('userId');
      const query = userIdParam ? `?userId=${userIdParam}` : '';
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/subjects${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const result = data.subjects;
        setSubjects(result);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // 에러 시 기본 과목 사용
      setSubjects(['Math', 'Science', 'English', 'History']);
    }
  };

  const fetchCategories = async (targetUserId) => {
    try {
      const userIdParam = targetUserId || new URLSearchParams(window.location.search).get('userId');
      const query = userIdParam ? `?userId=${userIdParam}` : '';
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/categories${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const result = data.categories;
        setCategories(result);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const fetchOneDaySchedule = async (date, targetUserId) => {
    try {
      if (!user) {
        return;
      }
      const startDate = date;
      //startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const userIdParam = targetUserId || new URLSearchParams(window.location.search).get('userId');
      const query = userIdParam ? `&userId=${userIdParam}` : '';

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/time_table?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const result = data.schedules;
        setOneDaySchedules(result);
      } else {
        setOneDaySchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchScheduleByDate = async (date, targetUserId) => {
    try {
      if (!user) {
        return;
      }
      const startDate = date;
      //startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 8);

      const userIdParam = targetUserId || new URLSearchParams(window.location.search).get('userId');
      const query = userIdParam ? `&userId=${userIdParam}` : '';

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/time_table?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const data = await response.json();
      console.log('fetchScheduleByDate response:', data);
      if (data.success) {
        const result = data.schedules;
        console.log('fetchScheduleByDate schedules:', result);
        setSchedules(result);
        // Find max schedule_id and set max_schedule_id
        const maxId = Math.max(...result.map(schedule => schedule.schedule_id), 0);
        setMaxScheduleId(maxId * 10 + 1);
        setImageinaryScheduleIds(maxId * 10 + 1);
        setRemovedSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const createSchedule = async () => {
    try {

      // Filter schedules that don't have schedule_id and create request body
      const newSchedules = schedules.filter(schedule => schedule.schedule_id === -1).map(schedule => ({
        subject_id: schedule.subject_id,
        scheduled_time: schedule.scheduled_time,
        start_time: schedule.start_time,
        dimmed: false,
        special_text: schedule.special_text
      }));

      if (newSchedules.length === 0) {
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/time_table`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          username: user.username,
          schedules: newSchedules
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create schedules');
      }
    } catch (error) {
      console.error('Error adding time table schedule:', error);
      throw error;
    }
  }

  const updateSchedule = async () => {
    const modifiedSchedules = schedules.filter(schedule => schedule.modified === true && schedule.schedule_id !== -1).map(schedule => ({
      schedule_id: schedule.schedule_id,
      subject_id: schedule.subject_id,
      scheduled_time: schedule.scheduled_time,
      start_time: schedule.start_time,
      dimmed: schedule.dimmed,
      special_text: schedule.special_text
    }));

    if (modifiedSchedules.length === 0) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/time_table`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          username: user.username,
          schedules: modifiedSchedules
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update schedules');
      }
    } catch (error) {
      console.error('Error updating time table schedule:', error);
      throw error;
    }
  }

  const deleteSchedule = async () => {

    const schedulesToDelete = removedSchedules.map(schedule => ({ schedule_id: schedule.schedule_id }));
    if (schedulesToDelete.length === 0) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/time_table`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          username: user.username, schedules: schedulesToDelete
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedules');
      }
    } catch (error) {
      console.error('Error deleting time table schedule:', error);
      throw error;
    }
  }

  const createSubject = async (subject_name, category_id, subject_color, subject_unit_time) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          username: user.username, subject_name: subject_name, category_id: category_id, subject_color: subject_color, subject_unit_time: subject_unit_time
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchSubjects();
        toast.success(t('subjectCreated') || 'Subject created successfully'); // Visual confirmation
      } else {
        toast.error('Failed to create subject: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      toast.error('Error creating subject: ' + error.message);
    }
  }

  const fetchSchedule = async () => {
    try {
      fetchScheduleByDate(currentStartDay);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const initializeData = async () => {
    fetchSubjects();
    fetchSchedule();
    fetchCategories();
    setUpdateTimes(updateTimes + 1);
    // console.log('updateTimes is ', updateTimes);
  };

  const finalizeData = async () => {
    // 실제 초기화 로직 구현
    // Remove any existing subject selection dialog
    const existingDialog = document.querySelector('.subject-selection-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }
  };

  const fetchLastWeekSchedules = async (targetUserId) => {
    try {
      if (!user) {
        return;
      }
      const startDate = new Date(currentStartDay);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(6, 0, 0, 0);
      const endDate = new Date(currentStartDay);
      endDate.setDate(endDate.getDate());
      endDate.setHours(23, 59, 59, 999);
      console.log('startDate is ', startDate);
      console.log('endDate is ', endDate);

      const userIdParam = targetUserId || new URLSearchParams(window.location.search).get('userId');
      const query = userIdParam ? `&userId=${userIdParam}` : '';

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/time_table?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const result = data.schedules;
        setLastWeekSchedules(result);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  }

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
    modifiedSchedules,
    setModifiedSchedules,
    categories,
    fetchCategories,
    fetchSubjects,
    createSubject,
    setSubjects,
    updateSchedule,
    lastWeekSchedules,
    setLastWeekSchedules,
    fetchLastWeekSchedules,
    fetchOneDaySchedule,
    oneDaySchedules,
    setOneDaySchedules
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