import React, { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import './ResumeDownload.scss';
import apiClient from '../../api/client';

const ResumeDownload = ({ location = 'home' }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [uploadedResume, setUploadedResume] = useState(null);
    const [shouldDisplay, setShouldDisplay] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch data from MySQL API on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch all resumes from MySQL
                const response = await apiClient.get('/resumes');

                if (!response.data.success || response.data.count === 0) {
                    setErrorMessage('No resume documents found in the database');
                    setIsLoading(false);
                    return;
                }

                const allResumes = response.data.data;

                // Find active resume or use most recent
                const activeResume = allResumes.find(resume => resume.isActive);
                const resumeToUse = activeResume || allResumes[0];

                if (resumeToUse) {
                    setUploadedResume(resumeToUse);
                    // Always display for now (you can add display location logic later)
                    setShouldDisplay(true);
                } else {
                    setErrorMessage('No resumes available');
                }
            } catch (error) {
                console.error('Error fetching resumes:', error);
                setErrorMessage(`Error: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [location]);

    const handleDownload = () => {
        try {
            if (uploadedResume && uploadedResume.fileUrl) {
                // Open the PDF file URL from MySQL database
                window.open(uploadedResume.fileUrl, '_blank');
                return;
            }

            throw new Error('Resume file not properly linked');

        } catch (error) {
            console.error('Error downloading resume:', error);
            alert(`Unable to download resume: ${error.message}. Please try again later.`);
        }
    };

    // Only display if we should AND we have a resume OR we're still loading
    if (!shouldDisplay || (!uploadedResume && !isLoading)) {
        return null;
    }

    return (
        <div className="resume-download-container">
            {errorMessage ? (
                <div className="resume-error">{errorMessage}</div>
            ) : (
                <button
                    className="resume-download-btn"
                    onClick={handleDownload}
                    disabled={isLoading || !uploadedResume}
                >
                    {isLoading ? (
                        <span className="loading">Loading resume...</span>
                    ) : (
                        <>
                            <div className="icon-wrapper">
                                <FaDownload className="download-icon" />
                            </div>
                            <span className="btn-text">Download Resume</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default ResumeDownload;