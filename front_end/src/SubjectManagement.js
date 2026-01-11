import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './css/SubjectManagement.css';
import { useAuth } from './common/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

const SubjectManagement = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Form states
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#' + Math.floor(Math.random() * 16777215).toString(16));

    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectColor, setNewSubjectColor] = useState('#' + Math.floor(Math.random() * 16777215).toString(16));
    const [newSubjectUnitTime, setNewSubjectUnitTime] = useState(30);
    const [newSubjectCategoryId, setNewSubjectCategoryId] = useState('');

    const [isEditingSubject, setIsEditingSubject] = useState(null);
    const [isEditingCategory, setIsEditingCategory] = useState(null);

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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            await Promise.all([fetchCategories(), fetchSubjects()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/categories`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories);
                if (data.categories.length > 0 && !newSubjectCategoryId) {
                    setNewSubjectCategoryId(data.categories[0].category_id);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/subjects`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await response.json();
            if (data.success) {
                setSubjects(data.subjects);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleSaveCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error(t('fillAllFields'));
            return;
        }

        const url = isEditingCategory
            ? `${process.env.REACT_APP_BACKEND_URL}/api/v1/categories/${isEditingCategory}`
            : `${process.env.REACT_APP_BACKEND_URL}/api/v1/categories`;

        const method = isEditingCategory ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category_name: newCategoryName,
                    color: newCategoryColor
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(t('saved'));
                resetCategoryForm();
                fetchCategories();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error saving category');
        }
    };

    const handleDeleteCategoryClick = (id, name) => {
        setConfirmDialog({
            isOpen: true,
            title: t('Confirm Deletion'),
            message: t('deleteCategoryConfirm', { category: name }),
            onConfirm: () => handleDeleteCategory(id)
        });
    };

    const handleDeleteCategory = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await response.json();
            if (data.success) {
                toast.success(t('deleted'));
                fetchCategories();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error deleting category');
        } finally {
            closeConfirmDialog();
        }
    };

    const handleSaveSubject = async () => {
        if (!newSubjectName.trim() || !newSubjectCategoryId) {
            toast.error(t('fillAllFields'));
            return;
        }

        const url = isEditingSubject
            ? `${process.env.REACT_APP_BACKEND_URL}/api/v1/subjects/${isEditingSubject}`
            : `${process.env.REACT_APP_BACKEND_URL}/api/v1/subjects`;

        const method = isEditingSubject ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject_name: newSubjectName,
                    category_id: newSubjectCategoryId,
                    subject_color: newSubjectColor,
                    subject_unit_time: newSubjectUnitTime
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(t('saved'));
                resetSubjectForm();
                fetchSubjects();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error saving subject');
        }
    };

    const handleDeleteSubjectClick = (id, name) => {
        setConfirmDialog({
            isOpen: true,
            title: t('Confirm Deletion'),
            message: t('deleteScheduleConfirm', { subject: name }),
            onConfirm: () => handleDeleteSubject(id)
        });
    };

    const handleDeleteSubject = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/v1/subjects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await response.json();
            if (data.success) {
                toast.success(t('deleted'));
                fetchSubjects();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error deleting subject');
        } finally {
            closeConfirmDialog();
        }
    };

    const startEditSubject = (subject) => {
        setIsEditingSubject(subject.subject_id);
        setNewSubjectName(subject.subjectname);
        setNewSubjectColor(subject.color);
        setNewSubjectUnitTime(subject.unit_time);
        setNewSubjectCategoryId(subject.category_id);
    };

    const resetSubjectForm = () => {
        setIsEditingSubject(null);
        setNewSubjectName('');
        setNewSubjectColor('#' + Math.floor(Math.random() * 16777215).toString(16));
        setNewSubjectUnitTime(30);
        if (categories.length > 0) {
            setNewSubjectCategoryId(categories[0].category_id);
        }
    };

    const startEditCategory = (category) => {
        setIsEditingCategory(category.category_id);
        setNewCategoryName(category.category_name);
        setNewCategoryColor(category.color);
    };

    const resetCategoryForm = () => {
        setIsEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryColor('#' + Math.floor(Math.random() * 16777215).toString(16));
    };

    return (
        <div className="subject-management-container">
            {/* Category Management */}
            <section className="management-section">
                <div className="management-header">
                    <h2>{t('manageCategories')}</h2>
                </div>

                <div className="add-form">
                    <div className="form-group">
                        <label>{t('categoryName')}</label>
                        <input
                            type="text"
                            className="management-input"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder={t('categoryName')}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('color')}</label>
                        <input
                            type="color"
                            className="color-input"
                            value={newCategoryColor}
                            onChange={(e) => setNewCategoryColor(e.target.value)}
                            style={{ backgroundColor: newCategoryColor }}
                        />
                    </div>
                    <div className="form-group">
                        <label>&nbsp;</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="management-btn" onClick={handleSaveCategory}>
                                {isEditingCategory ? t('edit.title') : t('addCategory')}
                            </button>
                            {isEditingCategory && (
                                <button
                                    className="management-btn"
                                    style={{ backgroundColor: '#666' }}
                                    onClick={resetCategoryForm}
                                >
                                    {t('cancel')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="list-container">
                    {categories.map(category => (
                        <div key={category.category_id} className="list-item">
                            <div className="color-indicator" style={{ backgroundColor: category.color }}></div>
                            <div className="item-info">
                                <span className="item-title">{category.category_name}</span>
                            </div>
                            <button
                                className="management-btn edit-btn"
                                onClick={() => startEditCategory(category)}
                                style={{ marginLeft: 'auto' }}
                            >
                                {t('menu.edit')}
                            </button>
                            <button
                                className="management-btn delete-btn"
                                style={{ marginLeft: '5px' }}
                                onClick={() => handleDeleteCategoryClick(category.category_id, category.category_name)}
                            >
                                {t('menu.delete')}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Subject Management */}
            <section className="management-section">
                <div className="management-header">
                    <h2>{t('manageSubjects')}</h2>
                </div>

                <div className="add-form">
                    <div className="form-group">
                        <label>{t('subjectName')}</label>
                        <input
                            type="text"
                            className="management-input"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder={t('subjectName')}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('categories')}</label>
                        <select
                            className="management-input"
                            value={newSubjectCategoryId}
                            onChange={(e) => {
                                const newId = e.target.value;
                                setNewSubjectCategoryId(newId);
                                const category = categories.find(c => c.category_id.toString() === newId.toString());
                                if (category) {
                                    setNewSubjectColor(category.color);
                                }
                            }}
                        >
                            {categories.map(c => (
                                <option key={c.category_id} value={c.category_id}>
                                    {c.category_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>{t('unitTime')} ({t('minutes')})</label>
                        <input
                            type="number"
                            className="management-input"
                            style={{ width: '80px' }}
                            value={newSubjectUnitTime}
                            onChange={(e) => setNewSubjectUnitTime(e.target.value)}
                            min="1"
                        />
                    </div>
                    <div className="form-group color-group">
                        <label>{t('color')}</label>
                        <input
                            type="color"
                            className="color-input"
                            value={newSubjectColor}
                            onChange={(e) => setNewSubjectColor(e.target.value)}
                            style={{ backgroundColor: newSubjectColor }}
                        />
                    </div>
                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label>&nbsp;</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="management-btn" onClick={handleSaveSubject}>
                                    {isEditingSubject ? t('edit.title') : t('subject.add')}
                                </button>
                                {isEditingSubject && (
                                    <button
                                        className="management-btn"
                                        style={{ backgroundColor: '#666' }}
                                        onClick={resetSubjectForm}
                                    >
                                        {t('cancel')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="list-container">
                    {subjects.map(subject => (
                        <div key={subject.subject_id} className="list-item">
                            <div className="color-indicator" style={{ backgroundColor: subject.color }}></div>
                            <div className="item-info">
                                <span className="item-title">{subject.subjectname}</span>
                                <span className="item-details">
                                    {subject.category?.category_name} | {subject.unit_time}{t('minutes')}
                                </span>
                            </div>
                            <button
                                className="management-btn edit-btn"
                                onClick={() => startEditSubject(subject)}
                            >
                                {t('menu.edit')}
                            </button>
                            <button
                                className="management-btn delete-btn"
                                style={{ marginLeft: '5px' }}
                                onClick={() => handleDeleteSubjectClick(subject.subject_id, subject.subjectname)}
                            >
                                {t('menu.delete')}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={closeConfirmDialog}
                confirmLabel={t('delete')}
                isDanger={true}
            />
        </div>
    );
};

export default SubjectManagement;
