import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { Pagination } from '../../../components';
import { useToast } from '../../../components/Toast/Toast';
import api from '../../../api/client';

const AwardsManager = () => {
    const { success, error: showError } = useToast();
    const [awards, setAwards] = useState([]);
    const [filteredAwards, setFilteredAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentAward, setCurrentAward] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        issuer: '',
        year: '',
        date: '',
        imgUrl: null,
        imgPreview: null
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    // Filter and search state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, published, unpublished

    // Get unique issuers for autocomplete
    const uniqueIssuers = React.useMemo(() => {
        const issuers = awards
            .map(award => award.issuer)
            .filter(issuer => issuer && issuer.trim() !== '')
            .filter((issuer, index, self) => self.indexOf(issuer) === index)
            .sort();
        return issuers;
    }, [awards]);

    // Fetch awards
    useEffect(() => {
        const fetchAwards = async () => {
            try {
                // Fetch all awards including unpublished for dashboard
                const response = await api.awards.getAll({ includeUnpublished: true });
                const data = response.data || [];
                setAwards(data);
                setFilteredAwards(data);
            } catch (error) {
                console.error('Error fetching awards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAwards();
    }, []);

    // Filter awards based on search and status
    useEffect(() => {
        let filtered = [...awards];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(award =>
                award.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                award.issuer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                award.year?.toString().includes(searchTerm)
            );
        }

        // Apply status filter
        if (filterStatus === 'published') {
            filtered = filtered.filter(award => award.isPublished);
        } else if (filterStatus === 'unpublished') {
            filtered = filtered.filter(award => !award.isPublished);
        }

        setFilteredAwards(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [awards, searchTerm, filterStatus]);

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

    // Handle edit award
    const handleEdit = (award) => {
        setCurrentAward(award);
        setFormData({
            title: award.title || '',
            issuer: award.issuer || '',
            year: award.year?.toString() || '',
            date: award.date || '',
            imgPreview: award.imgUrl || null,
            imgUrl: null
        });
        setShowForm(true);
        
        // Scroll to form after a brief delay to ensure it's rendered
        setTimeout(() => {
            const formElement = document.querySelector('.form-container');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Handle toggle publish status
    const handleTogglePublish = async (award) => {
        try {
            await api.awards.togglePublished(award.id);
            // Refetch all awards including unpublished
            const response = await api.awards.getAll({ includeUnpublished: true });
            setAwards(response.data || []);
            success(`Award ${award.isPublished ? 'unpublished' : 'published'} successfully!`);
        } catch (err) {
            console.error('Error toggling publish status:', err);
            showError('Failed to update publish status');
        }
    };

    // Handle delete award
    const handleDelete = async (awardId) => {
        if (window.confirm('Are you sure you want to delete this award?')) {
            try {
                await api.awards.delete(awardId);
                setAwards(awards.filter(award => award.id !== awardId));
                success('Award deleted successfully!');
            } catch (err) {
                console.error('Error deleting award:', err);
                showError('Failed to delete award');
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let imgUrl = currentAward?.imgUrl || null;

            // Upload new image if selected
            if (formData.imgUrl instanceof File) {
                const imageFormData = new FormData();
                imageFormData.append('image', formData.imgUrl);

                const uploadResponse = await fetch('http://localhost:5001/api/awards/upload-image', {
                    method: 'POST',
                    body: imageFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadResult = await uploadResponse.json();
                imgUrl = uploadResult.data.imgUrl;
            }

            // Extract year from date if date is provided
            let yearValue = formData.year ? parseInt(formData.year) : null;
            if (formData.date) {
                const dateObj = new Date(formData.date);
                yearValue = dateObj.getFullYear();
            }

            const awardData = {
                title: formData.title,
                issuer: formData.issuer || null,
                year: yearValue,
                date: formData.date || null,
                imgUrl: imgUrl
            };

            if (currentAward) {
                // Update existing award
                await api.awards.update(currentAward.id, awardData);
                success('Award updated successfully!');
            } else {
                // Create new award
                await api.awards.create(awardData);
                success('Award created successfully!');
            }

            // Refetch awards
            const response = await api.awards.getAll({ includeUnpublished: true });
            setAwards(response.data || []);

            // Reset form
            setShowForm(false);
            setCurrentAward(null);
            setFormData({
                title: '',
                issuer: '',
                year: '',
                date: '',
                imgUrl: null,
                imgPreview: null
            });
        } catch (err) {
            console.error('Error saving award:', err);
            showError(currentAward ? 'Failed to update award' : 'Failed to create award');
        }
    };

    if (loading) return <div>Loading awards...</div>;

    return (
        <div className="content-manager awards-manager">
            <div className="header">
                <h2>Manage Awards & Certificates</h2>
                <button
                    className="add-btn"
                    onClick={() => {
                        setCurrentAward(null);
                        setFormData({
                            title: '',
                            issuer: '',
                            year: '',
                            date: '',
                            imgUrl: null,
                            imgPreview: null
                        });
                        setShowForm(true);
                        
                        // Scroll to form after a brief delay to ensure it's rendered
                        setTimeout(() => {
                            const formElement = document.querySelector('.form-container');
                            if (formElement) {
                                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 100);
                    }}
                >
                    <FiPlus /> Add Award
                </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="controls-bar" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div className="search-box" style={{ flex: 1, position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Search awards by name, company, or year..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        minWidth: '150px'
                    }}
                >
                    <option value="all">All ({awards.length})</option>
                    <option value="published">Published ({awards.filter(a => a.isPublished).length})</option>
                    <option value="unpublished">Unpublished ({awards.filter(a => !a.isPublished).length})</option>
                </select>
            </div>

            {showForm && (
                <div className="form-container">
                    <h3>{currentAward ? 'Edit Award' : 'Add New Award'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Award Name</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Issuer/Organization</label>
                            <input
                                type="text"
                                name="issuer"
                                value={formData.issuer}
                                onChange={handleChange}
                                list="issuer-suggestions"
                                placeholder="Type or select from existing issuers..."
                                autoComplete="off"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}
                            />
                            <datalist id="issuer-suggestions">
                                {uniqueIssuers.map((issuer, index) => (
                                    <option key={index} value={issuer} />
                                ))}
                            </datalist>
                            {uniqueIssuers.length > 0 && (
                                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                    💡 {uniqueIssuers.length} existing issuer{uniqueIssuers.length !== 1 ? 's' : ''} available. Start typing to see suggestions.
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Award Date (Month & Year)</label>
                            <input
                                type="month"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                placeholder="YYYY-MM"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}
                            />
                            <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                Select month and year for better sorting. Year will be auto-extracted.
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Year Only (Optional - if no specific month)</label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                placeholder="e.g., 2024"
                                min="1900"
                                max="2100"
                                disabled={!!formData.date}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px',
                                    opacity: formData.date ? 0.5 : 1
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            {formData.imgPreview && (
                                <div className="image-preview">
                                    <img src={formData.imgPreview} alt="Award preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                {currentAward ? 'Update Award' : 'Add Award'}
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="items-grid">
                {filteredAwards.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(award => (
                    <div key={award.id} className="item-card">
                        {award.imgUrl && (
                            <img
                                className="item-image"
                                src={award.imgUrl}
                                alt={award.title}
                            />
                        )}
                        <h3>{award.title}</h3>
                        <p>{award.issuer}</p>
                        <p><strong>Date:</strong> {award.date ? new Date(award.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : award.year || 'N/A'}</p>
                        <div className="status-badges">
                            <span className={`status-badge ${award.isPublished ? 'published' : 'draft'}`}>
                                {award.isPublished ? '✓ Published' : '📝 Draft'}
                            </span>
                        </div>
                        <div className="item-actions">
                            <button
                                className={`publish-btn ${award.isPublished ? 'unpublish' : ''}`}
                                onClick={() => handleTogglePublish(award)}
                                title={award.isPublished ? 'Unpublish' : 'Publish'}
                            >
                                {award.isPublished ? '👁️' : '👁️'}
                            </button>
                            <button
                                className="edit-btn"
                                onClick={() => handleEdit(award)}
                            >
                                <FiEdit />
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => handleDelete(award.id)}
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredAwards.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredAwards.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            )}
        </div>
    );
};

export default AwardsManager;
