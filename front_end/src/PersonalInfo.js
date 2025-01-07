import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './css/PersonalInfo.css';

function PersonalInfo() {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    studentId: '',
    department: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('http://studyhalltimer.com:9090/api/v1/user/info', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      setMessage('Failed to load user information');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://studyhalltimer.com:9090/api/v1/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userInfo)
      });

      if (response.ok) {
        setMessage('Successfully updated user information');
        setIsEditing(false);
      } else {
        setMessage('Failed to update user information');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      setMessage('Error occurred while updating information');
    }
  };

  return (
    <div className="personal-info-container">
      <h2>{t('personalInfo.title', 'Personal Information')}</h2>
      
      {message && <div className="message">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">{t('personalInfo.name', 'Name')}:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={userInfo.name}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">{t('personalInfo.email', 'Email')}:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userInfo.email}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        <div className="form-group">
          <label htmlFor="studentId">{t('personalInfo.studentId', 'Student ID')}:</label>
          <input
            type="text"
            id="studentId"
            name="studentId"
            value={userInfo.studentId}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        <div className="form-group">
          <label htmlFor="department">{t('personalInfo.department', 'Department')}:</label>
          <input
            type="text"
            id="department"
            name="department"
            value={userInfo.department}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>

        <div className="button-group">
          {!isEditing ? (
            <button type="button" onClick={() => setIsEditing(true)}>
              {t('personalInfo.edit', 'Edit')}
            </button>
          ) : (
            <>
              <button type="submit">
                {t('personalInfo.save', 'Save')}
              </button>
              <button type="button" onClick={() => {
                setIsEditing(false);
                fetchUserInfo();
              }}>
                {t('personalInfo.cancel', 'Cancel')}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default PersonalInfo;
