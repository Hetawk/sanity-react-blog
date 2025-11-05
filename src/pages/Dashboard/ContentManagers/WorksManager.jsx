import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiEye, FiEyeOff, FiStar, FiSearch, FiFilter, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import api from '../../../api/client';
import { useToast } from '../../../components/Toast/Toast';
import Pagination from '../../../components/Pagination/Pagination';

const WorksManager = () => {
    const toast = useToast();
    const [works, setWorks] = useState([]);
    const [filteredWorks, setFilteredWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentWork, setCurrentWork] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectLink: '',
        codeLink: '',
        imgUrl: null,
        tags: []
    });

    const [tagInput, setTagInput] = useState('');

    // Table controls
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('title');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft, featured
    const [selectedRows, setSelectedRows] = useState([]);

    // Fetch works
    const loadWorks = async () => {
        try {
            setLoading(true);
            // Fetch all works including unpublished for dashboard
            const response = await api.works.getAll({ includeUnpublished: true });
            const data = response.data || [];
            setWorks(data);
            setFilteredWorks(data);
        } catch (error) {
            console.error('Error fetching works:', error);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorks();
    }, []);

    // Filter and sort works
    useEffect(() => {
        let filtered = [...works];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(work =>
                work.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                work.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                work.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply status filter
        if (filterStatus !== 'all') {
            if (filterStatus === 'published') {
                filtered = filtered.filter(work => work.isPublished);
            } else if (filterStatus === 'draft') {
                filtered = filtered.filter(work => !work.isPublished);
            } else if (filterStatus === 'featured') {
                filtered = filtered.filter(work => work.isFeatured);
            }
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle different data types
            if (sortField === 'title' || sortField === 'description') {
                aValue = aValue?.toLowerCase() || '';
                bValue = bValue?.toLowerCase() || '';
            } else if (sortField === 'tags') {
                aValue = aValue?.length || 0;
                bValue = bValue?.length || 0;
            } else if (sortField === 'createdAt' || sortField === 'updatedAt') {
                aValue = new Date(aValue || 0);
                bValue = new Date(bValue || 0);
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredWorks(filtered);
    }, [works, searchTerm, filterStatus, sortField, sortDirection]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Preview image before upload
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, imgPreview: reader.result, imgUrl: file });
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle adding a tag
    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    // Handle removing a tag
    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    // Handle drag start for tag reordering
    const handleTagDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target);
        e.dataTransfer.setData('tagIndex', index);
    };

    // Handle drag over for tag reordering
    const handleTagDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    // Handle drop for tag reordering
    const handleTagDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('tagIndex'));

        if (dragIndex === dropIndex) return;

        const newTags = [...formData.tags];
        const [draggedTag] = newTags.splice(dragIndex, 1);
        newTags.splice(dropIndex, 0, draggedTag);

        setFormData({
            ...formData,
            tags: newTags
        });
    };

    // Handle edit work
    const handleEdit = (work) => {
        setCurrentWork(work);
        setFormData({
            title: work.title || '',
            description: work.description || '',
            projectLink: work.projectLink || '',
            codeLink: work.codeLink || '',
            imgPreview: work.imgUrl || null,
            imgUrl: null,
            tags: work.tags || []
        });
        setShowForm(true);
    };

    // Handle delete work
    const handleDelete = async (workId) => {
        if (window.confirm('Are you sure you want to delete this work?')) {
            try {
                await api.works.delete(workId);
                setWorks(works.filter(work => work.id !== workId));
                toast.success('Project deleted successfully!');
            } catch (error) {
                console.error('Error deleting work:', error);
                toast.error('Failed to delete project. Please try again.');
            }
        }
    };

    // Handle toggle publish status
    const handleTogglePublish = async (work) => {
        try {
            const newPublishStatus = !work.isPublished;
            await api.works.update(work.id, {
                isPublished: newPublishStatus,
                isDraft: !newPublishStatus // If unpublishing, mark as draft
            });

            setWorks(works.map(w => w.id === work.id ? { ...w, isPublished: newPublishStatus, isDraft: !newPublishStatus } : w));

            toast.success(`Project ${newPublishStatus ? 'published' : 'unpublished'} successfully!`);
        } catch (error) {
            console.error('Error toggling publish status:', error);
            toast.error('Failed to update publish status. Please try again.');
        }
    };

    // Handle toggle feature status
    const handleToggleFeature = async (work) => {
        try {
            await api.works.update(work.id, {
                isFeatured: !work.isFeatured
            });

            setWorks(works.map(w => w.id === work.id ? { ...w, isFeatured: !w.isFeatured } : w));

            toast.success(`Project ${!work.isFeatured ? 'featured' : 'unfeatured'} successfully! ⭐`);
        } catch (error) {
            console.error('Error toggling feature status:', error);
            toast.error('Failed to update feature status. Please try again.');
        }
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Handle row selection
    const handleRowSelect = (workId) => {
        setSelectedRows(prev =>
            prev.includes(workId)
                ? prev.filter(id => id !== workId)
                : [...prev, workId]
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedRows.length === filteredWorks.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredWorks.map(work => work.id));
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) return;

        if (window.confirm(`Are you sure you want to delete ${selectedRows.length} project(s)?`)) {
            try {
                await Promise.all(selectedRows.map(id => api.works.delete(id)));
                setWorks(works.filter(work => !selectedRows.includes(work.id)));
                setSelectedRows([]);
                toast.success(`Successfully deleted ${selectedRows.length} project(s)!`);
            } catch (error) {
                console.error('Error bulk deleting works:', error);
                toast.error('Failed to delete some projects. Please try again.');
            }
        }
    };    // Handle bulk publish/unpublish
    const handleBulkPublish = async (publish) => {
        if (selectedRows.length === 0) return;

        try {
            await Promise.all(selectedRows.map(id =>
                api.works.update(id, { isPublished: publish, isDraft: !publish })
            ));
            setWorks(works.map(work =>
                selectedRows.includes(work.id)
                    ? { ...work, isPublished: publish, isDraft: !publish }
                    : work
            ));
            setSelectedRows([]);
            toast.success(`Successfully ${publish ? 'published' : 'unpublished'} ${selectedRows.length} project(s)!`);
        } catch (error) {
            console.error('Error bulk updating works:', error);
            toast.error('Failed to update some projects. Please try again.');
        }
    };    // Truncate text helper
    const truncate = (text, length = 50) => {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let uploadedImageUrl = currentWork ? currentWork.imgUrl : '';

            // Upload image if a new file is provided
            if (formData.imgUrl && typeof formData.imgUrl === 'object') {
                toast.info('Uploading image to ekddigital Assets...', 5000);
                const uploadResult = await api.works.uploadImage(formData.imgUrl);
                console.log('📦 Full upload result from API:', uploadResult);
                // The backend returns data nested in a 'data' object
                uploadedImageUrl = uploadResult.data?.imgUrl || uploadResult.imgUrl;
                console.log('🖼️ Extracted image URL:', uploadedImageUrl);
                toast.success('Image uploaded successfully!');
            }

            // Parse tags if they're a comma-separated string
            const tagsArray = typeof formData.tags === 'string'
                ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                : Array.isArray(formData.tags)
                    ? formData.tags
                    : [];

            const workDoc = {
                title: formData.title,
                description: formData.description,
                projectLink: formData.projectLink,
                codeLink: formData.codeLink,
                imgUrl: uploadedImageUrl,
                tags: tagsArray,
            };

            console.log('💾 Saving work with data:', workDoc);

            if (currentWork) {
                // Update existing work
                await api.works.update(currentWork.id, workDoc);
                toast.success('Work updated successfully!');

                const updatedWorks = works.map(work =>
                    work.id === currentWork.id ? { ...work, ...workDoc } : work
                );
                setWorks(updatedWorks);
            } else {
                // Create new work
                const newWork = await api.works.create(workDoc);
                toast.success('Work created successfully!');
                setWorks([...works, newWork]);
            }

            // Reset form
            setShowForm(false);
            setCurrentWork(null);
            setFormData({
                title: '',
                description: '',
                projectLink: '',
                codeLink: '',
                imgUrl: null,
                imgPreview: null,
                tags: []
            });

            // Reload works to get fresh data
            loadWorks();
        } catch (error) {
            console.error('Error saving work:', error);
            toast.error(`Failed to ${currentWork ? 'update' : 'create'} work: ${error.message}`);
        }
    };

    if (loading) return <div>Loading works...</div>;

    return (
        <div className="content-manager works-manager">
            <div className="manager-header">
                <h2>Manage Works</h2>
                <button
                    className="add-btn"
                    onClick={() => {
                        setCurrentWork(null);
                        setFormData({
                            title: '',
                            description: '',
                            projectLink: '',
                            codeLink: '',
                            imgUrl: null,
                            imgPreview: null,
                            tags: []
                        });
                        setShowForm(true);
                    }}
                >
                    <FiPlus /> Add Work
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{currentWork ? 'Edit Work' : 'Add New Work'}</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowForm(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter project title"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                        placeholder="Describe your project..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Project Link</label>
                                    <input
                                        type="url"
                                        name="projectLink"
                                        value={formData.projectLink}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Code Link</label>
                                    <input
                                        type="url"
                                        name="codeLink"
                                        value={formData.codeLink}
                                        onChange={handleChange}
                                        placeholder="https://github.com/..."
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Project Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="file-input"
                                    />
                                    {formData.imgPreview && (
                                        <div className="image-preview">
                                            <img src={formData.imgPreview} alt="Project preview" />
                                            <span className="image-label">Preview</span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group full-width">
                                    <label>Tags</label>
                                    <div className="tag-input-container">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddTag();
                                                }
                                            }}
                                            placeholder="Add a tag and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="add-tag-btn"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {formData.tags.length > 0 && (
                                        <div className="tags-list">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="tag draggable-tag"
                                                    draggable
                                                    onDragStart={(e) => handleTagDragStart(e, index)}
                                                    onDragOver={handleTagDragOver}
                                                    onDrop={(e) => handleTagDrop(e, index)}
                                                    title="Drag to reorder"
                                                >
                                                    <span className="drag-handle">⋮⋮</span>
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="remove-tag"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {currentWork ? 'Update Project' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table Controls */}
            <div className="table-controls">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-box">
                    <FiFilter className="filter-icon" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Projects ({works.length})</option>
                        <option value="published">Published ({works.filter(w => w.isPublished).length})</option>
                        <option value="draft">Drafts ({works.filter(w => !w.isPublished).length})</option>
                        <option value="featured">Featured ({works.filter(w => w.isFeatured).length})</option>
                    </select>
                </div>

                {selectedRows.length > 0 && (
                    <div className="bulk-actions">
                        <span>{selectedRows.length} selected</span>
                        <button onClick={() => handleBulkPublish(true)} className="bulk-publish-btn">
                            <FiEye /> Publish
                        </button>
                        <button onClick={() => handleBulkPublish(false)} className="bulk-unpublish-btn">
                            <FiEyeOff /> Unpublish
                        </button>
                        <button onClick={handleBulkDelete} className="bulk-delete-btn">
                            <FiTrash2 /> Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.length === filteredWorks.length && filteredWorks.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="image-cell">Image</th>
                            <th
                                className="sortable"
                                onClick={() => handleSort('title')}
                            >
                                Title
                                {sortField === 'title' && (
                                    sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                                )}
                            </th>
                            <th className="description-cell">Description</th>
                            <th
                                className="sortable tags-cell"
                                onClick={() => handleSort('tags')}
                            >
                                Tags
                                {sortField === 'tags' && (
                                    sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                                )}
                            </th>
                            <th className="status-cell">Status</th>
                            <th className="actions-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWorks.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    {searchTerm || filterStatus !== 'all'
                                        ? 'No projects match your filters'
                                        : 'No projects yet. Click "Add Work" to create one.'}
                                </td>
                            </tr>
                        ) : (
                            filteredWorks.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(work => (
                                <tr key={work.id} className={selectedRows.includes(work.id) ? 'selected' : ''}>
                                    <td className="checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(work.id)}
                                            onChange={() => handleRowSelect(work.id)}
                                        />
                                    </td>
                                    <td className="image-cell">
                                        {work.imgUrl && (
                                            <img
                                                src={work.imgUrl}
                                                alt={work.title}
                                                className="table-thumbnail"
                                            />
                                        )}
                                    </td>
                                    <td className="title-cell">
                                        <strong>{work.title}</strong>
                                    </td>
                                    <td className="description-cell">
                                        <span title={work.description}>
                                            {truncate(work.description, 80)}
                                        </span>
                                    </td>
                                    <td className="tags-cell">
                                        {work.tags && work.tags.length > 0 ? (
                                            <div className="tags-compact">
                                                {work.tags.slice(0, 2).map((tag, index) => (
                                                    <span key={index} className="tag-badge">{tag}</span>
                                                ))}
                                                {work.tags.length > 2 && (
                                                    <span className="tag-badge more">+{work.tags.length - 2}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="no-tags">No tags</span>
                                        )}
                                    </td>
                                    <td className="status-cell">
                                        <div className="status-badges">
                                            <span className={`status-badge ${work.isPublished ? 'published' : 'draft'}`}>
                                                {work.isPublished ? '✓ Published' : '📝 Draft'}
                                            </span>
                                            {work.isFeatured && (
                                                <span className="status-badge featured">⭐</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button
                                                className={`icon-btn ${work.isPublished ? 'active' : ''}`}
                                                onClick={() => handleTogglePublish(work)}
                                                title={work.isPublished ? 'Unpublish' : 'Publish'}
                                            >
                                                {work.isPublished ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                            <button
                                                className={`icon-btn ${work.isFeatured ? 'active featured' : ''}`}
                                                onClick={() => handleToggleFeature(work)}
                                                title={work.isFeatured ? 'Unfeature' : 'Feature'}
                                            >
                                                <FiStar />
                                            </button>
                                            <button
                                                className="icon-btn edit"
                                                onClick={() => handleEdit(work)}
                                                title="Edit"
                                            >
                                                <FiEdit />
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => handleDelete(work.id)}
                                                title="Delete"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {filteredWorks.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredWorks.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </div>

            {/* Table Footer */}
            <div className="table-footer">
                <div className="results-info">
                    Showing {filteredWorks.length} of {works.length} projects
                </div>
            </div>
        </div>
    );
};

export default WorksManager;
