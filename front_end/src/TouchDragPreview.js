
import React from 'react';

const TouchDragPreview = ({ subject, position }) => {
    if (!subject || !position) return null;

    return (
        <div style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)', // Center on finger
            pointerEvents: 'none', // Allow events to pass through to underlying elements (important for drop detection)
            zIndex: 9999,
            opacity: 0.8,
            backgroundColor: subject.color || '#ddd',
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid #333',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
        }}>
            {subject.subjectname}
        </div>
    );
};

export default TouchDragPreview;
