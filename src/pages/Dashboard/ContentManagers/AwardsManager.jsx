import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { client, urlFor } from '../../../client';

const AwardsManager = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentAward, setCurrentAward] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        year: '',
        imgurl: null
    });

    // Fetch awards
    useEffect(() => {
        const fetchAwards = async () => {
            try {
                const query = '*[_type == "awards"] | order(year desc)';
                const data = await client.fetch(query);
                setAwards(data);
            } catch (error) {
                console.error('Error fetching awards:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAwards();
    }, []);

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
            imgPreview: award.imgurl ? urlFor(award.imgurl).url() : null,
            imgurl: null
        });
        setShowForm(true);
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
            <div className="manager-header">
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
                {awards.map(award => (
                    <div key={award._id} className="item-card">
                        {award.imgurl && (
                            <img
                                className="item-image"
                                src={urlFor(award.imgurl)}
                                alt={award.name}
                            />
                        )}
                        <h3>{award.name}</h3>
                        <p>{award.company}</p>
                        <p><strong>Year:</strong> {award.year}</p>
                        <div className="item-actions">
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
        </div>
    );
};

export default AwardsManager;
