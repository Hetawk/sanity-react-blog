import React, { useState, useEffect } from 'react';
import { FiUpload, FiTrash2, FiCheckCircle, FiFile } from 'react-icons/fi';
import { client } from '../../../client';
import { useAuth } from '../../../context/AuthContext';

const ResumeManager = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState('');
    const { authClient, logout } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file: null,
        fileName: ''
    });

    // Fetch resumes
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const query = '*[_type == "resume"] | order(uploadedAt desc)';
                const data = await client.fetch(query);
                setResumes(data);
            } catch (error) {
                console.error('Error fetching resumes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();
    }, []);

    // Simulate progress updates during upload
    const simulateProgress = () => {
        // Start at 10% immediately to show activity
        setUploadProgress(10);

        // Create a timer that increments progress
        const timer = setInterval(() => {
            setUploadProgress((prevProgress) => {
                // Increase by random amount between 5-15%
                const increment = Math.floor(Math.random() * 10) + 5;
                const nextProgress = Math.min(prevProgress + increment, 90);

                // Cap at 90% until we confirm completion
                return nextProgress;
            });
        }, 800); // Update every 800ms

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

        if (!file) {
            return;
        }

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

        // Make sure we have an authenticated client
        if (!authClient) {
            setUploadError('Authentication error. Please log out and log in again.');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadProgress(0);

        // Start progress simulation
        const progressTimer = simulateProgress();

        try {
            console.log('Starting file upload with authenticated client...');

            // Upload file to Sanity using the authenticated client
            const fileAsset = await authClient.assets.upload('file', formData.file, {
                filename: formData.fileName,
                contentType: 'application/pdf'
            });

            console.log('File uploaded successfully, creating document...');

            // Create resume document with the authenticated client
            const resumeDoc = {
                _type: 'resume',
                title: formData.title,
                description: formData.description || 'Resume',
                isActive: resumes.length === 0, // Make active if it's the first resume
                resumeFile: {
                    _type: 'file',
                    asset: {
                        _type: 'reference',
                        _ref: fileAsset._id
                    }
                },
                uploadedAt: new Date().toISOString()
            };

            const newResume = await authClient.create(resumeDoc);
            console.log('Resume document created:', newResume);

            // Update the UI
            setResumes([newResume, ...resumes]);

            // Complete the progress bar
            clearInterval(progressTimer);
            setUploadProgress(100);

            // Reset form after a short delay to show completion
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
        } catch (error) {
            console.error('Error uploading resume:', error);
            clearInterval(progressTimer);
            setUploadProgress(0);

            if (error.message.includes('network')) {
                setUploadError('Network error. Please check your internet connection.');
            } else if (error.message.includes('permission') || error.statusCode === 403) {
                setUploadError('Permission denied. Your session may have expired.');
                // Force logout if we get a permission error
                setTimeout(() => logout(), 3000);
            } else {
                setUploadError(`Upload failed: ${error.message || 'Unknown error'}`);
            }

            setUploading(false);
        }
    };

    // Set resume as active
    const handleSetActive = async (resumeId) => {
        if (!authClient) {
            setUploadError('Authentication error. Please log out and log in again.');
            return;
        }

        try {
            // First, set all resumes as inactive
            const batch = authClient.batch();

            resumes.forEach((resume) => {
                if (resume._id !== resumeId) {
                    batch.patch(resume._id, {
                        set: { isActive: false }
                    });
                }
            });

            // Set the selected resume as active
            batch.patch(resumeId, {
                set: { isActive: true }
            });

            await batch.commit();

            // Update local state
            const updatedResumes = resumes.map((resume) => ({
                ...resume,
                isActive: resume._id === resumeId
            }));

            setResumes(updatedResumes);

            alert('Resume set as active successfully!');
        } catch (error) {
            console.error('Error setting resume as active:', error);
            if (error.statusCode === 403) {
                setUploadError('Permission denied. Your session may have expired.');
                setTimeout(() => logout(), 3000);
            } else {
                alert('Failed to set resume as active. Please try again.');
            }
        }
    };

    // Delete resume
    const handleDelete = async (resumeId, isActive) => {
        if (!authClient) {
            setUploadError('Authentication error. Please log out and log in again.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await authClient.delete(resumeId);

                const updatedResumes = resumes.filter((resume) => resume._id !== resumeId);

                // If the deleted resume was active, set the most recent one as active
                if (isActive && updatedResumes.length > 0) {
                    const mostRecentResume = updatedResumes[0];
                    await authClient.patch(mostRecentResume._id).set({ isActive: true }).commit();

                    updatedResumes[0].isActive = true;
                }

                setResumes(updatedResumes);

                alert('Resume deleted successfully!');
            } catch (error) {
                console.error('Error deleting resume:', error);
                if (error.statusCode === 403) {
                    setUploadError('Permission denied. Your session may have expired.');
                    setTimeout(() => logout(), 3000);
                } else {
                    alert('Failed to delete resume. Please try again.');
                }
            }
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
                            placeholder="e.g. Technical Resume 2023"
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
                            <div key={resume._id} className={`resume-item ${resume.isActive ? 'active' : ''}`}>
                                <div className="resume-content">
                                    <div className="resume-icon">
                                        <FiFile />
                                    </div>
                                    <div className="resume-details">
                                        <h3>{resume.title}</h3>
                                        <p>{resume.description}</p>
                                        <p className="upload-date">
                                            Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
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
                                            onClick={() => handleSetActive(resume._id)}
                                        >
                                            Set as Active
                                        </button>
                                    )}

                                    <a
                                        href={resume.resumeFile?.asset?.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="view-btn"
                                    >
                                        View
                                    </a>

                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(resume._id, resume.isActive)}
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