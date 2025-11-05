import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { Pagination } from '../../../components';
import api from '../../../api/client';

const AwardsManager = () => {
    const [awards, setAwards] = useState([]);
    const [filteredAwards, setFilteredAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentAward, setCurrentAward] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        year: '',
        imgurl: null
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    // Filter and search state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, published, unpublished

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
                award.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                award.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                setFormData({ ...formData, imgPreview: reader.result, imgurl: file });
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle edit award
    const handleEdit = (award) => {
        setCurrentAward(award);
        setFormData({
            name: award.name,
            company: award.company,
            year: award.year,
            imgPreview: award.imgUrl || null,
            imgurl: null
        });
        setShowForm(true);
    };

    // Handle toggle publish status
    const handleTogglePublish = async (award) => {
        try {
            await api.awards.togglePublished(award.id || award._id);
            // Refetch all awards including unpublished
            const response = await api.awards.getAll({ includeUnpublished: true });
            setAwards(response.data || []);
        } catch (error) {
            console.error('Error toggling publish status:', error);
            alert('Failed to update publish status');
        }
    };

    // Handle delete award
    const handleDelete = async (awardId) => {
        if (window.confirm('Are you sure you want to delete this award?')) {
            try {
                await client.delete(awardId);
                setAwards(awards.filter(award => award._id !== awardId));
            } catch (error) {
                console.error('Error deleting award:', error);
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let imageAsset = null;

            // Upload image if new one is selected
            if (formData.imgurl) {
                imageAsset = await client.assets.upload('image', formData.imgurl, {
                    contentType: formData.imgurl.type,
                    filename: formData.imgurl.name,
                });
            }

            const awardDoc = {
                _type: 'awards',
                name: formData.name,
                company: formData.company,
                year: formData.year,
            };

            if (imageAsset) {
                awardDoc.imgurl = {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: imageAsset._id,
                    },
                };
            }

            if (currentAward) {
                // Update existing award
                const updatedAward = await client
                    .patch(currentAward._id)
                    .set(awardDoc)
                    .commit();

                const updatedAwards = awards.map(award =>
                    award._id === updatedAward._id ? updatedAward : award
                );
                setAwards(updatedAwards);
            } else {
                // Create new award
                const newAward = await client.create(awardDoc);
                setAwards([...awards, newAward]);
            }

            // Reset form
            setShowForm(false);
            setCurrentAward(null);
            setFormData({
                name: '',
                company: '',
                year: '',
                imgurl: null,
                imgPreview: null
            });
        } catch (error) {
            console.error('Error saving award:', error);
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
                            name: '',
                            company: '',
                            year: '',
                            imgurl: null,
                            imgPreview: null
                        });
                        setShowForm(true);
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
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Company/Organization</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Year</label>
                            <input
                                type="text"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                required
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
                                alt={award.name}
                            />
                        )}
                        <h3>{award.name}</h3>
                        <p>{award.company}</p>
                        <p><strong>Year:</strong> {award.year}</p>
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
                                onClick={() => handleDelete(award._id)}
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
