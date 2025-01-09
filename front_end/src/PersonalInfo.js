import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './css/PersonalInfo.css';
import { useAuth } from './common/AuthContext';
import { getGroups } from './common/utils';


function PersonalInfo() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState({
    username: user.username
  });
  const [message, setMessage] = useState('');

  return (
    <div className="personal-info-container">
      <h2>{t('personalInfo.title', 'Personal Information')}</h2>
      
      {message && <div className="message">{message}</div>}


        <div className="form-group">
          <label htmlFor="id">{t('personalInfo.id', 'ID')}: {userInfo.username}</label>
        </div>

        <div className="form-group">
          <label htmlFor="join_group">{t('personalInfo.join_group', 'Join Group')}:</label>
          <div className="group-list">
            
            {getGroups().map((group, index) => (
              <div key={index} className="group-item">
                {group.group_name}
              </div>
            ))}
          </div>
        </div>
 
    
    </div>
  );
}

export default PersonalInfo;
