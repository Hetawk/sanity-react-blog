import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/client';

const AboutsManager = () => {
    const [abouts, setAbouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentAbout, setCurrentAbout] = useState({
        id: '',
        title: '',
        description: '',
        imgUrl: ''
    });

    useEffect(() => {
        fetchAbouts();
    }, []);

    const fetchAbouts = async () => {
        try {
            setLoading(true);
            const response = await api.abouts.getAll();
            setAbouts(response.data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching abouts:', err);
            setError('Failed to load about content. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (about) => {
        setCurrentAbout(about);
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setCurrentAbout({
            id: '',
            title: '',
            description: '',
            imgUrl: ''
        });
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentAbout.title || !currentAbout.description) {
            setError('Title and description are required');
            return;
        }

        try {
            setLoading(true);

            if (currentAbout.id) {
                // Update existing about
                await api.abouts.update(currentAbout.id, {
                    title: currentAbout.title,
                    description: currentAbout.description,
                    imgUrl: currentAbout.imgUrl
                });
                setSuccess('About content updated successfully!');
            } else {
                // Create new about
                await api.abouts.create({
                    title: currentAbout.title,
                    description: currentAbout.description,
                    imgUrl: currentAbout.imgUrl
                });
                setSuccess('About content created successfully!');
            }

            await fetchAbouts();
            handleCancel();
        } catch (err) {
            console.error('Error saving about:', err);
            setError('Failed to save about content. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this about content?')) {
            return;
        }

        try {
            setLoading(true);
            await api.abouts.delete(id);
            setSuccess('About content deleted successfully!');
            await fetchAbouts();
        } catch (err) {
            console.error('Error deleting about:', err);
            setError('Failed to delete about content. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isEditing) {
        return (
            <div className="manager-loading">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ fontSize: '2rem' }}
                >
                    ⚡
                </motion.div>
                <p>Loading about content...</p>
            </div>
        );
    }

    return (
        <div className="content-manager">
            <div className="manager-header">
                <h2>About Content Manager</h2>
                {!isEditing && (
                    <motion.button
                        className="btn-primary"
                        onClick={() => {
                            setCurrentAbout({
                                id: '',
                                title: '',
                                description: '',
                                imgUrl: ''
                            });
                            setIsEditing(true);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        + Add New About
                    </motion.button>
                )}
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        className="alert alert-error"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        ⚠️ {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        className="alert alert-success"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        ✅ {success}
                    </motion.div>
                )}
            </AnimatePresence>

            {isEditing ? (
                <motion.div
                    className="editor-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <h3>{currentAbout.id ? 'Edit About Content' : 'Create New About Content'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Title *</label>
                            <input
                                type="text"
                                id="title"
                                value={currentAbout.title}
                                onChange={(e) => setCurrentAbout({ ...currentAbout, title: e.target.value })}
                                placeholder="e.g., KINGDOM-Focused Leadership"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                value={currentAbout.description}
                                onChange={(e) => setCurrentAbout({ ...currentAbout, description: e.target.value })}
                                placeholder="Describe this aspect of your professional profile..."
                                rows="6"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="imgUrl">Image URL</label>
                            <input
                                type="url"
                                id="imgUrl"
                                value={currentAbout.imgUrl}
                                onChange={(e) => setCurrentAbout({ ...currentAbout, imgUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                            {currentAbout.imgUrl && (
                                <div className="image-preview">
                                    <img src={currentAbout.imgUrl} alt="Preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <motion.button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {loading ? 'Saving...' : (currentAbout.id ? 'Update' : 'Create')}
                            </motion.button>
                            <motion.button
                                type="button"
                                className="btn-secondary"
                                onClick={handleCancel}
                                disabled={loading}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            ) : (
                <div className="items-grid">
                    {abouts.length === 0 ? (
                        <div className="empty-state">
                            <p>No about content found. Create your first one!</p>
                        </div>
                    ) : (
                        abouts.map((about, index) => (
                            <motion.div
                                key={about.id}
                                className="item-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
                            >
                                {about.imgUrl && (
                                    <div className="item-image">
                                        <img src={about.imgUrl} alt={about.title} />
                                    </div>
                                )}
                                <div className="item-content">
                                    <h3>{about.title}</h3>
                                    <p>{about.description.substring(0, 150)}...</p>
                                </div>
                                <div className="item-actions">
                                    <motion.button
                                        className="btn-edit"
                                        onClick={() => handleEdit(about)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        ✏️ Edit
                                    </motion.button>
                                    <motion.button
                                        className="btn-delete"
                                        onClick={() => handleDelete(about.id)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        🗑️ Delete
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AboutsManager;
