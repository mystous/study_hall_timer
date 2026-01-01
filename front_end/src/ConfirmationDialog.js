import React from 'react';
import { useTranslation } from 'react-i18next';
import './css/Dialogs.css';

const ConfirmationDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel, cancelLabel, isDanger }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog-box" style={{ width: '320px' }}>
                <h3 className="dialog-title">{title}</h3>

                <div style={{ textAlign: 'center', color: '#555', lineHeight: '1.5' }}>
                    {message}
                </div>

                <div className="dialog-actions" style={{ justifyContent: 'center', marginTop: '16px' }}>
                    <button className="btn-secondary" onClick={onCancel}>
                        {cancelLabel || t('cancel')}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={onConfirm}
                        style={isDanger ? { backgroundColor: '#ff4444' } : {}}
                    >
                        {confirmLabel || t('confirm') || 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
