import React, { useState, useEffect } from 'react';
import { FiUpload, FiTrash2, FiCheckCircle, FiFile } from 'react-icons/fi';
import apiClient from '../../../api/client';

const ResumeManager = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file: null,
        fileName: ''
    });

    // Fetch resumes from MySQL API
    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const response = await apiClient.get('/resumes');
            if (response.data.success) {
                setResumes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching resumes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Simulate progress updates during upload
    const simulateProgress = () => {
        setUploadProgress(10);
        const timer = setInterval(() => {
            setUploadProgress((prev) => {
                const increment = Math.floor(Math.random() * 10) + 5;
                return Math.min(prev + increment, 90);
            });
        }, 800);
        return timer;
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setUploadError('');
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setUploadError('');

        if (!file) return;

        if (file.type !== 'application/pdf') {
            setUploadError('Please select a PDF file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size must be less than 10MB');
            return;
        }

        setFormData({
            ...formData,
            file,
            fileName: file.name
        });
    };

    // Handle resume upload
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setUploadError('Please enter a title for the resume');
            return;
        }

        if (!formData.file) {
            setUploadError('Please select a PDF file to upload');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadProgress(0);

        const progressTimer = simulateProgress();

        try {
            const uploadData = new FormData();
            uploadData.append('file', formData.file);
            uploadData.append('title', formData.title);
            uploadData.append('description', formData.description || '');
            uploadData.append('isActive', resumes.length === 0);

            const response = await apiClient.post('/resumes/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                await fetchResumes();

                clearInterval(progressTimer);
                setUploadProgress(100);

                setTimeout(() => {
                    setFormData({
                        title: '',
                        description: '',
                        file: null,
                        fileName: ''
                    });
                    setUploading(false);
                    setUploadProgress(0);
                    alert('Resume uploaded successfully!');
                }, 1000);
            }
        } catch (error) {
            console.error('Error uploading resume:', error);
            clearInterval(progressTimer);
            setUploadProgress(0);
            setUploadError(`Upload failed: ${error.response?.data?.error || error.message || 'Unknown error'}`);
            setUploading(false);
        }
    };

    // Set resume as active
    const handleSetActive = async (resumeId) => {
        try {
            const response = await apiClient.patch(`/resumes/${resumeId}`, {
                isActive: true
            });

            if (response.data.success) {
                await fetchResumes();
                alert('Resume set as active successfully!');
            }
        } catch (error) {
            console.error('Error setting resume as active:', error);
            alert(`Failed to set resume as active: ${error.response?.data?.error || error.message}`);
        }
    };

    // Delete resume
    const handleDelete = async (resumeId) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                const response = await apiClient.delete(`/resumes/${resumeId}`);

                if (response.data.success) {
                    await fetchResumes();
                    alert('Resume deleted successfully!');
                }
            } catch (error) {
                console.error('Error deleting resume:', error);
                alert(`Failed to delete resume: ${error.response?.data?.error || error.message}`);
            }
        }
    };

    // Handle file download
    const handleDownload = (fileUrl) => {
        try {
            const fullUrl = fileUrl.startsWith('http')
                ? fileUrl
                : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${fileUrl}`;

            window.open(fullUrl, '_blank');
        } catch (error) {
            console.error("Failed to download the file:", error);
            alert("Failed to download the resume. Please try again.");
        }
    };

    if (loading) return <div>Loading resumes...</div>;

    return (
        <div className="content-manager resume-manager">
            <div className="upload-section">
                <h2>Upload New Resume</h2>
                <form onSubmit={handleUpload}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Technical Resume 2024"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of this resume version"
                        />
                    </div>

                    <div className="form-group file-upload">
                        <label>Resume PDF File</label>
                        <div className="file-input-container">
                            <input
                                type="file"
                                id="resume-file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            <label htmlFor="resume-file" className="file-input-label">
                                <FiUpload />
                                <span>{formData.fileName || 'Choose PDF file'}</span>
                            </label>
                        </div>
                    </div>

                    {uploadError && (
                        <div className="error-message">
                            {uploadError}
                        </div>
                    )}

                    {uploading && (
                        <div className="upload-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <div className="progress-text">
                                {uploadProgress < 100
                                    ? `Uploading: ${uploadProgress}%`
                                    : 'Upload complete!'}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="upload-btn"
                        disabled={uploading || !formData.file}
                    >
                        {uploading ? 'Uploading...' : 'Upload Resume'}
                    </button>
                </form>
            </div>

            <div className="resume-list">
                <h2>Uploaded Resumes</h2>
                {resumes.length === 0 ? (
                    <p className="no-resumes">No resumes uploaded yet.</p>
                ) : (
                    <div className="resume-items">
                        {resumes.map((resume) => (
                            <div key={resume.id} className={`resume-item ${resume.isActive ? 'active' : ''}`}>
                                <div className="resume-content">
                                    <div className="resume-icon">
                                        <FiFile />
                                    </div>
                                    <div className="resume-details">
                                        <h3>{resume.title}</h3>
                                        <p>{resume.description}</p>
                                        <p className="upload-date">
                                            Uploaded: {new Date(resume.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="resume-actions">
                                    {resume.isActive ? (
                                        <span className="active-badge">
                                            <FiCheckCircle /> Active
                                        </span>
                                    ) : (
                                        <button
                                            className="set-active-btn"
                                            onClick={() => handleSetActive(resume.id)}
                                        >
                                            Set as Active
                                        </button>
                                    )}

                                    {resume.fileUrl ? (
                                        <button
                                            onClick={() => handleDownload(resume.fileUrl)}
                                            className="view-btn"
                                        >
                                            View
                                        </button>
                                    ) : (
                                        <button
                                            className="view-btn disabled"
                                            disabled
                                            title="File URL not available"
                                        >
                                            View
                                        </button>
                                    )}

                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(resume.id)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeManager;
