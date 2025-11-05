import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Pagination } from '../../../components';
import api from '../../../api/client';

const SkillsManager = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentSkill, setCurrentSkill] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    const [formData, setFormData] = useState({
        name: '',
        bgColor: '#FFFFFF',
        icon: null
    }

    );

    // Fetch skills
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                // Fetch all skills including unpublished for dashboard
                const response = await api.skills.getAll(true);
                const data = response.data || [];
                setSkills(data);
            }

            catch (error) {
                console.error('Error fetching skills:', error);
            }

            finally {
                setLoading(false);
            }
        }

            ;

        fetchSkills();
    }

        , []);

    // Handle form input changes
    const handleChange = (e) => {
        const {
            name,
            value
        }

            = e.target;

        setFormData({
            ...formData, [name]: value
        }

        );
    }

        ;

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Preview image before upload
            const reader = new FileReader();

            reader.onloadend = () => {
                setFormData({
                    ...formData, iconPreview: reader.result, icon: file
                }

                );
            }

                ;
            reader.readAsDataURL(file);
        }
    }

        ;

    // Handle edit skill
    const handleEdit = (skill) => {
        setCurrentSkill(skill);

        setFormData({
            name: skill.name,
            bgColor: skill.bgColor || '#FFFFFF',
            iconPreview: skill.icon || null,
            icon: null
        }

        );
        setShowForm(true);
    }

        ;

    // Handle toggle publish status
    const handleTogglePublish = async (skill) => {
        try {
            await api.skills.togglePublished(skill.id || skill._id);
            // Refetch all skills including unpublished
            const response = await api.skills.getAll(true);
            setSkills(response.data || []);
        } catch (error) {
            console.error('Error toggling publish status:', error);
            alert('Failed to update publish status');
        }
    };

    // Handle delete skill
    const handleDelete = async (skillId) => {
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                await client.delete(skillId);
                setSkills(skills.filter(skill => skill._id !== skillId));
            }

            catch (error) {
                console.error('Error deleting skill:', error);
            }
        }
    }

        ;

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let iconAsset = null;

            // Upload icon if new one is selected
            if (formData.icon) {
                iconAsset = await client.assets.upload('image', formData.icon, {
                    contentType: formData.icon.type,
                    filename: formData.icon.name,
                }

                );
            }

            const skillDoc = {
                _type: 'skills',
                name: formData.name,
                bgColor: formData.bgColor,
            }

                ;

            if (iconAsset) {
                skillDoc.icon = {

                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: iconAsset._id,
                    }

                    ,
                }

                    ;
            }

            if (currentSkill) {
                // Update existing skill
                const updatedSkill = await client.patch(currentSkill._id).set(skillDoc).commit();

                const updatedSkills = skills.map(skill => skill._id === updatedSkill._id ? updatedSkill : skill);
                setSkills(updatedSkills);
            }

            else {
                // Create new skill
                const newSkill = await client.create(skillDoc);
                setSkills([...skills, newSkill]);
            }

            // Reset form
            setShowForm(false);
            setCurrentSkill(null);

            setFormData({
                name: '',
                bgColor: '#FFFFFF',
                icon: null,
                iconPreview: null
            }

            );
        }

        catch (error) {
            console.error('Error saving skill:', error);
        }
    }

        ;

    if (loading) return <div>Loading skills...</div>;

    return (<div className="content-manager skills-manager"> <div className="manager-header"> <h2>Manage Skills</h2> <button className="add-btn"

        onClick={
            () => {
                setCurrentSkill(null);

                setFormData({
                    name: '',
                    bgColor: '#FFFFFF',
                    icon: null,
                    iconPreview: null
                }

                );
                setShowForm(true);
            }
        }

    > <FiPlus /> Add Skill </button> </div> {
            showForm && (<div className="form-container"> <h3> {
                currentSkill ? 'Edit Skill' : 'Add New Skill'
            }

            </h3> <form onSubmit={
                handleSubmit
            }

            > <div className="form-group"> <label>Skill Name</label> <input type="text"
                name="name"

                value={
                    formData.name
                }

                onChange={
                    handleChange
                }

                required /> </div> <div className="form-group"> <label>Background Color</label> <input type="color"
                    name="bgColor"

                    value={
                        formData.bgColor
                    }

                    onChange={
                        handleChange
                    }

                /> </div> <div className="form-group"> <label>Icon</label> <input type="file"
                    accept="image/*"

                    onChange={
                        handleImageUpload
                    }

                /> {
                            formData.iconPreview && (<div className="image-preview"> <img src={
                                formData.iconPreview
                            }

                                alt="Icon preview" /> </div>)
                        }

                    </div> <div className="form-actions"> <button type="submit" className="save-btn"> {
                        currentSkill ? 'Update Skill' : 'Add Skill'
                    }

                    </button> <button type="button"
                        className="cancel-btn"

                        onClick={
                            () => setShowForm(false)
                        }

                    > Cancel </button> </div> </form> </div>)
        }

        <div className="items-grid"> {
            skills.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(skill => (<div key={
                skill._id
            }

                className="item-card"> {
                    skill.icon && (<img className="item-image"

                        src={
                            skill.icon
                        }

                        alt={
                            skill.name
                        }

                    />)
                }

                <h3> {
                    skill.name
                }

                </h3>
                <div className="status-badges">
                    <span className={`status-badge ${skill.isPublished ? 'published' : 'draft'}`}>
                        {skill.isPublished ? '✓ Published' : '📝 Draft'}
                    </span>
                </div>
                <div className="item-actions">
                    <button
                        className={`publish-btn ${skill.isPublished ? 'unpublish' : ''}`}
                        onClick={() => handleTogglePublish(skill)}
                        title={skill.isPublished ? 'Unpublish' : 'Publish'}
                    >
                        {skill.isPublished ? '👁️' : '👁️'}
                    </button>
                    <button className="edit-btn"

                        onClick={
                            () => handleEdit(skill)
                        }

                    > <FiEdit /> </button> <button className="delete-btn"

                        onClick={
                            () => handleDelete(skill._id)
                        }

                    > <FiTrash2 /> </button> </div> </div>))
        }

        </div>

        {skills.length > 0 && (
            <Pagination
                currentPage={currentPage}
                totalItems={skills.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
            />
        )}
    </div>);
}

    ;

export default SkillsManager;