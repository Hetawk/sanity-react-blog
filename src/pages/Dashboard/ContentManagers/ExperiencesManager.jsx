import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../../../api/client';

const ExperiencesManager = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentExperience, setCurrentExperience] = useState(null);
    const [formData, setFormData] = useState({
        year: '',
        works: []
    });

    // Form data for individual work experience
    const [workFormData, setWorkFormData] = useState({
        name: '',
        company: '',
        desc: ''
    });

    const [editingWorkIndex, setEditingWorkIndex] = useState(-1);

    // Fetch experiences
    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const response = await api.experiences.getAll();
                const data = response.data || [];
                setExperiences(data);
            } catch (error) {
                console.error('Error fetching experiences:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExperiences();
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle work form input changes
    const handleWorkChange = (e) => {
        const { name, value } = e.target;
        setWorkFormData({ ...workFormData, [name]: value });
    };

    // Handle adding work item to the experience
    const handleAddWork = () => {
        if (editingWorkIndex >= 0) {
            // Update existing work
            const updatedWorks = [...formData.works];
            updatedWorks[editingWorkIndex] = workFormData;
            setFormData({ ...formData, works: updatedWorks });
        } else {
            // Add new work
            setFormData({ ...formData, works: [...formData.works, workFormData] });
        }

        // Reset work form
        setWorkFormData({ name: '', company: '', desc: '' });
        setEditingWorkIndex(-1);
    };

    // Handle editing work item
    const handleEditWork = (index) => {
        setWorkFormData(formData.works[index]);
        setEditingWorkIndex(index);
    };

    // Handle removing work item
    const handleRemoveWork = (index) => {
        const updatedWorks = [...formData.works];
        updatedWorks.splice(index, 1);
        setFormData({ ...formData, works: updatedWorks });
    };

    // Handle edit experience
    const handleEdit = (experience) => {
        setCurrentExperience(experience);
        setFormData({
            year: experience.year,
            works: experience.works || []
        });
        setShowForm(true);
    };

    // Handle delete experience
    const handleDelete = async (experienceId) => {
        if (window.confirm('Are you sure you want to delete this experience?')) {
            try {
                await client.delete(experienceId);
                setExperiences(experiences.filter(exp => exp._id !== experienceId));
            } catch (error) {
                console.error('Error deleting experience:', error);
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const experienceDoc = {
                _type: 'experiences',
                year: formData.year,
                works: formData.works.map(work => ({
                    _type: 'workExperience',
                    name: work.name,
                    company: work.company,
                    desc: work.desc
                }))
            };

            if (currentExperience) {
                // Update existing experience
                const updatedExperience = await client
                    .patch(currentExperience._id)
                    .set(experienceDoc)
                    .commit();

                const updatedExperiences = experiences.map(exp =>
                    exp._id === updatedExperience._id ? updatedExperience : exp
                );
                setExperiences(updatedExperiences);
            } else {
                // Create new experience
                const newExperience = await client.create(experienceDoc);
                setExperiences([...experiences, newExperience]);
            }

            // Reset form
            setShowForm(false);
            setCurrentExperience(null);
            setFormData({
                year: '',
                works: []
            });
        } catch (error) {
            console.error('Error saving experience:', error);
        }
    };

    if (loading) return <div>Loading experiences...</div>;

    return (
        <div className="content-manager experiences-manager">
            <div className="manager-header">
                <h2>Manage Experiences</h2>
                <button
                    className="add-btn"
                    onClick={() => {
                        setCurrentExperience(null);
                        setFormData({
                            year: '',
                            works: []
                        });
                        setShowForm(true);
                    }}
                >
                    <FiPlus /> Add Experience
                </button>
            </div>

            {showForm && (
                <div className="form-container">
                    <h3>{currentExperience ? 'Edit Experience' : 'Add New Experience'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Year</label>
                            <input
                                type="text"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 2020-2021"
                            />
                        </div>

                        <div className="works-section">
                            <h4>Work Items</h4>

                            <div className="work-form">
                                <div className="form-group">
                                    <label>Role/Position</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={workFormData.name}
                                        onChange={handleWorkChange}
                                        placeholder="e.g. Frontend Developer"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Company</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={workFormData.company}
                                        onChange={handleWorkChange}
                                        placeholder="e.g. ACME Corp."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="desc"
                                        value={workFormData.desc}
                                        onChange={handleWorkChange}
                                        placeholder="Describe your responsibilities and achievements"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="add-work-btn"
                                    onClick={handleAddWork}
                                >
                                    {editingWorkIndex >= 0 ? 'Update Work Item' : 'Add Work Item'}
                                </button>
                            </div>

                            {formData.works.length > 0 && (
                                <div className="works-list">
                                    <h5>Current Work Items</h5>
                                    {formData.works.map((work, index) => (
                                        <div key={index} className="work-item">
                                            <h6>{work.name} at {work.company}</h6>
                                            <p>{work.desc}</p>
                                            <div className="work-actions">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditWork(index)}
                                                >
                                                    <FiEdit />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveWork(index)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                {currentExperience ? 'Update Experience' : 'Add Experience'}
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

            <div className="items-grid experiences-grid">
                {experiences.map(experience => (
                    <div key={experience._id} className="experience-card">
                        <h3>{experience.year}</h3>
                        <div className="works-list">
                            {experience.works && experience.works.map((work, index) => (
                                <div key={index} className="work-item">
                                    <h4>{work.name}</h4>
                                    <h5>{work.company}</h5>
                                    <p>{work.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="item-actions">
                            <button
                                className="edit-btn"
                                onClick={() => handleEdit(experience)}
                            >
                                <FiEdit />
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => handleDelete(experience._id)}
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

export default ExperiencesManager;
