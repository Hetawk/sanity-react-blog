import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiEye, FiEyeOff, FiStar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useToast } from '../../../components/Toast/Toast';
import api from '../../../api/client';

const JourneyManager = () => {
    const { success, error: showError } = useToast();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentSection, setCurrentSection] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const [formData, setFormData] = useState({
        partNumber: '',
        title: '',
        subtitle: '',
        content: '',
        summary: '',
        organization: '',
        role: '',
        location: '',
        duration: '',
        category: '',
        icon: '',
        websiteUrl: '',
        isPublished: true,
        isFeatured: false,
        displayOrder: 0
    });

    const categories = ['Education', 'Church', 'Leadership', 'Ministry', 'Entrepreneurship', 'Technical', 'Service'];

    // Fetch journey sections
    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const response = await api.journey.getAll({ includeUnpublished: true });
            const data = response.data || [];
            // Sort by partNumber
            data.sort((a, b) => a.partNumber - b.partNumber);
            setSections(data);
        } catch (error) {
            console.error('Error fetching journey sections:', error);
            showError('Failed to load journey sections');
        } finally {
            setLoading(false);
        }
    };

    // Filter sections
    const filteredSections = sections.filter(section => {
        const matchesSearch = 
            section.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.content?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = filterCategory === 'all' || section.category === filterCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            partNumber: sections.length + 1,
            title: '',
            subtitle: '',
            content: '',
            summary: '',
            organization: '',
            role: '',
            location: '',
            duration: '',
            category: '',
            icon: '',
            websiteUrl: '',
            isPublished: true,
            isFeatured: false,
            displayOrder: sections.length
        });
        setCurrentSection(null);
    };

    // Handle create new
    const handleNew = () => {
        resetForm();
        setShowForm(true);
    };

    // Handle edit
    const handleEdit = (section) => {
        setCurrentSection(section);
        setFormData({
            partNumber: section.partNumber || '',
            title: section.title || '',
            subtitle: section.subtitle || '',
            content: section.content || '',
            summary: section.summary || '',
            organization: section.organization || '',
            role: section.role || '',
            location: section.location || '',
            duration: section.duration || '',
            category: section.category || '',
            icon: section.icon || '',
            websiteUrl: section.websiteUrl || '',
            isPublished: section.isPublished ?? true,
            isFeatured: section.isFeatured ?? false,
            displayOrder: section.displayOrder || 0
        });
        setShowForm(true);
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.partNumber) {
            showError('Title and Part Number are required');
            return;
        }

        try {
            const payload = {
                ...formData,
                partNumber: parseInt(formData.partNumber),
                displayOrder: parseInt(formData.displayOrder) || 0
            };

            if (currentSection) {
                await api.journey.update(currentSection.id, payload);
                success('Journey section updated successfully!');
            } else {
                await api.journey.create(payload);
                success('Journey section created successfully!');
            }

            setShowForm(false);
            resetForm();
            fetchSections();
        } catch (err) {
            console.error('Error saving journey section:', err);
            showError('Failed to save journey section');
        }
    };

    // Handle toggle publish
    const handleTogglePublish = async (section) => {
        try {
            await api.journey.togglePublished(section.id);
            fetchSections();
            success(`Section ${section.isPublished ? 'unpublished' : 'published'} successfully!`);
        } catch (err) {
            console.error('Error toggling publish status:', err);
            showError('Failed to update publish status');
        }
    };

    // Handle toggle featured
    const handleToggleFeatured = async (section) => {
        try {
            await api.journey.toggleFeatured(section.id);
            fetchSections();
            success(`Section ${section.isFeatured ? 'unfeatured' : 'featured'} successfully!`);
        } catch (err) {
            console.error('Error toggling featured status:', err);
            showError('Failed to update featured status');
        }
    };

    // Handle delete
    const handleDelete = async (section) => {
        if (window.confirm(`Are you sure you want to delete "${section.title}"?`)) {
            try {
                await api.journey.delete(section.id);
                fetchSections();
                success('Journey section deleted successfully!');
            } catch (err) {
                console.error('Error deleting section:', err);
                showError('Failed to delete section');
            }
        }
    };

    // Roman numeral helper
    const toRoman = (num) => {
        const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        return romanNumerals[num] || num?.toString();
    };

    if (loading) {
        return <div className="loading">Loading journey sections...</div>;
    }

    return (
        <div className="content-manager journey-manager">
            <div className="manager-header">
                <div className="header-info">
                    <h2>Journey Sections</h2>
                    <p className="subtitle">Manage your professional journey narrative</p>
                </div>
                <button className="add-btn" onClick={handleNew}>
                    <FiPlus /> Add Section
                </button>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search sections..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-item">
                    <span className="stat-value">{sections.length}</span>
                    <span className="stat-label">Total Sections</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{sections.filter(s => s.isPublished).length}</span>
                    <span className="stat-label">Published</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{sections.filter(s => s.isFeatured).length}</span>
                    <span className="stat-label">Featured</span>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="form-container">
                    <div className="form-header">
                        <h3>{currentSection ? 'Edit Section' : 'New Section'}</h3>
                        <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Part Number *</label>
                                <input
                                    type="number"
                                    name="partNumber"
                                    value={formData.partNumber}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Academic Foundation"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Subtitle</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    placeholder="e.g., Bachelor's in Computer Science"
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Organization</label>
                                <input
                                    type="text"
                                    name="organization"
                                    value={formData.organization}
                                    onChange={handleChange}
                                    placeholder="e.g., Shandong University"
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    placeholder="e.g., President"
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Jinan, China"
                                />
                            </div>
                            <div className="form-group">
                                <label>Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 2019-2024"
                                />
                            </div>
                            <div className="form-group">
                                <label>Icon (emoji)</label>
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleChange}
                                    placeholder="e.g., 🎓"
                                />
                            </div>
                            <div className="form-group">
                                <label>Website URL</label>
                                <input
                                    type="url"
                                    name="websiteUrl"
                                    value={formData.websiteUrl}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Display Order</label>
                                <input
                                    type="number"
                                    name="displayOrder"
                                    value={formData.displayOrder}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Summary (short preview)</label>
                            <textarea
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Brief summary for preview cards..."
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Content (Markdown supported)</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows="12"
                                placeholder="Full content with Markdown formatting..."
                            />
                        </div>

                        <div className="form-row checkboxes">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleChange}
                                />
                                Published
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                />
                                Featured
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="save-btn">
                                {currentSection ? 'Update Section' : 'Create Section'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Sections List */}
            <div className="items-list journey-list">
                {filteredSections.length === 0 ? (
                    <div className="empty-state">
                        <p>No journey sections found.</p>
                        <button onClick={handleNew}>Create your first section</button>
                    </div>
                ) : (
                    filteredSections.map((section) => (
                        <div 
                            key={section.id} 
                            className={`item-card journey-card ${!section.isPublished ? 'unpublished' : ''}`}
                        >
                            <div className="card-header" onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}>
                                <div className="card-left">
                                    <span className="part-badge">Part {toRoman(section.partNumber)}</span>
                                    <span className="section-icon">{section.icon || '📌'}</span>
                                    <div className="card-info">
                                        <h4>{section.title}</h4>
                                        <p className="card-meta">
                                            {section.organization && <span>{section.organization}</span>}
                                            {section.duration && <span> • {section.duration}</span>}
                                            {section.category && <span className="category-badge">{section.category}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="card-right">
                                    <div className="status-badges">
                                        {section.isFeatured && <span className="badge featured">★ Featured</span>}
                                        {!section.isPublished && <span className="badge draft">Draft</span>}
                                    </div>
                                    {expandedId === section.id ? <FiChevronUp /> : <FiChevronDown />}
                                </div>
                            </div>

                            {expandedId === section.id && (
                                <div className="card-expanded">
                                    {section.summary && (
                                        <p className="summary">{section.summary}</p>
                                    )}
                                    {section.content && (
                                        <div className="content-preview">
                                            <strong>Content Preview:</strong>
                                            <p>{section.content.substring(0, 300)}...</p>
                                        </div>
                                    )}
                                    <div className="card-actions">
                                        <button 
                                            className="action-btn"
                                            onClick={() => handleTogglePublish(section)}
                                            title={section.isPublished ? 'Unpublish' : 'Publish'}
                                        >
                                            {section.isPublished ? <FiEyeOff /> : <FiEye />}
                                            {section.isPublished ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <button 
                                            className="action-btn"
                                            onClick={() => handleToggleFeatured(section)}
                                            title={section.isFeatured ? 'Unfeature' : 'Feature'}
                                        >
                                            <FiStar />
                                            {section.isFeatured ? 'Unfeature' : 'Feature'}
                                        </button>
                                        <button 
                                            className="action-btn edit"
                                            onClick={() => handleEdit(section)}
                                        >
                                            <FiEdit /> Edit
                                        </button>
                                        <button 
                                            className="action-btn delete"
                                            onClick={() => handleDelete(section)}
                                        >
                                            <FiTrash2 /> Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JourneyManager;
