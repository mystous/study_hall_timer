import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './css/Dialogs.css';
import { toast } from 'react-toastify';

const SubjectAddDialog = ({ isOpen, onClose, onSave, categories }) => {
    const { t } = useTranslation();
    const [subjectName, setSubjectName] = useState('');
    const [unitTime, setUnitTime] = useState(30);
    const [color, setColor] = useState('#' + Math.floor(Math.random() * 16777215).toString(16));
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    if (!isOpen) return null;

    const handleSave = () => {
        if (subjectName.trim() && selectedCategoryId) {
            onSave(subjectName.trim(), selectedCategoryId, color, unitTime);
            onClose();
        } else {
            toast.warn(t('fillAllFields'));
        }
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog-box">
                <h3 className="dialog-title">{t('addSubject')}</h3>

                <div>
                    <span className="dialog-label">{t('categories')}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px', marginBottom: '15px' }}>
                        {categories.map(category => (
                            <div
                                key={category.category_id}
                                className={`category-chip ${selectedCategoryId === category.category_id ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedCategoryId(category.category_id);
                                    setColor(category.color);
                                }}
                            >
                                {category.category_name}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <label className="dialog-label">{t('unitTime')} ({t('minutes')})</label>
                        <input
                            type="number"
                            min="1"
                            value={unitTime}
                            onChange={(e) => setUnitTime(e.target.value)}
                            className="dialog-input"
                        />
                    </div>

                    <div style={{ flex: 1 }}>
                        <label className="dialog-label">{t('color')}</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="dialog-input"
                            style={{ padding: '2px', height: '42px' }}
                        />
                    </div>
                </div>

                <div>
                    <label className="dialog-label">{t('subjectName')}</label>
                    <input
                        type="text"
                        placeholder={t('addSubject')}
                        className="dialog-input"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                </div>

                <div className="dialog-actions">
                    <button className="btn-secondary" onClick={onClose}>{t('cancel')}</button>
                    <button className="btn-primary" onClick={handleSave}>{t('save')}</button>
                </div>
            </div>
        </div>
    );
};

export default SubjectAddDialog;
