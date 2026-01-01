import React from 'react';
import { FiEdit2, FiTrash2, FiMove } from 'react-icons/fi';
import './DraggableItemCard.scss';

/**
 * DraggableItemCard Component
 * A card component that supports drag-and-drop reordering
 * with edit and delete functionality
 */
const DraggableItemCard = ({
    item,
    index,
    itemType,
    onEdit,
    onDelete,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
    isDragging,
    isDragOver,
    renderContent
}) => {
    const handleDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({ index, itemType }));
        if (onDragStart) onDragStart(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (onDragOver) onDragOver(index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.itemType === itemType && onDrop) {
            onDrop(data.index, index);
        }
    };

    const handleDragEnd = () => {
        if (onDragEnd) onDragEnd();
    };

    return (
        <div
            className={`draggable-item-card ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''} ${item.sourceId ? 'from-portfolio' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
        >
            <div className="drag-handle" title="Drag to reorder">
                <FiMove />
            </div>

            <div className="card-content">
                {item.sourceId && (
                    <span className="portfolio-badge">From Portfolio</span>
                )}
                {renderContent ? renderContent(item) : (
                    <div className="default-content">
                        <strong>{getItemTitle(item, itemType)}</strong>
                        {getItemSubtitle(item, itemType) && (
                            <span className="subtitle">{getItemSubtitle(item, itemType)}</span>
                        )}
                    </div>
                )}
            </div>

            <div className="card-actions">
                <button
                    type="button"
                    className="btn-action btn-edit"
                    onClick={() => onEdit(item, index)}
                    title="Edit item"
                >
                    <FiEdit2 />
                </button>
                <button
                    type="button"
                    className="btn-action btn-delete"
                    onClick={() => {
                        if (window.confirm('Remove this item from the resume?')) {
                            onDelete(index);
                        }
                    }}
                    title="Remove item"
                >
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
};

// Helper functions
const getItemTitle = (item, type) => {
    switch (type) {
        case 'experience':
            return item.position || 'Position';
        case 'education':
            return item.degree || 'Degree';
        case 'certifications':
            return item.name || 'Certification';
        case 'awards':
            return item.name || 'Award';
        case 'projects':
            return item.name || item.title || 'Project';
        case 'publications':
            return item.title || 'Publication';
        case 'volunteerWork':
            return item.role || 'Role';
        case 'references':
            return item.name || 'Reference';
        default:
            return 'Item';
    }
};

const getItemSubtitle = (item, type) => {
    switch (type) {
        case 'experience':
            return item.company;
        case 'education':
            return item.institution;
        case 'certifications':
            return item.issuer;
        case 'awards':
            return item.issuer;
        case 'projects':
            return item.technologies;
        case 'publications':
            return item.venue;
        case 'volunteerWork':
            return item.organization;
        case 'references':
            return item.company;
        default:
            return null;
    }
};

export default DraggableItemCard;
