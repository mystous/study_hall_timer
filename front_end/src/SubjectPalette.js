import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './css/Dialogs.css'; // Import new styles

const SubjectPalette = ({ subjects, isOpen, onClose, onAddSubject, setSubjectInfo }) => {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const itemsPerPage = 30;
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const dialogRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Reset page on open if needed
        }
    }, [isOpen]);


    const handleMouseDown = (e) => {
        // Only drag if header/container is clicked, not buttons
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            e.preventDefault();
            setPosition({
                x: e.clientX - dragStartPos.current.x,
                y: e.clientY - dragStartPos.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch handlers for palette dragging
    const handleTouchStart = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        setIsDragging(true);
        const touch = e.touches[0];
        dragStartPos.current = {
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        };
    };

    const handleTouchMove = (e) => {
        if (isDragging) {
            if (e.cancelable) e.preventDefault(); // Stop page scrolling when moving the palette
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - dragStartPos.current.x,
                y: touch.clientY - dragStartPos.current.y
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Add global mouse/touch events for dragging
    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging]);


    const getTimeText = (unitTime) => {
        const hours = Math.floor(unitTime / 60);
        const minutes = unitTime % 60;
        return hours > 0 ? (minutes > 0 ?
            `${hours}${t('hours')} ${minutes}${t('minutes')}` :
            `${hours}${t('hours')}`) :
            `${minutes}${t('minutes')}`;
    };

    // Sorting and Pagination
    const sortedSubjects = [...subjects].sort((a, b) => a.unit_time - b.unit_time);
    const totalPages = Math.ceil(sortedSubjects.length / itemsPerPage);

    const currentSubjects = sortedSubjects.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const leftSubjects = currentSubjects.slice(0, Math.ceil(currentSubjects.length / 2));
    const rightSubjects = currentSubjects.slice(Math.ceil(currentSubjects.length / 2));

    // Dynamic Height Calculation logic from original code
    const baseHeight = 30;
    const heightGap = 20;
    // We need to map unit_time to height index. 
    // Get unique unit times and sort
    const uniqueUnitTimes = [...new Set(subjects.map(s => s.unit_time))].sort((a, b) => a - b);
    const getHeight = (unitTime) => {
        const index = uniqueUnitTimes.indexOf(unitTime);
        return baseHeight + (index * heightGap);
    };

    const renderSubject = (subject) => (
        <SubjectItem
            key={subject.subject_id}
            subject={subject}
            getHeight={getHeight}
            getTimeText={getTimeText}
            setSubjectInfo={setSubjectInfo}
        />
    );

    if (!isOpen) return null;

    return (
        <div
            ref={dialogRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="palette-window"
            style={{
                position: 'fixed', // Changed to fixed for better responsiveness/centering logic if needed, but keeping absolute for drag
                left: position.x,
                top: position.y,
                zIndex: 100,
                width: '380px',
                cursor: isDragging ? 'move' : 'default',
            }}
        >
            <h3 className="dialog-title" style={{ cursor: isDragging ? 'move' : 'default' }}>
                {t('subjectPalette.title') || 'Subject List'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '400px', overflowY: 'auto', padding: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {leftSubjects.map(renderSubject)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {rightSubjects.map(renderSubject)}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="pagination-container">
                    {page > 1 && (
                        <button className="pagination-button" onClick={() => setPage(p => p - 1)}>
                            ←
                        </button>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`pagination-button ${p === page ? 'active' : ''}`}
                        >
                            {p}
                        </button>
                    ))}
                    {page < totalPages && (
                        <button className="pagination-button" onClick={() => setPage(p => p + 1)}>
                            →
                        </button>
                    )}
                </div>
            )}

            <div className="dialog-actions" style={{ justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={onClose}>
                    {t('close')}
                </button>
                <button className="btn-primary" onClick={onAddSubject}>
                    {t('addSubject')}
                </button>
            </div>
        </div>
    );
};

const SubjectItem = ({ subject, getHeight, getTimeText, setSubjectInfo }) => {
    const timerRef = useRef(null);
    const startPosRef = useRef(null);

    const handleTouchStart = (e) => {
        // Stop propagation so we don't drag the palette window
        e.stopPropagation();

        startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        // Start Long Press Timer (300ms)
        timerRef.current = setTimeout(() => {
            // If timer fires, we are now dragging the item (Long Press)
            setSubjectInfo(subject);
            // Optional: visual feedback
            if (e.target) e.target.style.opacity = '0.5';
            timerRef.current = null;
        }, 300);
    };

    const handleTouchMove = (e) => {
        if (timerRef.current) {
            // If we move too much before timer fires, cancel it (it's a scroll)
            const touch = e.touches[0];
            const dist = Math.sqrt(
                Math.pow(touch.clientX - startPosRef.current.x, 2) +
                Math.pow(touch.clientY - startPosRef.current.y, 2)
            );
            if (dist > 10) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (e.target) e.target.style.opacity = '1';
    };

    return (
        <div
            draggable="true"
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', `subject-${subject.subject_id}`);
                e.dataTransfer.effectAllowed = 'move';
                e.target.style.opacity = '0.5';
                setSubjectInfo(subject);
            }}
            onDragEnd={(e) => {
                e.target.style.opacity = '1';
                setSubjectInfo(null);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                padding: '5px',
                margin: '2.5px',
                height: `${getHeight(subject.unit_time) / 2}px`,
                background: subject.color || '#f0f0f0',
                borderRadius: '2px',
                cursor: 'move',
                border: '1px solid gray',
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                WebkitUserSelect: 'none'
            }}
        >
            <strong>{subject.subjectname} - {getTimeText(subject.unit_time)}</strong>
        </div>
    );
};

export default SubjectPalette;
