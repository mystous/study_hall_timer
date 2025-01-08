import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './css/PersonalInfo.css';
import { useAuth } from './common/AuthContext';

function PersonalInfo() {
  const { t } = useTranslation();
  const { user, groups } = useAuth();
  const [userInfo, setUserInfo] = useState({
    username: user.username,
    groups: groups
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
          <label htmlFor="id">{t('personalInfo.id', 'ID')}: {userInfo.username}</label>
        </div>

        <div className="form-group">
          <label htmlFor="join_group">{t('personalInfo.join_group', 'Join Group')}:</label>
          <input
            type="text"
            id="join_group"
            name="join_group"
            value={userInfo.groups}
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
