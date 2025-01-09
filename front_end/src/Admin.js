import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './css/Admin.css';
import { toast } from 'react-toastify';
import { useAuth } from './common/AuthContext';

function Admin() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const { user } = useAuth();
    useEffect(() => {
        // Fetch users and groups on component mount
        fetchUsers();
        fetchGroups();
    }, []);

    useEffect(() => {
        // Fetch group members when a group is selected
        if (selectedGroup) {
            fetchGroupMembers(selectedGroup);
        }
    }, [selectedGroup]);

    const fetchUsers = async () => {
        try {
        
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: user
                })
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/admin/groups`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: user
                })
            });
            const data = await response.json();
            if (data.success) {
                setGroups(data.groups);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchGroupMembers = async (groupId) => {
        try {
            alert(groupId);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/admin/groups/${groupId}/members`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: user
                })
            });
            const data = await response.json();
            alert(data.members);
            if (data.success) {
                setGroupMembers(data.members);
            }
        } catch (error) {
            console.error('Error fetching group members:', error);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-section">
                <h2>Users ({users.length})</h2>
                <div className="user-list">
                    {users.map(user => (
                        <div key={user.id} className="user-item">
                            <span>{user.username}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="admin-section">
                <h2>Groups ({groups.length})</h2>
                <div className="group-list">
                    {groups.map(group => (
                        <div 
                            key={group.id} 
                            className={`group-item ${selectedGroup === group.id ? 'selected' : ''}`}
                            onClick={() => setSelectedGroup(group.id)}
                        >
                            <span>{group.group_name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {selectedGroup && (
                <div className="admin-section">
                    <h2>Group Members ({groupMembers.length})</h2>
                    <div className="member-list">
                        {groupMembers.map(member => (
                            <div key={member.id} className="member-item">
                                <span>{member.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;
