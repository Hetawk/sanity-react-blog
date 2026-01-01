import React,
    {
    useState,
    useEffect
}

from 'react';

import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiEye,
    FiDownload,
    FiShare2,
    FiCheck,
    FiX,
    FiCopy,
    FiExternalLink
}

from 'react-icons/fi';
import api from '../../../api/client';
import ResumeEditor from './ResumeEditor';

import {
    useToast
}

from '../../../components/Toast/Toast';
import './ResumeManagerV2.scss';
import './ResumeEditor.scss';

/**
 * Advanced Resume Manager V2
 * Supports multiple countries, resume types, and templates
 * Full CRUD operations with publishing and sharing capabilities
 */
const ResumeManagerV2=()=> {
    const toast=useToast();

    // State Management
    const [activeTab,
    setActiveTab]=useState('resumes'); // resumes, templates, countries
    const [resumes,
    setResumes]=useState([]);
    const [templates,
    setTemplates]=useState([]);
    const [countries,
    setCountries]=useState([]);
    const [resumeTypes,
    setResumeTypes]=useState([]);

    const [loading,
    setLoading]=useState(true);
    const [editingResume,
    setEditingResume]=useState(null); // Changed from editingId to full resume object
    const [showForm,
    setShowForm]=useState(false);
    const [viewMode,
    setViewMode]=useState('list'); // list, editor

    // Form State
    const [formData,
    setFormData]=useState( {
            title: '',
            description: '',
            templateId: '',
            countryId: '',
            typeId: '',
            fullName: '',
            email: '',
            phone: '',
            location: '',
            summary: '',
            linkedinUrl: '',
            portfolioUrl: '',
            githubUrl: '',
            isPublic: false,
            allowDownload: true,
            allowShare: true
        }

    );

    // Load initial data
    useEffect(()=> {
            loadAllData();
        }

        , []);

    const loadAllData=async ()=> {
        try {
            setLoading(true);

            const [resumesRes,
            templatesRes,
            countriesRes,
            typesRes]=await Promise.all([api.resumesV2.getAll( {
                        skip: 0, take: 50
                    }

                ),
                api.resumesV2.templates.getAll( {
                        activeOnly: true, take: 100
                    }

                ),
                api.resumesV2.countries.getAll(true),
                api.resumesV2.types.getAll()]);

            setResumes(resumesRes.data || []);
            setTemplates(templatesRes.data || []);
            setCountries(countriesRes.data || []);
            setResumeTypes(typesRes.data || []);
        }

        catch (error) {
            console.error('Failed to load data:', error);

            toast.error(`Failed to load resume data: ${error.message || 'Unknown error'}. Please make sure the server is running.`);
        }

        finally {
            setLoading(false);
        }
    }

    ;

    // Handle Form Change
    const handleChange=(e)=> {
        const {
            name,
            value,
            type,
            checked
        }

        =e.target;

        setFormData( {
                ...formData,
                [name]: type==='checkbox'? checked : value
            }

        );
    }

    ;

    // Create Resume
    const handleCreateResume=async (e)=> {
        e.preventDefault();

        // Validation
        if ( !formData.title || formData.title.trim()==='') {
            toast.error('Resume title is required');
            return;
        }

        if ( !formData.templateId) {
            toast.error('Please select a template');
            return;
        }

        if ( !formData.countryId) {
            toast.error('Please select a country');
            return;
        }

        if ( !formData.typeId) {
            toast.error('Please select a resume type');
            return;
        }

        if ( !formData.fullName || formData.fullName.trim()==='') {
            toast.error('Full name is required');
            return;
        }

        // Check if at least one contact method is provided
        const hasContactMethod=formData.email || formData.phone || formData.linkedinUrl || formData.portfolioUrl || formData.githubUrl;

        if ( !hasContactMethod) {
            toast.error('At least one contact method (email, phone, or social link) is required');
            return;
        }

        // Email validation if provided
        if (formData.email && formData.email.trim() !=='') {
            const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if ( !emailRegex.test(formData.email)) {
                toast.error('Please enter a valid email address');
                return;
            }
        }

        try {
            await api.resumesV2.create(formData);
            toast.success('Resume created successfully!');

            setFormData( {
                    title: '',
                    description: '',
                    templateId: '',
                    countryId: '',
                    typeId: '',
                    fullName: '',
                    email: '',
                    phone: '',
                    location: '',
                    summary: '',
                    linkedinUrl: '',
                    portfolioUrl: '',
                    githubUrl: '',
                    isPublic: false,
                    allowDownload: true,
                    allowShare: true
                }

            );
            setShowForm(false);
            await loadAllData();
        }

        catch (error) {
            console.error('Failed to create resume:', error);

            toast.error(`Failed to create resume: ${error.message || 'Please try again'}`);
        }
    }

    ;

    // Update Resume
    const handleUpdateResume=async (data)=> {
        if ( !editingResume) return;

        // Validation
        if ( !data.title || data.title.trim()==='') {
            toast.error('Resume title is required');
            return;
        }

        if ( !data.fullName || data.fullName.trim()==='') {
            toast.error('Full name is required');
            return;
        }

        // Check if at least one contact method is provided
        const hasContactMethod=data.email || data.phone || data.linkedinUrl || data.portfolioUrl || data.githubUrl || data.githubCompanyUrl;

        if ( !hasContactMethod) {
            toast.error('At least one contact method (email, phone, or social link) is required');
            return;
        }

        // Email validation if provided
        if (data.email && data.email.trim() !=='') {
            const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if ( !emailRegex.test(data.email)) {
                toast.error('Please enter a valid email address');
                return;
            }
        }

        try {
            await api.resumesV2.update(editingResume.id, data);
            toast.success('Resume saved successfully!');
            setEditingResume(null);
            setViewMode('list');
            await loadAllData();
        }

        catch (error) {
            console.error('Failed to update resume:', error);

            toast.error(`Failed to save resume: ${error.message || 'Please try again'}`);
        }
    }

    ;

    // Edit Resume - Fetch full data and open editor
    const handleEditResume = async (resume) => {
        try {
            // Fetch full resume data by ID (not slug which uses public endpoint)
            const fullResume = await api.resumesV2.getById(resume.id);
            setEditingResume(fullResume.data || fullResume);
            setViewMode('editor');
        } catch (error) {
            console.error('Failed to load resume for editing:', error);
            // Fallback to using the resume from list
            setEditingResume(resume);
            setViewMode('editor');
        }
    };

    // Cancel editing
    const handleCancelEdit=()=> {
        setEditingResume(null);
        setViewMode('list');
    }

    ;

    // Copy shareable link
    const handleCopyShareableLink = (resume) => {
        const shareUrl = resume.shareableLink 
            ? `${window.location.origin}/share/${resume.shareableLink}` 
            : `${window.location.origin}/resume/${resume.slug}`;

        navigator.clipboard.writeText(shareUrl).then(() => toast.success('Link copied to clipboard!')).catch(() => toast.error('Failed to copy link'));
    }

    ;

    // Open resume in new tab
    const handleViewResume = (resume) => {
        // Use the slug for public resumes, otherwise use the ID with view-pdf endpoint
        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

        const url = resume.slug && resume.isPublic 
            ? `/resume/${resume.slug}` 
            : `${backendUrl}/api/resumes-v2/${resume.id}/view-pdf`;
        window.open(url, '_blank');
    };

    // Delete Resume
    const handleDeleteResume=async (id)=> {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await api.resumesV2.delete(id);
                toast.success('Resume deleted successfully!');
                await loadAllData();
            }

            catch (error) {
                console.error('Failed to delete resume:', error);

                toast.error(`Failed to delete resume: ${error.message || 'Please try again'}`);
            }
        }
    }

    ;

    // Publish Resume
    const handlePublishResume=async (id)=> {
        try {
            await api.resumesV2.publish(id);
            toast.success('Resume published!');
            await loadAllData();
        }

        catch (error) {
            console.error('Failed to publish resume:', error);

            toast.error(`Failed to publish resume: ${error.message || 'Please try again'}`);
        }
    }

    ;

    // Make Public
    const handleMakePublic=async (id)=> {
        try {
            await api.resumesV2.makePublic(id);
            toast.success('Resume is now public!');
            await loadAllData();
        }

        catch (error) {
            console.error('Failed to make resume public:', error);

            toast.error(`Failed to make resume public: ${error.message || 'Please try again'}`);
        }
    }

    ;

    // Clone Resume
    const handleCloneResume=async (id)=> {
        const newTitle=prompt('Enter a name for the cloned resume:');
        if ( !newTitle) return;

        try {
            await api.resumesV2.clone(id, newTitle);
            toast.success('Resume cloned successfully!');
            await loadAllData();
        }

        catch (error) {
            console.error('Failed to clone resume:', error);

            toast.error(`Failed to clone resume: ${error.message || 'Please try again'}`);
        }
    }

    ;

    // View Resume as PDF
    const handleViewPdf=(resumeId)=> {
        try {
            // Use backend URL directly since window.open bypasses React proxy
            const backendUrl=process.env.REACT_APP_API_URL || 'http://localhost:5001';

            window.open(`${backendUrl}/api/resumes-v2/${resumeId}/view-pdf`, '_blank');
        }

        catch (error) {
            console.error('Failed to view PDF:', error);

            toast.error(`Failed to view PDF: ${error.message || 'Please try again'}`);
        }
    }

    ;

    if (loading) {
        return <div className="resume-manager-v2"><p>Loading...</p></div>;
    }

    // Show Resume Editor if editing
    if (viewMode==='editor'&& editingResume) {
        return (<div className="resume-manager-v2"> <ResumeEditor resume= {
                editingResume
            }

            onSave= {
                handleUpdateResume
            }

            onCancel= {
                handleCancelEdit
            }

            /> </div>);
    }

    return (<div className="resume-manager-v2"> {
            /* Tab Navigation */
        }

        <div className="tabs"> <button className={`tab-btn ${activeTab==='resumes'? 'active' : ''}`}

        onClick= {
            ()=> setActiveTab('resumes')
        }

        > 📄 Resumes ( {
                resumes.length
            }

        ) </button> <button className={`tab-btn ${activeTab==='templates'? 'active' : ''}`}

        onClick= {
            ()=> setActiveTab('templates')
        }

        > 🎨 Templates ( {
                templates.length
            }

        ) </button> <button className={`tab-btn ${activeTab==='countries'? 'active' : ''}`}

        onClick= {
            ()=> setActiveTab('countries')
        }

        > 🌍 Countries ( {
                countries.length
            }

        ) </button> </div> {
            /* RESUMES TAB */
        }

            {
            activeTab==='resumes'&& (<div className="tab-content"> <div className="section-header"> <h2>My Resumes</h2> <button className="btn btn-primary"

                onClick= {
                    ()=> setShowForm( !showForm)
                }

                > <FiPlus /> Create New Resume </button> </div> {
                    /* Create Form */
                }

                    {
                    showForm && (<div className="form-section"> <h3>Create New Resume</h3> <form onSubmit= {
                            handleCreateResume
                        }

                        > <div className="form-grid"> <div className="form-group"> <label>Title *</label> <input type="text"
                        name="title"

                        value= {
                            formData.title
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="e.g., Senior Developer Resume"
                        required /> </div> <div className="form-group"> <label>Description</label> <input type="text"
                        name="description"

                        value= {
                            formData.description
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="Brief description"

                        /> </div> <div className="form-group"> <label>Template *</label> <select name="templateId"
                        value= {
                            formData.templateId
                        }

                        onChange= {
                            handleChange
                        }

                        required > <option value="">Select Template</option> {
                            templates.map(t=> (<option key= {
                                        t.id
                                    }

                                    value= {
                                        t.id
                                    }

                                    > {
                                        t.name
                                    }

                                    ( {
                                            t.country?.name
                                        }

                                    ) </option>))
                        }

                        </select> </div> <div className="form-group"> <label>Country *</label> <select name="countryId"

                        value= {
                            formData.countryId
                        }

                        onChange= {
                            handleChange
                        }

                        required > <option value="">Select Country</option> {
                            countries.map(c=> (<option key= {
                                        c.id
                                    }

                                    value= {
                                        c.id
                                    }

                                    > {
                                        c.name
                                    }

                                    ( {
                                            c.code
                                        }

                                    ) </option>))
                        }

                        </select> </div> <div className="form-group"> <label>Type *</label> <select name="typeId"

                        value= {
                            formData.typeId
                        }

                        onChange= {
                            handleChange
                        }

                        required > <option value="">Select Type</option> {
                            resumeTypes.map(t=> (<option key= {
                                        t.id
                                    }

                                    value= {
                                        t.id
                                    }

                                    > {
                                        t.name
                                    }

                                    </option>))
                        }

                        </select> </div> <div className="form-group"> <label>Full Name</label> <input type="text"
                        name="fullName"

                        value= {
                            formData.fullName
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="Your full name"
                        /> </div> <div className="form-group"> <label>Email</label> <input type="email"
                        name="email"

                        value= {
                            formData.email
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="Email address"
                        /> </div> <div className="form-group"> <label>Phone</label> <input type="tel"
                        name="phone"

                        value= {
                            formData.phone
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="Phone number"
                        /> </div> <div className="form-group"> <label>Location</label> <input type="text"
                        name="location"

                        value= {
                            formData.location
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="City, Country"

                        /> </div> <div className="form-group full-width"> <label>Summary</label> <textarea name="summary"
                        value= {
                            formData.summary
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="Professional summary"
                        rows="3"
                        /> </div> <div className="form-group"> <label>LinkedIn URL</label> <input type="url"
                        name="linkedinUrl"

                        value= {
                            formData.linkedinUrl
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="https://linkedin.com/in/..."
                        /> </div> <div className="form-group"> <label>Portfolio URL</label> <input type="url"
                        name="portfolioUrl"

                        value= {
                            formData.portfolioUrl
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="Your portfolio link"
                        /> </div> <div className="form-group"> <label>GitHub URL</label> <input type="url"
                        name="githubUrl"

                        value= {
                            formData.githubUrl
                        }

                        onChange= {
                            handleChange
                        }

                        placeholder="https://github.com/..."
                        /> </div> <div className="form-group checkbox"> <label> <input type="checkbox"
                        name="isPublic"

                        checked= {
                            formData.isPublic
                        }

                        onChange= {
                            handleChange
                        }

                        /> Make Public </label> </div> <div className="form-group checkbox"> <label> <input type="checkbox"
                        name="allowDownload"

                        checked= {
                            formData.allowDownload
                        }

                        onChange= {
                            handleChange
                        }

                        /> Allow Download </label> </div> <div className="form-group checkbox"> <label> <input type="checkbox"
                        name="allowShare"

                        checked= {
                            formData.allowShare
                        }

                        onChange= {
                            handleChange
                        }

                        /> Allow Share </label> </div> </div> <div className="form-actions"> <button type="submit"className="btn btn-primary"> Create Resume </button> <button type="button"
                        className="btn btn-secondary"

                        onClick= {
                            ()=> setShowForm(false)
                        }

                        > Cancel </button> </div> </form> </div>)
                }

                    {
                    /* Resumes List */
                }

                <div className="resumes-list"> {
                    resumes.length===0 ? (<p className="empty-state">No resumes created yet. Create your first resume !</p>) : (<div className="grid"> {
                            resumes.map(resume=> (<div key= {
                                        resume.id
                                    }

                                    className="resume-card"> <div className="card-header"> <h3> {
                                        resume.title
                                    }

                                    </h3> <span className={`badge ${resume.isPublished ? 'published' : 'draft'}`}

                                    > {
                                        resume.isPublished ? 'Published' : 'Draft'
                                    }

                                    </span> </div> <div className="card-body"> <p className="description"> {
                                        resume.description
                                    }

                                    </p> <div className="meta"> <span>📍 {
                                        resume.country?.name
                                    }

                                    </span> <span>📋 {
                                        resume.type?.name
                                    }

                                    </span> <span>🎨 {
                                        resume.template?.name
                                    }

                                    </span> </div> {
                                        resume.fullName && <p><strong> {
                                            resume.fullName
                                        }

                                        </strong></p>
                                    }

                                    <div className="stats"> <span><FiEye /> {
                                        resume.views
                                    }

                                    views</span> <span><FiDownload /> {
                                        resume.downloads
                                    }

                                    downloads</span> <span><FiShare2 /> {
                                        resume.shares
                                    }

                                    shares</span> </div> </div> <div className="card-actions"> <button className="btn-action view"
                                    title="View Resume"

                                    onClick= {
                                        ()=> handleViewResume(resume)
                                    }

                                    > <FiExternalLink /> </button> <button className="btn-action"title="View as PDF"

                                    onClick= {
                                        ()=> handleViewPdf(resume.id)
                                    }

                                    > 📄 </button> <button className="btn-action"title="Edit"

                                    onClick= {
                                        ()=> handleEditResume(resume)
                                    }

                                    > <FiEdit2 /> </button> {
                                         !resume.isPublished && (<button className="btn-action publish"
                                            title="Publish"

                                            onClick= {
                                                ()=> handlePublishResume(resume.id)
                                            }

                                            > <FiCheck /> </button>)
                                    }

                                        {
                                         !resume.isPublic && (<button className="btn-action public"
                                            title="Make Public"

                                            onClick= {
                                                ()=> handleMakePublic(resume.id)
                                            }

                                            > <FiShare2 /> </button>)
                                    }

                                    <button className="btn-action copy"
                                    title="Copy Link"

                                    onClick= {
                                        ()=> handleCopyShareableLink(resume)
                                    }

                                    > <FiCopy /> </button> <button className="btn-action clone"
                                    title="Clone"

                                    onClick= {
                                        ()=> handleCloneResume(resume.id)
                                    }

                                    > 📋 </button> <button className="btn-action delete"
                                    title="Delete"

                                    onClick= {
                                        ()=> handleDeleteResume(resume.id)
                                    }

                                    > <FiTrash2 /> </button> </div> </div>))
                        }

                        </div>)
                }

                </div> </div>)
        }

            {
            /* TEMPLATES TAB */
        }

            {
            activeTab==='templates'&& (<div className="tab-content"> <div className="section-header"> <h2>Resume Templates</h2> </div> <div className="templates-list"> {
                    templates.length===0 ? (<p className="empty-state">No templates available</p>) : (<div className="grid"> {
                            templates.map(template=> (<div key= {
                                        template.id
                                    }

                                    className="template-card"> {
                                        template.thumbnail && (<img src= {
                                                template.thumbnail
                                            }

                                            alt= {
                                                template.name
                                            }

                                            className="thumbnail"/>)
                                    }

                                    <h3> {
                                        template.name
                                    }

                                    </h3> <p> {
                                        template.description
                                    }

                                    </p> <div className="template-info"> <span>🌍 {
                                        template.country?.name
                                    }

                                    </span> <span>📋 {
                                        template.type?.name
                                    }

                                    </span> </div> </div>))
                        }

                        </div>)
                }

                </div> </div>)
        }

            {
            /* COUNTRIES TAB */
        }

            {
            activeTab==='countries'&& (<div className="tab-content"> <div className="section-header"> <h2>Resume Countries</h2> </div> <div className="countries-list"> {
                    countries.length===0 ? (<p className="empty-state">No countries configured</p>) : (<div className="grid"> {
                            countries.map(country=> (<div key= {
                                        country.id
                                    }

                                    className="country-card"> <h3> {
                                        country.name
                                    }

                                    </h3> <p className="code"> {
                                        country.code
                                    }

                                    </p> <p className="description"> {
                                        country.description
                                    }

                                    </p> {
                                        country.preferredLength && (<p className="meta">📄 Preferred: {
                                                country.preferredLength
                                            }

                                            page(s)</p>)
                                    }

                                        {
                                        country.dateFormat && (<p className="meta">📅 Date Format: {
                                                country.dateFormat
                                            }

                                            </p>)
                                    }

                                    <p className="template-count"> {
                                        country.templates.length
                                    }

                                    template(s) </p> </div>))
                        }

                        </div>)
                }

                </div> </div>)
        }

        </div>);
}

;

export default ResumeManagerV2;