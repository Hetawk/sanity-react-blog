import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiRefreshCw, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { apiClient } from '../../api/client';
import './ResumeItemEditor.scss';

/**
 * ResumeItemEditor Component
 * Modal for editing resume items with CRUD operations
 * Supports syncing changes back to the portfolio database
 */
const ResumeItemEditor = ({
    item,
    itemType,
    onSave,
    onDelete,
    onClose,
    onSyncToPortfolio
}) => {
    const [formData, setFormData] = useState({});
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    // Field configurations for different item types
    const fieldConfigs = {
        experience: [
            { key: 'position', label: 'Position/Title', type: 'text', required: true },
            { key: 'company', label: 'Company', type: 'text', required: true },
            { key: 'location', label: 'Location', type: 'text' },
            { key: 'period', label: 'Period', type: 'text', placeholder: 'Jan 2020 - Present' },
            { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
            { key: 'responsibilities', label: 'Key Responsibilities', type: 'list', fullWidth: true, placeholder: 'Add responsibility...' }
        ],
        education: [
            { key: 'degree', label: 'Degree', type: 'text', required: true },
            { key: 'field', label: 'Field of Study', type: 'text' },
            { key: 'institution', label: 'Institution', type: 'text', required: true },
            { key: 'location', label: 'Location', type: 'text' },
            { key: 'period', label: 'Period', type: 'text' },
            { key: 'gpa', label: 'GPA', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea', fullWidth: true }
        ],
        certifications: [
            { key: 'name', label: 'Certification Name', type: 'text', required: true },
            { key: 'issuer', label: 'Issuing Organization', type: 'text' },
            { key: 'issueDate', label: 'Issue Date', type: 'date' },
            { key: 'expirationDate', label: 'Expiration Date', type: 'date' },
            { key: 'credentialId', label: 'Credential ID', type: 'text' },
            { key: 'credentialUrl', label: 'Credential URL', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea', fullWidth: true }
        ],
        awards: [
            { key: 'name', label: 'Award Name', type: 'text', required: true },
            { key: 'issuer', label: 'Issuing Organization', type: 'text' },
            { key: 'date', label: 'Date', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea', fullWidth: true }
        ],
        projects: [
            { key: 'name', label: 'Project Name', type: 'text', required: true },
            { key: 'technologies', label: 'Technologies', type: 'text', placeholder: 'React, Node.js, etc.' },
            { key: 'url', label: 'Project URL', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea', fullWidth: true }
        ],
        publications: [
            { key: 'title', label: 'Publication Title', type: 'text', required: true },
            { key: 'venue', label: 'Venue/Journal', type: 'text' },
            { key: 'year', label: 'Year', type: 'text' },
            { key: 'authors', label: 'Authors', type: 'text' },
            { key: 'url', label: 'URL', type: 'text' },
            { key: 'description', label: 'Abstract/Description', type: 'textarea', fullWidth: true }
        ],
        volunteerWork: [
            { key: 'role', label: 'Role', type: 'text', required: true },
            { key: 'organization', label: 'Organization', type: 'text', required: true },
            { key: 'period', label: 'Period', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea', fullWidth: true }
        ],
        references: [
            { key: 'name', label: 'Full Name', type: 'text', required: true },
            { key: 'title', label: 'Job Title', type: 'text' },
            { key: 'company', label: 'Company', type: 'text' },
            { key: 'relationship', label: 'Relationship', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'phone', label: 'Phone', type: 'text' },
            { key: 'hasConsent', label: 'Has given consent to be contacted', type: 'checkbox' }
        ]
    };

    useEffect(() => {
        if (item) {
            setFormData({ ...item });
            setHasChanges(false);
        }
    }, [item]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleListAdd = (key, value) => {
        if (!value.trim()) return;
        const currentList = Array.isArray(formData[key]) ? formData[key] : [];
        setFormData(prev => ({ ...prev, [key]: [...currentList, value.trim()] }));
        setHasChanges(true);
    };

    const handleListRemove = (key, index) => {
        const currentList = Array.isArray(formData[key]) ? formData[key] : [];
        setFormData(prev => ({ ...prev, [key]: currentList.filter((_, i) => i !== index) }));
        setHasChanges(true);
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleSyncToPortfolio = async () => {
        if (!formData.sourceId) return;

        setIsSyncing(true);
        setSyncError(null);

        try {
            // Map itemType to API endpoint
            const endpointMap = {
                experience: 'experiences',
                education: 'education',
                certifications: 'certifications',
                awards: 'awards',
                projects: 'projects',
                publications: 'publications',
                volunteerWork: 'volunteer',
                references: 'references'
            };

            const endpoint = endpointMap[itemType];
            if (!endpoint) throw new Error('Unknown content type');

            // Transform data back to portfolio format
            const portfolioData = transformToPortfolioFormat(formData, itemType);

            await apiClient.put(`/api/portfolio-content/${endpoint}/${formData.sourceId}`, portfolioData);

            if (onSyncToPortfolio) {
                onSyncToPortfolio(formData);
            }

            setHasChanges(false);
        } catch (error) {
            console.error('Failed to sync to portfolio:', error);
            setSyncError(error.message || 'Failed to sync changes to portfolio');
        } finally {
            setIsSyncing(false);
        }
    };

    // Transform resume item data back to portfolio format
    const transformToPortfolioFormat = (data, type) => {
        switch (type) {
            case 'experience':
                return {
                    position: data.position,
                    company: data.company,
                    location: data.location,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    isCurrent: data.isCurrent,
                    resumeSummary: data.description,
                    responsibilities: data.responsibilities
                };
            case 'education':
                return {
                    degree: data.degree,
                    field: data.field,
                    institution: data.institution,
                    location: data.location,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    gpa: data.gpa,
                    resumeSummary: data.description
                };
            case 'certifications':
                return {
                    name: data.name,
                    issuer: data.issuer,
                    issueDate: data.issueDate,
                    expirationDate: data.expirationDate,
                    credentialId: data.credentialId,
                    credentialUrl: data.credentialUrl,
                    resumeSummary: data.description
                };
            case 'awards':
                return {
                    title: data.title,
                    issuer: data.issuer,
                    year: data.year,
                    resumeSummary: data.description
                };
            case 'projects':
                return {
                    title: data.title,
                    role: data.role,
                    techStack: data.techStack,
                    projectLink: data.url,
                    resumeSummary: data.description
                };
            case 'publications':
                return {
                    title: data.title,
                    venue: data.venue,
                    year: data.year,
                    authors: data.authors,
                    url: data.url,
                    abstract: data.description
                };
            case 'volunteerWork':
                return {
                    role: data.role,
                    organization: data.organization,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    isCurrent: data.isCurrent,
                    resumeSummary: data.description
                };
            case 'references':
                return {
                    name: data.name,
                    title: data.title,
                    company: data.company,
                    relationship: data.relationship,
                    email: data.email,
                    phone: data.phone,
                    hasConsent: data.hasConsent
                };
            default:
                return data;
        }
    };

    const fields = fieldConfigs[itemType] || [];
    const itemTitle = getItemTitle(formData, itemType);

    return (
        <div className="resume-item-editor-overlay" onClick={onClose}>
            <div className="resume-item-editor-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit {itemType.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-content">
                    {item?.sourceId && (
                        <div className="portfolio-source-info">
                            <FiRefreshCw />
                            <span>This item was imported from your portfolio</span>
                        </div>
                    )}

                    <div className="form-grid">
                        {fields.map(field => (
                            <div
                                key={field.key}
                                className={`form-group ${field.fullWidth ? 'full-width' : ''}`}
                            >
                                <label>
                                    {field.label}
                                    {field.required && <span className="required">*</span>}
                                </label>

                                {field.type === 'text' && (
                                    <input
                                        type="text"
                                        value={formData[field.key] || ''}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        placeholder={field.placeholder || ''}
                                    />
                                )}

                                {field.type === 'email' && (
                                    <input
                                        type="email"
                                        value={formData[field.key] || ''}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                    />
                                )}

                                {field.type === 'date' && (
                                    <input
                                        type="date"
                                        value={formData[field.key] ? formData[field.key].split('T')[0] : ''}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                    />
                                )}

                                {field.type === 'textarea' && (
                                    <textarea
                                        value={formData[field.key] || ''}
                                        onChange={e => handleChange(field.key, e.target.value)}
                                        rows={4}
                                    />
                                )}

                                {field.type === 'checkbox' && (
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData[field.key] || false}
                                            onChange={e => handleChange(field.key, e.target.checked)}
                                        />
                                        {field.label}
                                    </label>
                                )}

                                {field.type === 'list' && (
                                    <div className="list-input">
                                        <div className="list-items">
                                            {(Array.isArray(formData[field.key]) ? formData[field.key] : []).map((item, idx) => (
                                                <div key={idx} className="list-item">
                                                    <span>{item}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleListRemove(field.key, idx)}
                                                    >
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="list-add">
                                            <input
                                                type="text"
                                                placeholder={field.placeholder}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleListAdd(field.key, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={e => {
                                                    const input = e.target.previousSibling;
                                                    handleListAdd(field.key, input.value);
                                                    input.value = '';
                                                }}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {syncError && (
                        <div className="sync-error">
                            <FiAlertCircle />
                            <span>{syncError}</span>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <div className="footer-left">
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to remove this item?')) {
                                    onDelete();
                                    onClose();
                                }
                            }}
                        >
                            <FiTrash2 /> Remove
                        </button>
                    </div>
                    <div className="footer-right">
                        {item?.sourceId && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleSyncToPortfolio}
                                disabled={isSyncing || !hasChanges}
                                title="Update the original portfolio item with these changes"
                            >
                                <FiRefreshCw className={isSyncing ? 'spinning' : ''} />
                                {isSyncing ? 'Syncing...' : 'Sync to Portfolio'}
                            </button>
                        )}
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleSave}>
                            <FiSave /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper to get item title for display
const getItemTitle = (item, type) => {
    switch (type) {
        case 'experience':
            return item.position || 'Work Experience';
        case 'education':
            return item.degree || 'Education';
        case 'certifications':
            return item.name || 'Certification';
        case 'awards':
            return item.title || 'Award';
        case 'projects':
            return item.title || 'Project';
        case 'publications':
            return item.title || 'Publication';
        case 'volunteerWork':
            return item.role || 'Volunteer Work';
        case 'references':
            return item.name || 'Reference';
        default:
            return 'Item';
    }
};

export default ResumeItemEditor;
