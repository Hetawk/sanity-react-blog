import React,
{
    useState,
    useEffect
}

    from 'react';

import {
    FiPlus,
    FiTrash2,
    FiSave,
    FiX,
    FiArrowUp,
    FiArrowDown,
    FiDatabase,
    FiEye,
    FiEyeOff,
    FiMaximize2,
    FiMinimize2
}

    from 'react-icons/fi';
import PortfolioContentPicker from '../../../components/PortfolioContentPicker';
import LiveResumePreview from '../../../components/LiveResumePreview';
import './ResumeEditor.scss';

/**
 * Resume Editor Component
 * Comprehensive editor for resume content including experiences, education, skills, etc.
 * Features a split-view with live preview canvas
 */
const ResumeEditor = ({
    resume, onSave, onCancel
}

) => {

    // URL prefixes for social links
    const URL_PREFIXES = {
        linkedin: 'linkedin.com/in/',
        github: 'github.com/',
        portfolio: '' // Full URL for portfolio
    }

        ;

    // Helper to extract username from full URL
    const extractUsername = (url, type) => {
        if (!url) return '';
        const prefix = URL_PREFIXES[type];
        if (!prefix) return url;

        // Remove https://, http://, www. and handle malformed URLs with spaces
        let cleaned = url.replace(/^https?\s*:\s*\/\/(www\.)?/, '');

        // Remove the prefix if present
        if (cleaned.startsWith(prefix)) {
            cleaned = cleaned.replace(prefix, '');
        }

        // Remove any remaining protocol or domain patterns
        cleaned = cleaned.replace(/^(www\.)?linkedin\.com\/in\//, '');
        cleaned = cleaned.replace(/^(www\.)?github\.com\//, '');

        // Remove trailing slash and any query parameters
        cleaned = cleaned.replace(/[\/\?#].*$/, '');

        return cleaned.trim();
    }

        ;

    // Helper to build full URL from username
    const buildFullUrl = (username, type) => {
        if (!username) return '';
        if (type === 'portfolio') return username; // Portfolio is full URL
        const prefix = URL_PREFIXES[type];
        // If already a full URL, return as is
        if (username.includes('://')) return username;
        return `https://${prefix}${username}`;
    }

        ;

    const [formData,
        setFormData] = useState({

            title: '',
            description: '',
            fullName: '',
            email: '',
            phone: '',
            location: '',
            country: '',
            city: '',
            summary: '',
            // Username/handle fields (without full URL)
            linkedinUsername: '',
            portfolioUrl: '',
            portfolioLabel: 'Portfolio',
            githubCompany: '',
            githubPersonal: '',
            // Legacy URL fields (for backward compatibility)
            linkedinUrl: '',
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
            allowShare: true,
            // Visibility settings
            visibility: {
                country: true,
                city: true,
                phone: true,
                email: true,
                linkedinUrl: true,
                portfolioUrl: true,
                githubUrl: true,
                githubPersonalUrl: true
            }

            ,
            // Portfolio source preference (personal or company)
            portfolioSource: 'personal' // 'personal' | 'company' | 'both'
        }

        );

    const [activeSection,
        setActiveSection] = useState('basic');

    // Preview panel state
    const [showPreview,
        setShowPreview] = useState(true);
    const [previewScale,
        setPreviewScale] = useState(0.6);
    const [isPreviewMaximized,
        setIsPreviewMaximized] = useState(false);

    // Content picker state
    const [showPicker,
        setShowPicker] = useState(false);
    const [pickerContentType,
        setPickerContentType] = useState(null);

    // Helper function to parse JSON fields
    const parseJsonField = (field) => {
        if (!field) return [];
        if (Array.isArray(field)) return field;

        try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
        }

        catch (e) {
            return [];
        }
    }

        ;

    useEffect(() => {
        if (resume) {

            // Parse visibility settings if stored as JSON
            let visibility = {
                country: true,
                city: true,
                phone: true,
                email: true,
                linkedinUrl: true,
                portfolioUrl: true,
                githubUrl: true,
                githubPersonalUrl: true
            }

                ;

            if (resume.visibility) {
                try {
                    visibility = typeof resume.visibility === 'string'
                        ? JSON.parse(resume.visibility) : resume.visibility;
                }

                catch (e) {
                    console.warn('Could not parse visibility settings');
                }
            }

            setFormData({
                title: resume.title || '',
                description: resume.description || '',
                fullName: resume.fullName || '',
                email: resume.email || '',
                phone: resume.phone || '',
                location: resume.location || '',
                country: typeof resume.country === 'string' ? resume.country : (resume.country?.name || resume.country?.code || ''),
                city: resume.city || '',
                summary: resume.summary || '',
                // Extract usernames from full URLs (backward compatibility)
                linkedinUsername: resume.linkedinUsername || extractUsername(resume.linkedinUrl, 'linkedin'),
                portfolioUrl: resume.portfolioUrl || '',
                portfolioLabel: resume.portfolioLabel || 'Portfolio',
                githubCompany: resume.githubCompany || extractUsername(resume.githubUrl, 'github'),
                githubPersonal: resume.githubPersonal || extractUsername(resume.githubPersonalUrl, 'github'),
                // Keep legacy fields for backward compatibility
                linkedinUrl: resume.linkedinUrl || '',
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
                allowShare: resume.allowShare !== false,
                visibility: visibility,
                portfolioSource: resume.portfolioSource || 'personal'
            }

            );
        }
    }

        , [resume]);

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked
        }

            = e.target;

        let processedValue = type === 'checkbox' ? checked : value;

        // Clean username fields if they contain URLs
        if (name === 'linkedinUsername' && typeof processedValue === 'string') {
            processedValue = extractUsername(processedValue, 'linkedin');
        } else if ((name === 'githubCompany' || name === 'githubPersonal') && typeof processedValue === 'string') {
            processedValue = extractUsername(processedValue, 'github');
        }

        setFormData({
            ...formData,
            [name]: processedValue
        }

        );
    }

        ;

    // Handle visibility toggle for specific fields
    const toggleVisibility = (field) => {
        setFormData({

            ...formData,
            visibility: {
                ...formData.visibility,
                [field]: !formData.visibility[field]
            }
        }

        );
    }

        ;

    // Handle portfolio source change
    const handlePortfolioSourceChange = (source) => {
        setFormData({
            ...formData,
            portfolioSource: source
        }

        );
    }

        ;

    // Generic handlers for array fields
    const addArrayItem = (fieldName, template) => {
        setFormData({

            ...formData,
            [fieldName]: [...formData[fieldName], {
                ...template, id: Date.now()
            }

            ]
        }

        );
    }

        ;

    const updateArrayItem = (fieldName, index, key, value) => {
        const updated = [...formData[fieldName]];

        updated[index] = {
            ...updated[index],
            [key]: value
        }

            ;

        setFormData({
            ...formData, [fieldName]: updated
        }

        );
    }

        ;

    const removeArrayItem = (fieldName, index) => {
        const updated = formData[fieldName].filter((_, i) => i !== index);

        setFormData({
            ...formData, [fieldName]: updated
        }

        );
    }

        ;

    const moveArrayItem = (fieldName, index, direction) => {
        const updated = [...formData[fieldName]];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= updated.length) return;
        [updated[index],
        updated[newIndex]] = [updated[newIndex],
        updated[index]];

        setFormData({
            ...formData, [fieldName]: updated
        }

        );
    }

        ;

    // Skill handling (string array)
    const handleSkillsChange = (value) => {
        const skills = value.split(',').map(s => s.trim()).filter(s => s);

        setFormData({
            ...formData, skills
        }

        );
    }

        ;

    const handleLanguagesChange = (value) => {
        const languages = value.split(',').map(l => l.trim()).filter(l => l);

        setFormData({
            ...formData, languages
        }

        );
    }

        ;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clean username fields to ensure they don't contain URLs
        const cleanLinkedinUsername = extractUsername(formData.linkedinUsername, 'linkedin');
        const cleanGithubCompany = extractUsername(formData.githubCompany, 'github');
        const cleanGithubPersonal = extractUsername(formData.githubPersonal, 'github');

        // Build full URLs from usernames before saving
        const dataToSave = {
            ...formData,
            // Ensure country is a string, not an object
            country: typeof formData.country === 'string' ? formData.country : (formData.country?.name || formData.country?.code || ''),
            // Save clean usernames (without URLs)
            linkedinUsername: cleanLinkedinUsername,
            githubCompany: cleanGithubCompany,
            githubPersonal: cleanGithubPersonal,
            // Build full URLs for storage (backward compatibility)
            linkedinUrl: buildFullUrl(cleanLinkedinUsername, 'linkedin'),
            githubUrl: buildFullUrl(cleanGithubCompany, 'github'),
            githubPersonalUrl: buildFullUrl(cleanGithubPersonal, 'github'),
        }

            ;
        onSave(dataToSave);
    }

        ;

    // Content picker handlers
    const openPicker = (contentType) => {
        setPickerContentType(contentType);
        setShowPicker(true);
    }

        ;

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
        }

            ;

        // Use the actual content type from the picker (allows cross-type selection)
        const sourceType = actualContentType || pickerContentType;
        const fieldName = fieldMap[sourceType] || sourceType;

        // Ensure the field exists in formData
        const currentField = formData[fieldName] || [];

        setFormData({

            ...formData,
            [fieldName]: [...currentField, {
                ...item, sourceType
            }

            ]
        }

        );
    }

        ;

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
        }

            ;

        const fieldName = fieldMap[contentType] || contentType;
        return (formData[fieldName] || []).filter(item => item.sourceId).map(item => item.sourceId);
    }

        ;

    const sections = [{
        id: 'basic', label: 'Basic Info'
    }

        ,
    {
        id: 'experience', label: 'Experience'
    }

        ,
    {
        id: 'education', label: 'Education'
    }

        ,
    {
        id: 'skills', label: 'Skills'
    }

        ,
    {
        id: 'projects', label: 'Projects'
    }

        ,
    {
        id: 'certifications', label: 'Certifications'
    }

        ,
    {
        id: 'publications', label: 'Publications'
    }

        ,
    {
        id: 'awards', label: 'Awards'
    }

        ,
    {
        id: 'volunteer', label: 'Volunteer'
    }

        ,
    {
        id: 'references', label: 'References'
    }

        ,
    {
        id: 'settings', label: 'Settings'
    }

    ];

    // Preview scale controls
    const handleZoomIn = () => setPreviewScale(prev => Math.min(prev + 0.1, 1));
    const handleZoomOut = () => setPreviewScale(prev => Math.max(prev - 0.1, 0.3));
    const togglePreviewMaximize = () => setIsPreviewMaximized(prev => !prev);

    return (<div className={
        `resume-editor-wrapper $ {
                showPreview ? 'with-preview' : ''
            }

            $ {
                isPreviewMaximized ? 'preview-maximized' : ''
            }

            `
    }

    > <div className="resume-editor"> <div className="editor-header"> <h2> {
        resume ? 'Edit Resume' : 'Create Resume'
    }

    </h2> <div className="editor-actions"> <button className={
        `btn btn-preview $ {
                showPreview ? 'active' : ''
            }

            `
    }

        onClick={
            () => setShowPreview(!showPreview)
        }

        title={
            showPreview ? 'Hide Preview' : 'Show Preview'
        }

    > {
            showPreview ? <FiEyeOff /> : <FiEye />
        }

        <span className="btn-text"> {
            showPreview ? 'Hide Preview' : 'Show Preview'
        }

        </span> </button> <button className="btn btn-primary" onClick={
            handleSubmit
        }

        > <FiSave /> Save </button> <button className="btn btn-secondary" onClick={
            onCancel
        }

        > <FiX /> Cancel </button> </div> </div> <div className="editor-navigation"> {
            sections.map(section => (<button key={
                section.id
            }

                className={
                    `nav-btn $ {
                            activeSection===section.id ? 'active' : ''
                        }

                        `
                }

                onClick={
                    () => setActiveSection(section.id)
                }

            > {
                    section.label
                }

            </button>))
        }

            </div> <form className="editor-content" onSubmit={
                handleSubmit
            }

            > {
                    /* BASIC INFO SECTION */
                }

                {
                    activeSection === 'basic' && (<div className="section"> <h3>Basic Information</h3> <div className="form-grid"> <div className="form-group"> <label>Resume Title *</label> <input type="text"
                        name="title"

                        value={
                            formData.title
                        }

                        onChange={
                            handleChange
                        }

                        placeholder="e.g., Senior Developer Resume"
                        required /> </div> <div className="form-group"> <label>Description</label> <input type="text"
                            name="description"

                            value={
                                formData.description
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="Brief description"
                        /> </div> <div className="form-group"> <label>Full Name</label> <input type="text"
                            name="fullName"

                            value={
                                formData.fullName
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="John Doe"

                        /> </div> {
                            /* Email with visibility toggle */
                        }

                        <div className={
                            `form-group with-visibility $ {
                         !formData.visibility.email ? 'hidden-field' : ''
                    }

                    `
                        }

                        > <div className="label-row"> <label>Email</label> <button type="button"

                            className={
                                `visibility-toggle $ {
                        formData.visibility.email ? 'visible' : 'hidden'
                    }

                    `
                            }

                            onClick={
                                () => toggleVisibility('email')
                            }

                            title={
                                formData.visibility.email ? 'Hide on resume' : 'Show on resume'
                            }

                        > {
                                formData.visibility.email ? <FiEye /> : <FiEyeOff />
                            }

                        </button> </div> <input type="email"
                            name="email"

                            value={
                                formData.email
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="john@example.com"

                            /> </div> {
                            /* Phone with visibility toggle */
                        }

                        <div className={
                            `form-group with-visibility $ {
                         !formData.visibility.phone ? 'hidden-field' : ''
                    }

                    `
                        }

                        > <div className="label-row"> <label>Phone</label> <button type="button"

                            className={
                                `visibility-toggle $ {
                        formData.visibility.phone ? 'visible' : 'hidden'
                    }

                    `
                            }

                            onClick={
                                () => toggleVisibility('phone')
                            }

                            title={
                                formData.visibility.phone ? 'Hide on resume' : 'Show on resume'
                            }

                        > {
                                formData.visibility.phone ? <FiEye /> : <FiEyeOff />
                            }

                        </button> </div> <input type="tel"
                            name="phone"

                            value={
                                formData.phone
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="+1 234 567 890"

                            /> </div> {
                            /* City with visibility toggle */
                        }

                        <div className={
                            `form-group with-visibility $ {
                         !formData.visibility.city ? 'hidden-field' : ''
                    }

                    `
                        }

                        > <div className="label-row"> <label>City</label> <button type="button"

                            className={
                                `visibility-toggle $ {
                        formData.visibility.city ? 'visible' : 'hidden'
                    }

                    `
                            }

                            onClick={
                                () => toggleVisibility('city')
                            }

                            title={
                                formData.visibility.city ? 'Hide on resume' : 'Show on resume'
                            }

                        > {
                                formData.visibility.city ? <FiEye /> : <FiEyeOff />
                            }

                        </button> </div> <input type="text"
                            name="city"

                            value={
                                formData.city
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="New York"

                            /> </div> {
                            /* Country with visibility toggle */
                        }

                        <div className={
                            `form-group with-visibility $ {
                         !formData.visibility.country ? 'hidden-field' : ''
                    }

                    `
                        }

                        > <div className="label-row"> <label>Country</label> <button type="button"

                            className={
                                `visibility-toggle $ {
                        formData.visibility.country ? 'visible' : 'hidden'
                    }

                    `
                            }

                            onClick={
                                () => toggleVisibility('country')
                            }

                            title={
                                formData.visibility.country ? 'Hide on resume' : 'Show on resume'
                            }

                        > {
                                formData.visibility.country ? <FiEye /> : <FiEyeOff />
                            }

                        </button> </div> <input type="text"
                            name="country"

                            value={
                                formData.country
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="United States"

                            /> </div> {
                            /* LinkedIn with visibility toggle - Username only */
                        }

                        <div className={
                            `form-group with-visibility with-prefix $ {
                         !formData.visibility.linkedinUrl ? 'hidden-field' : ''
                    }

                    `
                        }

                        > <div className="label-row"> <label>LinkedIn</label> <button type="button"

                            className={
                                `visibility-toggle $ {
                        formData.visibility.linkedinUrl ? 'visible' : 'hidden'
                    }

                    `
                            }

                            onClick={
                                () => toggleVisibility('linkedinUrl')
                            }

                            title={
                                formData.visibility.linkedinUrl ? 'Hide on resume' : 'Show on resume'
                            }

                        > {
                                formData.visibility.linkedinUrl ? <FiEye /> : <FiEyeOff />
                            }

                        </button> </div> <div className="input-with-prefix"> <span className="input-prefix">linkedin.com/in/</span> <input type="text"
                            name="linkedinUsername"

                            value={
                                formData.linkedinUsername
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="yourname"

                        /> </div> </div> {
                            /* Portfolio URL with visibility toggle and custom label */
                        }

                        <div className={
                            `form-group with-visibility $ {
                         !formData.visibility.portfolioUrl ? 'hidden-field' : ''
                    }

                    `
                        }

                        > <div className="label-row"> <label>Portfolio Website</label> <button type="button"

                            className={
                                `visibility-toggle $ {
                        formData.visibility.portfolioUrl ? 'visible' : 'hidden'
                    }

                    `
                            }

                            onClick={
                                () => toggleVisibility('portfolioUrl')
                            }

                            title={
                                formData.visibility.portfolioUrl ? 'Hide on resume' : 'Show on resume'
                            }

                        > {
                                formData.visibility.portfolioUrl ? <FiEye /> : <FiEyeOff />
                            }

                        </button> </div> <div className="input-group-stacked"> <input type="text"
                            name="portfolioLabel"

                            value={
                                formData.portfolioLabel
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="Label (e.g., Portfolio, Website)"
                            className="input-label-field"
                        /> <input type="url"
                            name="portfolioUrl"

                            value={
                                formData.portfolioUrl
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="https://yourportfolio.com"

                                /> </div> </div> {
                            /* GitHub Company with visibility toggle - Username only */
                        }

                        <div className={
                            `form-group with-visibility with-prefix $ {
                         !formData.visibility.githubUrl ? 'hidden-field' : ''
                    }

                    `
                        }

                        > <div className="label-row"> <label>GitHub (Company) 🏢</label> <button type="button"

                            className={
                                `visibility-toggle $ {
                        formData.visibility.githubUrl ? 'visible' : 'hidden'
                    }

                    `
                            }

                            onClick={
                                () => toggleVisibility('githubUrl')
                            }

                            title={
                                formData.visibility.githubUrl ? 'Hide on resume' : 'Show on resume'
                            }

                        > {
                                formData.visibility.githubUrl ? <FiEye /> : <FiEyeOff />
                            }

                        </button> </div> <div className="input-with-prefix"> <span className="input-prefix">github.com/</span> <input type="text"
                            name="githubCompany"

                            value={
                                formData.githubCompany
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="ekddigital"

                        /> </div> </div> {
                            /* GitHub Personal with visibility toggle - Username only */
                        }

                        <div className={
                            `form-group with-visibility with-prefix $ {
                         !formData.visibility.githubPersonalUrl ? 'hidden-field' : ''
                    }

                    `
                        }

                        > <div className="label-row"> <label>GitHub (Personal) 🧑</label> <button type="button"

                            className={
                                `visibility-toggle $ {
                        formData.visibility.githubPersonalUrl ? 'visible' : 'hidden'
                    }

                    `
                            }

                            onClick={
                                () => toggleVisibility('githubPersonalUrl')
                            }

                            title={
                                formData.visibility.githubPersonalUrl ? 'Hide on resume' : 'Show on resume'
                            }

                        > {
                                formData.visibility.githubPersonalUrl ? <FiEye /> : <FiEyeOff />
                            }

                        </button> </div> <div className="input-with-prefix"> <span className="input-prefix">github.com/</span> <input type="text"
                            name="githubPersonal"

                            value={
                                formData.githubPersonal
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="hetawk"

                        /> </div> </div> <div className="form-group full-width"> <label>Professional Summary</label> <textarea name="summary"
                            value={
                                formData.summary
                            }

                            onChange={
                                handleChange
                            }

                            placeholder="Write a compelling professional summary..."
                            rows="5"
                        /> </div> </div> </div>)
                }

                {
                    /* EXPERIENCE SECTION */
                }

                {
                    activeSection === 'experience' && (<div className="section"> <div className="section-header"> <h3>Work Experience</h3> <div className="section-actions"> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('experiences')
                        }

                    > <FiDatabase /> Add from Portfolio </button> <button type="button"
                        className="btn btn-add"

                        onClick={
                            () => addArrayItem('experience', {
                                position: '',
                                company: '',
                                location: '',
                                period: '',
                                isCurrent: false,
                                description: '',
                                responsibilities: []
                            }

                            )
                        }

                    > <FiPlus /> Add New </button> </div> </div> <div className="items-list"> {
                        formData.experience.length === 0 ? (<p className="empty-text">No experience added yet.</p>) : (formData.experience.map((exp, index) => (<div key={
                            exp.id || index
                        }

                            className={
                                `item-card $ {
                                        exp.sourceId ? 'from-portfolio' : ''
                                    }

                                    `
                            }

                        > <div className="item-actions"> <button type="button" onClick={
                            () => moveArrayItem('experience', index, 'up')
                        }

                        > <FiArrowUp /> </button> <button type="button" onClick={
                            () => moveArrayItem('experience', index, 'down')
                        }

                        > <FiArrowDown /> </button> <button type="button" onClick={
                            () => removeArrayItem('experience', index)
                        }

                        > <FiTrash2 /> </button> </div> {
                                exp.sourceId && <span className="portfolio-badge">From Portfolio</span>
                            }

                            <div className="form-grid"> <div className="form-group"> <label>Position/Title</label> <input type="text"

                                value={
                                    exp.position
                                }

                                onChange={
                                    (e) => updateArrayItem('experience', index, 'position', e.target.value)
                                }

                                placeholder="Job Title"

                            /> </div> <div className="form-group"> <label>Company</label> <input type="text"
                                value={
                                    exp.company
                                }

                                onChange={
                                    (e) => updateArrayItem('experience', index, 'company', e.target.value)
                                }

                                placeholder="Company Name"

                            /> </div> <div className="form-group"> <label>Location</label> <input type="text"
                                value={
                                    exp.location
                                }

                                onChange={
                                    (e) => updateArrayItem('experience', index, 'location', e.target.value)
                                }

                                placeholder="City, Country"

                            /> </div> <div className="form-group"> <label>Period</label> <input type="text"
                                value={
                                    exp.period
                                }

                                onChange={
                                    (e) => updateArrayItem('experience', index, 'period', e.target.value)
                                }

                                placeholder="Jan 2020 - Present"

                            /> </div> <div className="form-group full-width"> <label>Description</label> <textarea value={
                                exp.description
                            }

                                onChange={
                                    (e) => updateArrayItem('experience', index, 'description', e.target.value)
                                }

                                placeholder="Describe your responsibilities and achievements..."
                                rows="3"
                            /> </div> </div> </div>)))
                    }

                        </div> </div>)
                }

                {
                    /* EDUCATION SECTION */
                }

                {
                    activeSection === 'education' && (<div className="section"> <div className="section-header"> <h3>Education</h3> <div className="section-actions"> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('education')
                        }

                    > <FiDatabase /> Add from Portfolio </button> <button type="button"
                        className="btn btn-add"

                        onClick={
                            () => addArrayItem('education', {
                                degree: '',
                                field: '',
                                institution: '',
                                location: '',
                                period: '',
                                gpa: '',
                                description: ''
                            }

                            )
                        }

                    > <FiPlus /> Add New </button> </div> </div> <div className="items-list"> {
                        formData.education.length === 0 ? (<p className="empty-text">No education added yet.</p>) : (formData.education.map((edu, index) => (<div key={
                            edu.id || index
                        }

                            className={
                                `item-card $ {
                                        edu.sourceId ? 'from-portfolio' : ''
                                    }

                                    `
                            }

                        > <div className="item-actions"> <button type="button" onClick={
                            () => moveArrayItem('education', index, 'up')
                        }

                        > <FiArrowUp /> </button> <button type="button" onClick={
                            () => moveArrayItem('education', index, 'down')
                        }

                        > <FiArrowDown /> </button> <button type="button" onClick={
                            () => removeArrayItem('education', index)
                        }

                        > <FiTrash2 /> </button> </div> {
                                edu.sourceId && <span className="portfolio-badge">From Portfolio</span>
                            }

                            <div className="form-grid"> <div className="form-group"> <label>Degree/Qualification</label> <input type="text"

                                value={
                                    edu.degree
                                }

                                onChange={
                                    (e) => updateArrayItem('education', index, 'degree', e.target.value)
                                }

                                placeholder="Bachelor of Science"

                            /> </div> <div className="form-group"> <label>Institution</label> <input type="text"
                                value={
                                    edu.institution
                                }

                                onChange={
                                    (e) => updateArrayItem('education', index, 'institution', e.target.value)
                                }

                                placeholder="University Name"

                            /> </div> <div className="form-group"> <label>Location</label> <input type="text"
                                value={
                                    edu.location
                                }

                                onChange={
                                    (e) => updateArrayItem('education', index, 'location', e.target.value)
                                }

                                placeholder="City, Country"

                            /> </div> <div className="form-group"> <label>Period</label> <input type="text"
                                value={
                                    edu.period
                                }

                                onChange={
                                    (e) => updateArrayItem('education', index, 'period', e.target.value)
                                }

                                placeholder="2016 - 2020"

                            /> </div> <div className="form-group full-width"> <label>Description</label> <textarea value={
                                edu.description
                            }

                                onChange={
                                    (e) => updateArrayItem('education', index, 'description', e.target.value)
                                }

                                placeholder="Relevant coursework, achievements, GPA..."
                                rows="2"
                            /> </div> </div> </div>)))
                    }

                        </div> </div>)
                }

                {
                    /* SKILLS SECTION */
                }

                {
                    activeSection === 'skills' && (<div className="section"> <div className="section-header"> <h3>Skills & Languages</h3> <div className="section-actions"> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('skills')
                        }

                    > <FiDatabase /> Add from Portfolio </button> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('languages')
                        }

                    > <FiDatabase /> Add Languages </button> </div> </div> <div className="form-grid"> <div className="form-group full-width"> <label>Skills (comma-separated)</label> <textarea value={
                        formData.skills.join(', ')
                    }

                        onChange={
                            (e) => handleSkillsChange(e.target.value)
                        }

                        placeholder="JavaScript, React, Node.js, Python, AWS..."
                        rows="3"

                    /> <p className="hint">Enter skills separated by commas or import from portfolio</p> </div> <div className="form-group full-width"> <label>Languages (comma-separated)</label> <textarea value={
                        formData.languages.join(', ')
                    }

                        onChange={
                            (e) => handleLanguagesChange(e.target.value)
                        }

                        placeholder="English (Native), German (Fluent), French (Intermediate)..."
                        rows="2"
                    /> <p className="hint">Enter languages with proficiency level or import from portfolio</p> </div> </div> </div>)
                }

                {
                    /* PROJECTS SECTION */
                }

                {
                    activeSection === 'projects' && (<div className="section"> <div className="section-header"> <h3>Projects</h3> <div className="section-actions"> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('projects')
                        }

                    > <FiDatabase /> Add from Portfolio </button> <button type="button"
                        className="btn btn-add"

                        onClick={
                            () => addArrayItem('projects', {
                                name: '',
                                description: '',
                                technologies: '',
                                url: ''
                            }

                            )
                        }

                    > <FiPlus /> Add New </button> </div> </div> <div className="items-list"> {
                        formData.projects.length === 0 ? (<p className="empty-text">No projects added yet. Add from your portfolio or create new.</p>) : (formData.projects.map((project, index) => (<div key={
                            project.id || index
                        }

                            className={
                                `item-card $ {
                                        project.sourceId ? 'from-portfolio' : ''
                                    }

                                    `
                            }

                        > <div className="item-actions"> <button type="button" onClick={
                            () => moveArrayItem('projects', index, 'up')
                        }

                        > <FiArrowUp /> </button> <button type="button" onClick={
                            () => moveArrayItem('projects', index, 'down')
                        }

                        > <FiArrowDown /> </button> <button type="button" onClick={
                            () => removeArrayItem('projects', index)
                        }

                        > <FiTrash2 /> </button> </div> {
                                project.sourceId && <span className="portfolio-badge">From Portfolio</span>
                            }

                            <div className="form-grid"> <div className="form-group"> <label>Project Name</label> <input type="text"

                                value={
                                    project.name
                                }

                                onChange={
                                    (e) => updateArrayItem('projects', index, 'name', e.target.value)
                                }

                                placeholder="Project Name"

                            /> </div> <div className="form-group"> <label>Technologies Used</label> <input type="text"
                                value={
                                    project.technologies
                                }

                                onChange={
                                    (e) => updateArrayItem('projects', index, 'technologies', e.target.value)
                                }

                                placeholder="React, Node.js, MongoDB"

                            /> </div> <div className="form-group"> <label>Project URL</label> <input type="url"
                                value={
                                    project.url
                                }

                                onChange={
                                    (e) => updateArrayItem('projects', index, 'url', e.target.value)
                                }

                                placeholder="https://github.com/..."

                            /> </div> <div className="form-group full-width"> <label>Description</label> <textarea value={
                                project.description
                            }

                                onChange={
                                    (e) => updateArrayItem('projects', index, 'description', e.target.value)
                                }

                                placeholder="Brief description of the project..."
                                rows="2"
                            /> </div> </div> </div>)))
                    }

                        </div> </div>)
                }

                {
                    /* CERTIFICATIONS SECTION */
                }

                {
                    activeSection === 'certifications' && (<div className="section"> <div className="section-header"> <h3>Certifications</h3> <div className="section-actions"> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('certifications')
                        }

                    > <FiDatabase /> Add from Portfolio </button> <button type="button"
                        className="btn btn-add"

                        onClick={
                            () => addArrayItem('certifications', {
                                name: '',
                                issuer: '',
                                date: '',
                                url: ''
                            }

                            )
                        }

                    > <FiPlus /> Add New </button> </div> </div> <div className="items-list"> {
                        formData.certifications.length === 0 ? (<p className="empty-text">No certifications added yet. Add from your portfolio or create new.</p>) : (formData.certifications.map((cert, index) => (<div key={
                            cert.id || index
                        }

                            className={
                                `item-card $ {
                                        cert.sourceId ? 'from-portfolio' : ''
                                    }

                                    `
                            }

                        > <div className="item-actions"> <button type="button" onClick={
                            () => moveArrayItem('certifications', index, 'up')
                        }

                        > <FiArrowUp /> </button> <button type="button" onClick={
                            () => moveArrayItem('certifications', index, 'down')
                        }

                        > <FiArrowDown /> </button> <button type="button" onClick={
                            () => removeArrayItem('certifications', index)
                        }

                        > <FiTrash2 /> </button> </div> {
                                cert.sourceId && <span className="portfolio-badge">From Portfolio</span>
                            }

                            <div className="form-grid"> <div className="form-group"> <label>Certification Name</label> <input type="text"

                                value={
                                    cert.name
                                }

                                onChange={
                                    (e) => updateArrayItem('certifications', index, 'name', e.target.value)
                                }

                                placeholder="AWS Certified Developer"

                            /> </div> <div className="form-group"> <label>Issuing Organization</label> <input type="text"
                                value={
                                    cert.issuer
                                }

                                onChange={
                                    (e) => updateArrayItem('certifications', index, 'issuer', e.target.value)
                                }

                                placeholder="Amazon Web Services"

                            /> </div> <div className="form-group"> <label>Date Obtained</label> <input type="text"
                                value={
                                    cert.date
                                }

                                onChange={
                                    (e) => updateArrayItem('certifications', index, 'date', e.target.value)
                                }

                                placeholder="January 2023"

                            /> </div> <div className="form-group"> <label>Credential URL</label> <input type="url"
                                value={
                                    cert.url
                                }

                                onChange={
                                    (e) => updateArrayItem('certifications', index, 'url', e.target.value)
                                }

                                placeholder="https://..."
                            /> </div> </div> </div>)))
                    }

                        </div> </div>)
                }

                {
                    /* PUBLICATIONS SECTION */
                }

                {
                    activeSection === 'publications' && (<div className="section"> <div className="section-header"> <h3>Publications</h3> <div className="section-actions"> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('publications')
                        }

                    > <FiDatabase /> Add from Portfolio </button> <button type="button"
                        className="btn btn-add"

                        onClick={
                            () => addArrayItem('publications', {
                                title: '',
                                venue: '',
                                year: '',
                                url: ''
                            }

                            )
                        }

                    > <FiPlus /> Add New </button> </div> </div> <div className="items-list"> {
                        formData.publications.length === 0 ? (<p className="empty-text">No publications added yet.</p>) : (formData.publications.map((pub, index) => (<div key={
                            pub.id || index
                        }

                            className="item-card"> <div className="item-actions"> <button type="button" onClick={
                                () => removeArrayItem('publications', index)
                            }

                            > <FiTrash2 /> </button> </div> <div className="form-grid"> <div className="form-group full-width"> <label>Title</label> <input type="text"

                                value={
                                    pub.title
                                }

                                onChange={
                                    (e) => updateArrayItem('publications', index, 'title', e.target.value)
                                }

                                placeholder="Publication Title"

                            /> </div> <div className="form-group"> <label>Venue/Journal</label> <input type="text"
                                value={
                                    pub.venue
                                }

                                onChange={
                                    (e) => updateArrayItem('publications', index, 'venue', e.target.value)
                                }

                                placeholder="Journal or Conference"

                            /> </div> <div className="form-group"> <label>Year</label> <input type="text"
                                value={
                                    pub.year
                                }

                                onChange={
                                    (e) => updateArrayItem('publications', index, 'year', e.target.value)
                                }

                                placeholder="2023"

                            /> </div> <div className="form-group"> <label>URL</label> <input type="url"
                                value={
                                    pub.url
                                }

                                onChange={
                                    (e) => updateArrayItem('publications', index, 'url', e.target.value)
                                }

                                placeholder="https://doi.org/..."
                            /> </div> </div> </div>)))
                    }

                        </div> </div>)
                }

                {
                    /* AWARDS SECTION */
                }

                {
                    activeSection === 'awards' && (<div className="section"> <div className="section-header"> <h3>Awards & Recognition</h3> <div className="section-actions"> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('awards')
                        }

                    > <FiDatabase /> Add from Portfolio </button> <button type="button"
                        className="btn btn-add"

                        onClick={
                            () => addArrayItem('awards', {
                                name: '',
                                issuer: '',
                                date: ''
                            }

                            )
                        }

                    > <FiPlus /> Add New </button> </div> </div> <div className="items-list"> {
                        formData.awards.length === 0 ? (<p className="empty-text">No awards added yet. Add from your portfolio or create new.</p>) : (formData.awards.map((award, index) => (<div key={
                            award.id || index
                        }

                            className={
                                `item-card $ {
                                        award.sourceId ? 'from-portfolio' : ''
                                    }

                                    `
                            }

                        > <div className="item-actions"> <button type="button" onClick={
                            () => moveArrayItem('awards', index, 'up')
                        }

                        > <FiArrowUp /> </button> <button type="button" onClick={
                            () => moveArrayItem('awards', index, 'down')
                        }

                        > <FiArrowDown /> </button> <button type="button" onClick={
                            () => removeArrayItem('awards', index)
                        }

                        > <FiTrash2 /> </button> </div> {
                                award.sourceId && <span className="portfolio-badge">From Portfolio</span>
                            }

                            <div className="form-grid"> <div className="form-group"> <label>Award Name</label> <input type="text"

                                value={
                                    award.name
                                }

                                onChange={
                                    (e) => updateArrayItem('awards', index, 'name', e.target.value)
                                }

                                placeholder="Award Title"

                            /> </div> <div className="form-group"> <label>Issuing Organization</label> <input type="text"
                                value={
                                    award.issuer
                                }

                                onChange={
                                    (e) => updateArrayItem('awards', index, 'issuer', e.target.value)
                                }

                                placeholder="Organization"

                            /> </div> <div className="form-group"> <label>Date</label> <input type="text"
                                value={
                                    award.date
                                }

                                onChange={
                                    (e) => updateArrayItem('awards', index, 'date', e.target.value)
                                }

                                placeholder="2023"
                            /> </div> </div> </div>)))
                    }

                        </div> </div>)
                }

                {
                    /* VOLUNTEER SECTION */
                }

                {
                    activeSection === 'volunteer' && (<div className="section"> <div className="section-header"> <h3>Volunteer Work</h3> <div className="section-actions"> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('volunteer')
                        }

                    > <FiDatabase /> Add from Portfolio </button> <button type="button"
                        className="btn btn-add"

                        onClick={
                            () => addArrayItem('volunteerWork', {
                                role: '',
                                organization: '',
                                period: '',
                                description: ''
                            }

                            )
                        }

                    > <FiPlus /> Add New </button> </div> </div> <div className="items-list"> {
                        formData.volunteerWork.length === 0 ? (<p className="empty-text">No volunteer work added yet. Add from your portfolio or create new.</p>) : (formData.volunteerWork.map((vol, index) => (<div key={
                            vol.id || index
                        }

                            className={
                                `item-card $ {
                                        vol.sourceId ? 'from-portfolio' : ''
                                    }

                                    `
                            }

                        > <div className="item-actions"> <button type="button" onClick={
                            () => moveArrayItem('volunteerWork', index, 'up')
                        }

                        > <FiArrowUp /> </button> <button type="button" onClick={
                            () => moveArrayItem('volunteerWork', index, 'down')
                        }

                        > <FiArrowDown /> </button> <button type="button" onClick={
                            () => removeArrayItem('volunteerWork', index)
                        }

                        > <FiTrash2 /> </button> </div> {
                                vol.sourceId && <span className="portfolio-badge">From Portfolio</span>
                            }

                            <div className="form-grid"> <div className="form-group"> <label>Role</label> <input type="text"

                                value={
                                    vol.role
                                }

                                onChange={
                                    (e) => updateArrayItem('volunteerWork', index, 'role', e.target.value)
                                }

                                placeholder="Volunteer Role"

                            /> </div> <div className="form-group"> <label>Organization</label> <input type="text"
                                value={
                                    vol.organization
                                }

                                onChange={
                                    (e) => updateArrayItem('volunteerWork', index, 'organization', e.target.value)
                                }

                                placeholder="Organization Name"

                            /> </div> <div className="form-group"> <label>Period</label> <input type="text"
                                value={
                                    vol.period
                                }

                                onChange={
                                    (e) => updateArrayItem('volunteerWork', index, 'period', e.target.value)
                                }

                                placeholder="2020 - Present"

                            /> </div> <div className="form-group full-width"> <label>Description</label> <textarea value={
                                vol.description
                            }

                                onChange={
                                    (e) => updateArrayItem('volunteerWork', index, 'description', e.target.value)
                                }

                                placeholder="Describe your contributions..."
                                rows="2"
                            /> </div> </div> </div>)))
                    }

                        </div> </div>)
                }

                {
                    /* REFERENCES SECTION */
                }

                {
                    activeSection === 'references' && (<div className="section"> <div className="section-header"> <h3>Professional References</h3> <div className="section-actions"> <button type="button"
                        className="btn btn-portfolio"

                        onClick={
                            () => openPicker('references')
                        }

                    > <FiDatabase /> Add from Portfolio </button> <button type="button"
                        className="btn btn-add"

                        onClick={
                            () => addArrayItem('references', {
                                name: '',
                                title: '',
                                company: '',
                                relationship: '',
                                email: '',
                                phone: '',
                                hasConsent: false
                            }

                            )
                        }

                    > <FiPlus /> Add New </button> </div> </div> <div className="items-list"> {
                        (formData.references || []).length === 0 ? (<div className="empty-text"> <p>No references added yet.</p> <p className="hint">Add professional references who can vouch for your work.</p> </div>) : (formData.references.map((ref, index) => (<div key={
                            ref.id || index
                        }

                            className={
                                `item-card $ {
                                        ref.sourceId ? 'from-portfolio' : ''
                                    }

                                    `
                            }

                        > <div className="item-actions"> <button type="button" onClick={
                            () => moveArrayItem('references', index, 'up')
                        }

                        > <FiArrowUp /> </button> <button type="button" onClick={
                            () => moveArrayItem('references', index, 'down')
                        }

                        > <FiArrowDown /> </button> <button type="button" onClick={
                            () => removeArrayItem('references', index)
                        }

                        > <FiTrash2 /> </button> </div> {
                                ref.sourceId && <span className="portfolio-badge">From Portfolio</span>
                            }

                            <div className="form-grid"> <div className="form-group"> <label>Full Name *</label> <input type="text"

                                value={
                                    ref.name
                                }

                                onChange={
                                    (e) => updateArrayItem('references', index, 'name', e.target.value)
                                }

                                placeholder="John Smith"
                                required /> </div> <div className="form-group"> <label>Job Title</label> <input type="text"

                                    value={
                                        ref.title
                                    }

                                    onChange={
                                        (e) => updateArrayItem('references', index, 'title', e.target.value)
                                    }

                                    placeholder="Senior Manager"

                                /> </div> <div className="form-group"> <label>Company</label> <input type="text"
                                    value={
                                        ref.company
                                    }

                                    onChange={
                                        (e) => updateArrayItem('references', index, 'company', e.target.value)
                                    }

                                    placeholder="Company Name"

                                /> </div> <div className="form-group"> <label>Relationship</label> <input type="text"
                                    value={
                                        ref.relationship
                                    }

                                    onChange={
                                        (e) => updateArrayItem('references', index, 'relationship', e.target.value)
                                    }

                                    placeholder="Former Supervisor"

                                /> </div> <div className="form-group"> <label>Email</label> <input type="email"
                                    value={
                                        ref.email
                                    }

                                    onChange={
                                        (e) => updateArrayItem('references', index, 'email', e.target.value)
                                    }

                                    placeholder="email@example.com"

                                /> </div> <div className="form-group"> <label>Phone</label> <input type="tel"
                                    value={
                                        ref.phone
                                    }

                                    onChange={
                                        (e) => updateArrayItem('references', index, 'phone', e.target.value)
                                    }

                                    placeholder="+1 234 567 890"

                                /> </div> <div className="form-group full-width"> <label className="checkbox-inline"> <input type="checkbox"
                                    checked={
                                        ref.hasConsent
                                    }

                                    onChange={
                                        (e) => updateArrayItem('references', index, 'hasConsent', e.target.checked)
                                    }

                                /> Has given consent to be contacted </label> </div> </div> </div>)))
                    }

                        </div> </div>)
                }

                {
                    /* SETTINGS SECTION */
                }

                {
                    activeSection === 'settings' && (<div className="section"> <h3>Visibility & Settings</h3> <div className="settings-grid"> <div className="checkbox-group"> <label> <input type="checkbox"
                        name="isPublic"

                        checked={
                            formData.isPublic
                        }

                        onChange={
                            handleChange
                        }

                    /> Make resume publicly accessible </label> <p className="hint">Anyone with the link can view this resume</p> </div> <div className="checkbox-group"> <label> <input type="checkbox"
                        name="allowDownload"

                        checked={
                            formData.allowDownload
                        }

                        onChange={
                            handleChange
                        }

                    /> Allow PDF download </label> <p className="hint">Visitors can download a PDF version</p> </div> <div className="checkbox-group"> <label> <input type="checkbox"
                        name="allowShare"

                        checked={
                            formData.allowShare
                        }

                        onChange={
                            handleChange
                        }

                    /> Allow sharing </label> <p className="hint">Visitors can share the resume link</p> </div> </div> </div>)
                }

            </form> {
                /* Portfolio Content Picker Modal */
            }

            {
                showPicker && pickerContentType && (<PortfolioContentPicker contentType={
                    pickerContentType
                }

                    onSelect={
                        handlePickerSelect
                    }

                    onClose={
                        () => {
                            setShowPicker(false);
                            setPickerContentType(null);
                        }
                    }

                    selectedIds={
                        getSelectedIds(pickerContentType)
                    }

                />)
            }

        </div> {
            /* Live Preview Panel */
        }

        {
            showPreview && (<div className={
                `preview-panel $ {
                        isPreviewMaximized ? 'maximized' : ''
                    }

                    `
            }

            > <div className="preview-toolbar"> <div className="preview-title"> <FiEye /> Live Preview </div> <div className="preview-zoom-controls"> <button className="zoom-btn"

                onClick={
                    handleZoomOut
                }

                disabled={
                    previewScale <= 0.3
                }

                title="Zoom Out"

            > − </button> <span className="zoom-level"> {
                Math.round(previewScale * 100)
            }

                    %</span> <button className="zoom-btn"

                        onClick={
                            handleZoomIn
                        }

                        disabled={
                            previewScale >= 1
                        }

                        title="Zoom In"
                    > + </button> <button className="maximize-btn"

                        onClick={
                            togglePreviewMaximize
                        }

                        title={
                            isPreviewMaximized ? 'Minimize' : 'Maximize'
                        }

                    > {
                        isPreviewMaximized ? <FiMinimize2 /> : <FiMaximize2 />
                    }

                </button> </div> </div> <LiveResumePreview formData={
                    formData
                }

                    scale={
                        previewScale
                    }

                /> </div>)
        }

    </div>);
}

    ;

export default ResumeEditor;