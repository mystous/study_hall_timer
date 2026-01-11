import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './css/ObserverManagement.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './common/AuthContext';
import { toast } from 'react-toastify';
import ConfirmationDialog from './ConfirmationDialog';

const ObserverManagement = () => {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('students');

    // Guardian Data (Tab 1)
    const [myStudents, setMyStudents] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [searchUsername, setSearchUsername] = useState('');

    // Student Data (Tab 2)
    const [myObservers, setMyObservers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const closeConfirmDialog = () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    };

    const fetchMyStudents = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/observer/students`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await res.json();
            if (data.success) setMyStudents(data.students);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchSentRequests = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/observer/sent`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await res.json();
            if (data.success) setSentRequests(data.requests || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMyObservers = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/observer/observers`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await res.json();
            if (data.success) setMyObservers(data.observers);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            // In backend, getPendingRequests returns { requests: [...] }
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/observer/pending`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await res.json();
            if (data.success) setPendingRequests(data.requests);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            if (activeTab === 'students') {
                fetchMyStudents();
                fetchSentRequests();
            } else {
                fetchMyObservers();
                fetchPendingRequests();
            }
        }
    }, [isAuthenticated, activeTab]);

    const handleRequestObservation = async () => {
        if (!searchUsername) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/observer/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ studentUsername: searchUsername })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(t('Request sent'));
                setSearchUsername('');
                fetchSentRequests();
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleRespond = async (relationId, action, username) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/observer/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ relationId, action })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(action === 'accept'
                    ? t('Request accepted', { name: username })
                    : t('Request rejected', { name: username }));
                fetchPendingRequests();
                fetchMyObservers();
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleRemoveClick = (relationId, username) => {
        setConfirmDialog({
            isOpen: true,
            title: t('Confirm Removal'),
            message: t('Are you sure?'),
            onConfirm: () => handleRemove(relationId, username)
        });
    };

    const handleRemove = async (relationId, username) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/observer/remove`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ relationId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(t('Relation removed', { name: username }));
                if (activeTab === 'students') {
                    fetchMyStudents();
                    fetchSentRequests();
                } else {
                    fetchMyObservers();
                }
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error(e.message);
        } finally {
            closeConfirmDialog();
        }
    };

    return (
        <div className="observer-management-container">
            <h2>{t('Observer Management')}</h2>

            <div className="observer-tabs">
                <button
                    className={`observer-tab ${activeTab === 'students' ? 'active' : ''}`}
                    onClick={() => setActiveTab('students')}
                >
                    {t('My Students (I am Guardian)')}
                </button>
                <button
                    className={`observer-tab ${activeTab === 'observers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('observers')}
                >
                    {t('My Observers (I am Student)')}
                </button>
            </div>

            {activeTab === 'students' && (
                <>
                    <div className="observer-section">
                        <h3>{t('Add Student')}</h3>
                        <div className="observer-input-group">
                            <input
                                type="text"
                                className="observer-input"
                                placeholder={t('Enter student username')}
                                value={searchUsername}
                                onChange={(e) => setSearchUsername(e.target.value)}
                            />
                            <button className="observer-btn" onClick={handleRequestObservation}>
                                {t('Send Request')}
                            </button>
                        </div>
                    </div>

                    <div className="observer-section">
                        <h3>{t('My Students')}</h3>
                        {myStudents.length === 0 ? <p>{t('No students found.')}</p> : (
                            <ul className="observer-list">
                                {myStudents.map(student => (
                                    <li key={student.relation_id} className="observer-item">
                                        <span className="observer-item-name">{student.username}</span>
                                        <div className="observer-actions">
                                            <button className="observer-btn" onClick={() => navigate(`/timetable?userId=${student.user_id}`)}>
                                                {t('View TimeTable')}
                                            </button>
                                            <button className="observer-btn" onClick={() => navigate(`/statistics?userId=${student.user_id}`)}>
                                                {t('View Statistics')}
                                            </button>
                                            <button className="observer-btn remove" onClick={() => handleRemoveClick(student.relation_id, student.username)}>
                                                {t('Remove')}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="observer-section">
                        <h3>{t('Sent Requests')}</h3>
                        {sentRequests.length === 0 ? <p>{t('No sent requests.')}</p> : (
                            <ul className="observer-list">
                                {sentRequests.map(req => (
                                    <li key={req.relation_id} className="observer-item">
                                        <span className="observer-item-name">{req.Student ? req.Student.username : 'Unknown'}</span>
                                        <span className="observer-item-status">{req.status}</span>
                                        <div className="observer-actions">
                                            <button className="observer-btn remove" onClick={() => handleRemoveClick(req.relation_id, req.Student ? req.Student.username : 'Unknown')}>
                                                {t('Cancel')}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'observers' && (
                <>
                    <div className="observer-section">
                        <h3>{t('Pending Requests')}</h3>
                        {pendingRequests.length === 0 ? <p>{t('No pending requests.')}</p> : (
                            <ul className="observer-list">
                                {pendingRequests.map(req => (
                                    <li key={req.relation_id} className="observer-item">
                                        <span className="observer-item-name">{req.Guardian ? req.Guardian.username : 'Unknown'}</span>
                                        <div className="observer-actions">
                                            <button className="observer-btn accept" onClick={() => handleRespond(req.relation_id, 'accept', req.Guardian ? req.Guardian.username : 'Unknown')}>
                                                {t('Accept')}
                                            </button>
                                            <button className="observer-btn remove" onClick={() => handleRespond(req.relation_id, 'reject', req.Guardian ? req.Guardian.username : 'Unknown')}>
                                                {t('Reject')}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="observer-section">
                        <h3>{t('My Observers')}</h3>
                        {myObservers.length === 0 ? <p>{t('No observers found.')}</p> : (
                            <ul className="observer-list">
                                {myObservers.map(obs => (
                                    <li key={obs.relation_id} className="observer-item">
                                        <span className="observer-item-name">{obs.username}</span>
                                        <div className="observer-actions">
                                            <button className="observer-btn remove" onClick={() => handleRemoveClick(obs.relation_id, obs.username)}>
                                                {t('Remove')}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={closeConfirmDialog}
                confirmLabel={t('remove')}
                isDanger={true}
            />
        </div>
    );
};

export default ObserverManagement;
