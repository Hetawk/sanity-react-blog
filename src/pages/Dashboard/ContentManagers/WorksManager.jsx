import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { client, urlFor } from '../../../client';

const WorksManager = () => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentWork, setCurrentWork] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectLink: '',
        codeLink: '',
        imgUrl: null,
        tags: []
    });

    const [tagInput, setTagInput] = useState('');

    // Fetch works
    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const query = '*[_type == "works"]';
                const data = await client.fetch(query);
                setWorks(data);
            } catch (error) {
                console.error('Error fetching works:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorks();
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

    // Handle edit work
    const handleEdit = (work) => {
        setCurrentWork(work);
        setFormData({
            title: work.title || '',
            description: work.description || '',
            projectLink: work.projectLink || '',
            codeLink: work.codeLink || '',
            imgPreview: work.imgUrl ? urlFor(work.imgUrl).url() : null,
            imgUrl: null,
            tags: work.tags || []
        });
        setShowForm(true);
    };

    // Handle delete work
    const handleDelete = async (workId) => {
        if (window.confirm('Are you sure you want to delete this work?')) {
            try {
                await client.delete(workId);
                setWorks(works.filter(work => work._id !== workId));
            } catch (error) {
                console.error('Error deleting work:', error);
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let imageAsset = null;

            // Upload image if new one is selected
            if (formData.imgUrl) {
                imageAsset = await client.assets.upload('image', formData.imgUrl, {
                    contentType: formData.imgUrl.type,
                    filename: formData.imgUrl.name,
                });
            }

            const workDoc = {
                _type: 'works',
                title: formData.title,
                description: formData.description,
                projectLink: formData.projectLink,
                codeLink: formData.codeLink,
                tags: formData.tags
            };

            if (imageAsset) {
                workDoc.imgUrl = {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: imageAsset._id,
                    },
                };
            }

            if (currentWork) {
                // Update existing work
                const updatedWork = await client
                    .patch(currentWork._id)
                    .set(workDoc)
                    .commit();

                const updatedWorks = works.map(work =>
                    work._id === updatedWork._id ? updatedWork : work
                );
                setWorks(updatedWorks);
            } else {
                // Create new work
                const newWork = await client.create(workDoc);
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
        } catch (error) {
            console.error('Error saving work:', error);
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
                <div className="form-container">
                    <h3>{currentWork ? 'Edit Work' : 'Add New Work'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Project Link</label>
                            <input
                                type="text"
                                name="projectLink"
                                value={formData.projectLink}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Code Link</label>
                            <input
                                type="text"
                                name="codeLink"
                                value={formData.codeLink}
                                onChange={handleChange}
                                placeholder="https://github.com/..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Project Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            {formData.imgPreview && (
                                <div className="image-preview">
                                    <img src={formData.imgPreview} alt="Project preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Tags</label>
                            <div className="tag-input">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="Add a tag (e.g. React, UI/UX)"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                >
                                    Add
                                </button>
                            </div>

                            {formData.tags.length > 0 && (
                                <div className="tags-list">
                                    {formData.tags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                {currentWork ? 'Update Work' : 'Add Work'}
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
                {works.map(work => (
                    <div key={work._id} className="item-card">
                        {work.imgUrl && (
                            <img
                                className="item-image"
                                src={urlFor(work.imgUrl)}
                                alt={work.title}
                            />
                        )}
                        <h3>{work.title}</h3>
                        <p>{work.description}</p>

                        {work.tags && work.tags.length > 0 && (
                            <div className="tags-container">
                                {work.tags.map((tag, index) => (
                                    <span key={index} className="tag">{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="item-actions">
                            <button
                                className="edit-btn"
                                onClick={() => handleEdit(work)}
                            >
                                <FiEdit />
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => handleDelete(work._id)}
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

export default WorksManager;
