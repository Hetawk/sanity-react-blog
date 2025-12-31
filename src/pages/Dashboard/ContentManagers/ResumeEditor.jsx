import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX, FiArrowUp, FiArrowDown, FiDatabase } from 'react-icons/fi';
import PortfolioContentPicker from '../../../components/PortfolioContentPicker';
import './ResumeEditor.scss';

/**
 * Resume Editor Component
 * Comprehensive editor for resume content including experiences, education, skills, etc.
 */
const ResumeEditor = ({ resume, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        linkedinUrl: '',
        portfolioUrl: '',
        githubUrl: '',
        githubPersonalUrl: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        languages: [],
        projects: [],
        publications: [],
        awards: [],
        volunteerWork: [],
        references: [],
        isPublic: false,
        allowDownload: true,
        allowShare: true
    });

    const [activeSection, setActiveSection] = useState('basic');

    // Content picker state
    const [showPicker, setShowPicker] = useState(false);
    const [pickerContentType, setPickerContentType] = useState(null);

    // Helper function to parse JSON fields
    const parseJsonField = (field) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;
        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    };

    useEffect(() => {
        if (resume) {
            setFormData({
                title: resume.title || '',
                description: resume.description || '',
                fullName: resume.fullName || '',
                email: resume.email || '',
                phone: resume.phone || '',
                location: resume.location || '',
                summary: resume.summary || '',
                linkedinUrl: resume.linkedinUrl || '',
                portfolioUrl: resume.portfolioUrl || '',
                githubUrl: resume.githubUrl || '',
                githubPersonalUrl: resume.githubPersonalUrl || '',
                experience: parseJsonField(resume.experience),
                education: parseJsonField(resume.education),
                skills: parseJsonField(resume.skills),
                certifications: parseJsonField(resume.certifications),
                languages: parseJsonField(resume.languages),
                projects: parseJsonField(resume.projects),
                publications: parseJsonField(resume.publications),
                awards: parseJsonField(resume.awards),
                volunteerWork: parseJsonField(resume.volunteerWork),
                references: parseJsonField(resume.references),
                isPublic: resume.isPublic || false,
                allowDownload: resume.allowDownload !== false,
                allowShare: resume.allowShare !== false
            });
        }
    }, [resume]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Generic handlers for array fields
    const addArrayItem = (fieldName, template) => {
        setFormData({
            ...formData,
            [fieldName]: [...formData[fieldName], { ...template, id: Date.now() }]
        });
    };

    const updateArrayItem = (fieldName, index, key, value) => {
        const updated = [...formData[fieldName]];
        updated[index] = { ...updated[index], [key]: value };
        setFormData({ ...formData, [fieldName]: updated });
    };

    const removeArrayItem = (fieldName, index) => {
        const updated = formData[fieldName].filter((_, i) => i !== index);
        setFormData({ ...formData, [fieldName]: updated });
    };

    const moveArrayItem = (fieldName, index, direction) => {
        const updated = [...formData[fieldName]];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= updated.length) return;
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        setFormData({ ...formData, [fieldName]: updated });
    };

    // Skill handling (string array)
    const handleSkillsChange = (value) => {
        const skills = value.split(',').map(s => s.trim()).filter(s => s);
        setFormData({ ...formData, skills });
    };

    const handleLanguagesChange = (value) => {
        const languages = value.split(',').map(l => l.trim()).filter(l => l);
        setFormData({ ...formData, languages });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // Content picker handlers
    const openPicker = (contentType) => {
        setPickerContentType(contentType);
        setShowPicker(true);
    };

    const handlePickerSelect = (item, actualContentType) => {
        // Map content type to form field
        const fieldMap = {
            experiences: 'experience',
            education: 'education',
            certifications: 'certifications',
            awards: 'awards',
            projects: 'projects',
            skills: 'skills',
            publications: 'publications',
            leadership: 'experience', // Add leadership as experience
            volunteer: 'volunteerWork',
            references: 'references',
            languages: 'languages'
        };

        // Use the actual content type from the picker (allows cross-type selection)
        const sourceType = actualContentType || pickerContentType;
        const fieldName = fieldMap[sourceType] || sourceType;

        // Ensure the field exists in formData
        const currentField = formData[fieldName] || [];

        setFormData({
            ...formData,
            [fieldName]: [...currentField, { ...item, sourceType }]
        });
    };

    // Get selected IDs for picker to disable already-added items
    const getSelectedIds = (contentType) => {
        const fieldMap = {
            experiences: 'experience',
            education: 'education',
            certifications: 'certifications',
            awards: 'awards',
            projects: 'projects',
            skills: 'skills',
            publications: 'publications',
            volunteer: 'volunteerWork',
            references: 'references',
            languages: 'languages'
        };

        const fieldName = fieldMap[contentType] || contentType;
        return (formData[fieldName] || [])
            .filter(item => item.sourceId)
            .map(item => item.sourceId);
    };

    const sections = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'experience', label: 'Experience' },
        { id: 'education', label: 'Education' },
        { id: 'skills', label: 'Skills' },
        { id: 'projects', label: 'Projects' },
        { id: 'certifications', label: 'Certifications' },
        { id: 'publications', label: 'Publications' },
        { id: 'awards', label: 'Awards' },
        { id: 'volunteer', label: 'Volunteer' },
        { id: 'references', label: 'References' },
        { id: 'settings', label: 'Settings' }
    ];

    return (
        <div className="resume-editor">
            <div className="editor-header">
                <h2>{resume ? 'Edit Resume' : 'Create Resume'}</h2>
                <div className="editor-actions">
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <FiSave /> Save
                    </button>
                    <button className="btn btn-secondary" onClick={onCancel}>
                        <FiX /> Cancel
                    </button>
                </div>
            </div>

            <div className="editor-navigation">
                {sections.map(section => (
                    <button
                        key={section.id}
                        className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                    >
                        {section.label}
                    </button>
                ))}
            </div>

            <form className="editor-content" onSubmit={handleSubmit}>
                {/* BASIC INFO SECTION */}
                {activeSection === 'basic' && (
                    <div className="section">
                        <h3>Basic Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Resume Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Senior Developer Resume"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description"
                                />
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className="form-group">
                                <label>LinkedIn URL</label>
                                <input
                                    type="url"
                                    name="linkedinUrl"
                                    value={formData.linkedinUrl}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Portfolio URL</label>
                                <input
                                    type="url"
                                    name="portfolioUrl"
                                    value={formData.portfolioUrl}
                                    onChange={handleChange}
                                    placeholder="https://yourportfolio.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>GitHub URL (Company)</label>
                                <input
                                    type="url"
                                    name="githubUrl"
                                    value={formData.githubUrl}
                                    onChange={handleChange}
                                    placeholder="https://github.com/ekddigital"
                                />
                            </div>
                            <div className="form-group">
                                <label>GitHub URL (Personal)</label>
                                <input
                                    type="url"
                                    name="githubPersonalUrl"
                                    value={formData.githubPersonalUrl}
                                    onChange={handleChange}
                                    placeholder="https://github.com/hetawk"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Professional Summary</label>
                                <textarea
                                    name="summary"
                                    value={formData.summary}
                                    onChange={handleChange}
                                    placeholder="Write a compelling professional summary..."
                                    rows="5"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* EXPERIENCE SECTION */}
                {activeSection === 'experience' && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Work Experience</h3>
                            <div className="section-actions">
                                <button
                                    type="button"
                                    className="btn btn-portfolio"
                                    onClick={() => openPicker('experiences')}
                                >
                                    <FiDatabase /> Add from Portfolio
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-add"
                                    onClick={() => addArrayItem('experience', {
                                        position: '',
                                        company: '',
                                        location: '',
                                        period: '',
                                        isCurrent: false,
                                        description: '',
                                        responsibilities: []
                                    })}
                                >
                                    <FiPlus /> Add New
                                </button>
                            </div>
                        </div>

                        <div className="items-list">
                            {formData.experience.length === 0 ? (
                                <p className="empty-text">No experience added yet.</p>
                            ) : (
                                formData.experience.map((exp, index) => (
                                    <div key={exp.id || index} className={`item-card ${exp.sourceId ? 'from-portfolio' : ''}`}>
                                        <div className="item-actions">
                                            <button type="button" onClick={() => moveArrayItem('experience', index, 'up')}>
                                                <FiArrowUp />
                                            </button>
                                            <button type="button" onClick={() => moveArrayItem('experience', index, 'down')}>
                                                <FiArrowDown />
                                            </button>
                                            <button type="button" onClick={() => removeArrayItem('experience', index)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                        {exp.sourceId && <span className="portfolio-badge">From Portfolio</span>}

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Position/Title</label>
                                                <input
                                                    type="text"
                                                    value={exp.position}
                                                    onChange={(e) => updateArrayItem('experience', index, 'position', e.target.value)}
                                                    placeholder="Job Title"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Company</label>
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => updateArrayItem('experience', index, 'company', e.target.value)}
                                                    placeholder="Company Name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Location</label>
                                                <input
                                                    type="text"
                                                    value={exp.location}
                                                    onChange={(e) => updateArrayItem('experience', index, 'location', e.target.value)}
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Period</label>
                                                <input
                                                    type="text"
                                                    value={exp.period}
                                                    onChange={(e) => updateArrayItem('experience', index, 'period', e.target.value)}
                                                    placeholder="Jan 2020 - Present"
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label>Description</label>
                                                <textarea
                                                    value={exp.description}
                                                    onChange={(e) => updateArrayItem('experience', index, 'description', e.target.value)}
                                                    placeholder="Describe your responsibilities and achievements..."
                                                    rows="3"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* EDUCATION SECTION */}
                {activeSection === 'education' && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Education</h3>
                            <div className="section-actions">
                                <button
                                    type="button"
                                    className="btn btn-portfolio"
                                    onClick={() => openPicker('education')}
                                >
                                    <FiDatabase /> Add from Portfolio
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-add"
                                    onClick={() => addArrayItem('education', {
                                        degree: '',
                                        field: '',
                                        institution: '',
                                        location: '',
                                        period: '',
                                        gpa: '',
                                        description: ''
                                    })}
                                >
                                    <FiPlus /> Add New
                                </button>
                            </div>
                        </div>

                        <div className="items-list">
                            {formData.education.length === 0 ? (
                                <p className="empty-text">No education added yet.</p>
                            ) : (
                                formData.education.map((edu, index) => (
                                    <div key={edu.id || index} className={`item-card ${edu.sourceId ? 'from-portfolio' : ''}`}>
                                        <div className="item-actions">
                                            <button type="button" onClick={() => moveArrayItem('education', index, 'up')}>
                                                <FiArrowUp />
                                            </button>
                                            <button type="button" onClick={() => moveArrayItem('education', index, 'down')}>
                                                <FiArrowDown />
                                            </button>
                                            <button type="button" onClick={() => removeArrayItem('education', index)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                        {edu.sourceId && <span className="portfolio-badge">From Portfolio</span>}

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Degree/Qualification</label>
                                                <input
                                                    type="text"
                                                    value={edu.degree}
                                                    onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                                                    placeholder="Bachelor of Science"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Institution</label>
                                                <input
                                                    type="text"
                                                    value={edu.institution}
                                                    onChange={(e) => updateArrayItem('education', index, 'institution', e.target.value)}
                                                    placeholder="University Name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Location</label>
                                                <input
                                                    type="text"
                                                    value={edu.location}
                                                    onChange={(e) => updateArrayItem('education', index, 'location', e.target.value)}
                                                    placeholder="City, Country"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Period</label>
                                                <input
                                                    type="text"
                                                    value={edu.period}
                                                    onChange={(e) => updateArrayItem('education', index, 'period', e.target.value)}
                                                    placeholder="2016 - 2020"
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label>Description</label>
                                                <textarea
                                                    value={edu.description}
                                                    onChange={(e) => updateArrayItem('education', index, 'description', e.target.value)}
                                                    placeholder="Relevant coursework, achievements, GPA..."
                                                    rows="2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* SKILLS SECTION */}
                {activeSection === 'skills' && (
                    <div className="section">
                        <h3>Skills & Languages</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Skills (comma-separated)</label>
                                <textarea
                                    value={formData.skills.join(', ')}
                                    onChange={(e) => handleSkillsChange(e.target.value)}
                                    placeholder="JavaScript, React, Node.js, Python, AWS..."
                                    rows="3"
                                />
                                <p className="hint">Enter skills separated by commas</p>
                            </div>
                            <div className="form-group full-width">
                                <label>Languages (comma-separated)</label>
                                <textarea
                                    value={formData.languages.join(', ')}
                                    onChange={(e) => handleLanguagesChange(e.target.value)}
                                    placeholder="English (Native), German (Fluent), French (Intermediate)..."
                                    rows="2"
                                />
                                <p className="hint">Enter languages with proficiency level</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* PROJECTS SECTION */}
                {activeSection === 'projects' && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Projects</h3>
                            <button
                                type="button"
                                className="btn btn-add"
                                onClick={() => addArrayItem('projects', {
                                    name: '',
                                    description: '',
                                    technologies: '',
                                    url: ''
                                })}
                            >
                                <FiPlus /> Add Project
                            </button>
                        </div>

                        <div className="items-list">
                            {formData.projects.length === 0 ? (
                                <p className="empty-text">No projects added yet.</p>
                            ) : (
                                formData.projects.map((project, index) => (
                                    <div key={project.id || index} className="item-card">
                                        <div className="item-actions">
                                            <button type="button" onClick={() => removeArrayItem('projects', index)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Project Name</label>
                                                <input
                                                    type="text"
                                                    value={project.name}
                                                    onChange={(e) => updateArrayItem('projects', index, 'name', e.target.value)}
                                                    placeholder="Project Name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Technologies Used</label>
                                                <input
                                                    type="text"
                                                    value={project.technologies}
                                                    onChange={(e) => updateArrayItem('projects', index, 'technologies', e.target.value)}
                                                    placeholder="React, Node.js, MongoDB"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Project URL</label>
                                                <input
                                                    type="url"
                                                    value={project.url}
                                                    onChange={(e) => updateArrayItem('projects', index, 'url', e.target.value)}
                                                    placeholder="https://github.com/..."
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label>Description</label>
                                                <textarea
                                                    value={project.description}
                                                    onChange={(e) => updateArrayItem('projects', index, 'description', e.target.value)}
                                                    placeholder="Brief description of the project..."
                                                    rows="2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* CERTIFICATIONS SECTION */}
                {activeSection === 'certifications' && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Certifications</h3>
                            <button
                                type="button"
                                className="btn btn-add"
                                onClick={() => addArrayItem('certifications', {
                                    name: '',
                                    issuer: '',
                                    date: '',
                                    url: ''
                                })}
                            >
                                <FiPlus /> Add Certification
                            </button>
                        </div>

                        <div className="items-list">
                            {formData.certifications.length === 0 ? (
                                <p className="empty-text">No certifications added yet.</p>
                            ) : (
                                formData.certifications.map((cert, index) => (
                                    <div key={cert.id || index} className="item-card">
                                        <div className="item-actions">
                                            <button type="button" onClick={() => removeArrayItem('certifications', index)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Certification Name</label>
                                                <input
                                                    type="text"
                                                    value={cert.name}
                                                    onChange={(e) => updateArrayItem('certifications', index, 'name', e.target.value)}
                                                    placeholder="AWS Certified Developer"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Issuing Organization</label>
                                                <input
                                                    type="text"
                                                    value={cert.issuer}
                                                    onChange={(e) => updateArrayItem('certifications', index, 'issuer', e.target.value)}
                                                    placeholder="Amazon Web Services"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Date Obtained</label>
                                                <input
                                                    type="text"
                                                    value={cert.date}
                                                    onChange={(e) => updateArrayItem('certifications', index, 'date', e.target.value)}
                                                    placeholder="January 2023"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Credential URL</label>
                                                <input
                                                    type="url"
                                                    value={cert.url}
                                                    onChange={(e) => updateArrayItem('certifications', index, 'url', e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* PUBLICATIONS SECTION */}
                {activeSection === 'publications' && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Publications</h3>
                            <button
                                type="button"
                                className="btn btn-add"
                                onClick={() => addArrayItem('publications', {
                                    title: '',
                                    venue: '',
                                    year: '',
                                    url: ''
                                })}
                            >
                                <FiPlus /> Add Publication
                            </button>
                        </div>

                        <div className="items-list">
                            {formData.publications.length === 0 ? (
                                <p className="empty-text">No publications added yet.</p>
                            ) : (
                                formData.publications.map((pub, index) => (
                                    <div key={pub.id || index} className="item-card">
                                        <div className="item-actions">
                                            <button type="button" onClick={() => removeArrayItem('publications', index)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>

                                        <div className="form-grid">
                                            <div className="form-group full-width">
                                                <label>Title</label>
                                                <input
                                                    type="text"
                                                    value={pub.title}
                                                    onChange={(e) => updateArrayItem('publications', index, 'title', e.target.value)}
                                                    placeholder="Publication Title"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Venue/Journal</label>
                                                <input
                                                    type="text"
                                                    value={pub.venue}
                                                    onChange={(e) => updateArrayItem('publications', index, 'venue', e.target.value)}
                                                    placeholder="Journal or Conference"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Year</label>
                                                <input
                                                    type="text"
                                                    value={pub.year}
                                                    onChange={(e) => updateArrayItem('publications', index, 'year', e.target.value)}
                                                    placeholder="2023"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>URL</label>
                                                <input
                                                    type="url"
                                                    value={pub.url}
                                                    onChange={(e) => updateArrayItem('publications', index, 'url', e.target.value)}
                                                    placeholder="https://doi.org/..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* AWARDS SECTION */}
                {activeSection === 'awards' && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Awards & Recognition</h3>
                            <button
                                type="button"
                                className="btn btn-add"
                                onClick={() => addArrayItem('awards', {
                                    name: '',
                                    issuer: '',
                                    date: ''
                                })}
                            >
                                <FiPlus /> Add Award
                            </button>
                        </div>

                        <div className="items-list">
                            {formData.awards.length === 0 ? (
                                <p className="empty-text">No awards added yet.</p>
                            ) : (
                                formData.awards.map((award, index) => (
                                    <div key={award.id || index} className="item-card">
                                        <div className="item-actions">
                                            <button type="button" onClick={() => removeArrayItem('awards', index)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Award Name</label>
                                                <input
                                                    type="text"
                                                    value={award.name}
                                                    onChange={(e) => updateArrayItem('awards', index, 'name', e.target.value)}
                                                    placeholder="Award Title"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Issuing Organization</label>
                                                <input
                                                    type="text"
                                                    value={award.issuer}
                                                    onChange={(e) => updateArrayItem('awards', index, 'issuer', e.target.value)}
                                                    placeholder="Organization"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Date</label>
                                                <input
                                                    type="text"
                                                    value={award.date}
                                                    onChange={(e) => updateArrayItem('awards', index, 'date', e.target.value)}
                                                    placeholder="2023"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* VOLUNTEER SECTION */}
                {activeSection === 'volunteer' && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Volunteer Work</h3>
                            <button
                                type="button"
                                className="btn btn-add"
                                onClick={() => addArrayItem('volunteerWork', {
                                    role: '',
                                    organization: '',
                                    period: '',
                                    description: ''
                                })}
                            >
                                <FiPlus /> Add Volunteer Work
                            </button>
                        </div>

                        <div className="items-list">
                            {formData.volunteerWork.length === 0 ? (
                                <p className="empty-text">No volunteer work added yet.</p>
                            ) : (
                                formData.volunteerWork.map((vol, index) => (
                                    <div key={vol.id || index} className="item-card">
                                        <div className="item-actions">
                                            <button type="button" onClick={() => removeArrayItem('volunteerWork', index)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Role</label>
                                                <input
                                                    type="text"
                                                    value={vol.role}
                                                    onChange={(e) => updateArrayItem('volunteerWork', index, 'role', e.target.value)}
                                                    placeholder="Volunteer Role"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Organization</label>
                                                <input
                                                    type="text"
                                                    value={vol.organization}
                                                    onChange={(e) => updateArrayItem('volunteerWork', index, 'organization', e.target.value)}
                                                    placeholder="Organization Name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Period</label>
                                                <input
                                                    type="text"
                                                    value={vol.period}
                                                    onChange={(e) => updateArrayItem('volunteerWork', index, 'period', e.target.value)}
                                                    placeholder="2020 - Present"
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label>Description</label>
                                                <textarea
                                                    value={vol.description}
                                                    onChange={(e) => updateArrayItem('volunteerWork', index, 'description', e.target.value)}
                                                    placeholder="Describe your contributions..."
                                                    rows="2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* REFERENCES SECTION */}
                {activeSection === 'references' && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Professional References</h3>
                            <div className="section-actions">
                                <button
                                    type="button"
                                    className="btn btn-portfolio"
                                    onClick={() => openPicker('references')}
                                >
                                    <FiDatabase /> Add from Portfolio
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-add"
                                    onClick={() => addArrayItem('references', {
                                        name: '',
                                        title: '',
                                        company: '',
                                        relationship: '',
                                        email: '',
                                        phone: '',
                                        hasConsent: false
                                    })}
                                >
                                    <FiPlus /> Add New
                                </button>
                            </div>
                        </div>

                        <div className="items-list">
                            {(formData.references || []).length === 0 ? (
                                <div className="empty-text">
                                    <p>No references added yet.</p>
                                    <p className="hint">Add professional references who can vouch for your work.</p>
                                </div>
                            ) : (
                                formData.references.map((ref, index) => (
                                    <div key={ref.id || index} className={`item-card ${ref.sourceId ? 'from-portfolio' : ''}`}>
                                        <div className="item-actions">
                                            <button type="button" onClick={() => moveArrayItem('references', index, 'up')}>
                                                <FiArrowUp />
                                            </button>
                                            <button type="button" onClick={() => moveArrayItem('references', index, 'down')}>
                                                <FiArrowDown />
                                            </button>
                                            <button type="button" onClick={() => removeArrayItem('references', index)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                        {ref.sourceId && <span className="portfolio-badge">From Portfolio</span>}

                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Full Name *</label>
                                                <input
                                                    type="text"
                                                    value={ref.name}
                                                    onChange={(e) => updateArrayItem('references', index, 'name', e.target.value)}
                                                    placeholder="John Smith"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Job Title</label>
                                                <input
                                                    type="text"
                                                    value={ref.title}
                                                    onChange={(e) => updateArrayItem('references', index, 'title', e.target.value)}
                                                    placeholder="Senior Manager"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Company</label>
                                                <input
                                                    type="text"
                                                    value={ref.company}
                                                    onChange={(e) => updateArrayItem('references', index, 'company', e.target.value)}
                                                    placeholder="Company Name"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Relationship</label>
                                                <input
                                                    type="text"
                                                    value={ref.relationship}
                                                    onChange={(e) => updateArrayItem('references', index, 'relationship', e.target.value)}
                                                    placeholder="Former Supervisor"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    value={ref.email}
                                                    onChange={(e) => updateArrayItem('references', index, 'email', e.target.value)}
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone</label>
                                                <input
                                                    type="tel"
                                                    value={ref.phone}
                                                    onChange={(e) => updateArrayItem('references', index, 'phone', e.target.value)}
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                            <div className="form-group full-width">
                                                <label className="checkbox-inline">
                                                    <input
                                                        type="checkbox"
                                                        checked={ref.hasConsent}
                                                        onChange={(e) => updateArrayItem('references', index, 'hasConsent', e.target.checked)}
                                                    />
                                                    Has given consent to be contacted
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* SETTINGS SECTION */}
                {activeSection === 'settings' && (
                    <div className="section">
                        <h3>Visibility & Settings</h3>
                        <div className="settings-grid">
                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleChange}
                                    />
                                    Make resume publicly accessible
                                </label>
                                <p className="hint">Anyone with the link can view this resume</p>
                            </div>

                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="allowDownload"
                                        checked={formData.allowDownload}
                                        onChange={handleChange}
                                    />
                                    Allow PDF download
                                </label>
                                <p className="hint">Visitors can download a PDF version</p>
                            </div>

                            <div className="checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="allowShare"
                                        checked={formData.allowShare}
                                        onChange={handleChange}
                                    />
                                    Allow sharing
                                </label>
                                <p className="hint">Visitors can share the resume link</p>
                            </div>
                        </div>
                    </div>
                )}
            </form>

            {/* Portfolio Content Picker Modal */}
            {showPicker && pickerContentType && (
                <PortfolioContentPicker
                    contentType={pickerContentType}
                    onSelect={handlePickerSelect}
                    onClose={() => {
                        setShowPicker(false);
                        setPickerContentType(null);
                    }}
                    selectedIds={getSelectedIds(pickerContentType)}
                />
            )}
        </div>
    );
};

export default ResumeEditor;
