import React, { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import './ResumeDownload.scss';
import { client } from '../../client';

const ResumeDownload = ({ location = 'home' }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [uploadedResume, setUploadedResume] = useState(null);
    const [shouldDisplay, setShouldDisplay] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch data from Sanity on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Check if ANY resumes exist
                const allResumesQuery = '*[_type == "resume"]';
                const allResumes = await client.fetch(allResumesQuery);

                if (allResumes.length === 0) {
                    setErrorMessage('No resume documents found in the database');
                    return;
                }

                // Get display location preference
                const configQuery = '*[_type == "resumeConfig"][0]';
                const configData = await client.fetch(configQuery);

                // Check for an active resume
                const activeResumeQuery = '*[_type == "resume" && isActive == true][0]';
                const activeResume = await client.fetch(activeResumeQuery);

                // When setting the uploaded resume, get the full document with file URL
                if (activeResume) {
                    // Enhance the active resume with the file URL
                    const resumeWithUrl = await client.fetch(
                        `*[_type == "resume" && _id == $resumeId][0]{
                            ...,
                            "fileUrl": resumeFile.asset->url
                        }`,
                        { resumeId: activeResume._id }
                    );

                    setUploadedResume(resumeWithUrl);
                } else if (allResumes.length > 0) {
                    // Same for most recent resume fallback
                    const resumeWithUrl = await client.fetch(
                        `*[_type == "resume" && _id == $resumeId][0]{
                            ...,
                            "fileUrl": resumeFile.asset->url
                        }`,
                        { resumeId: allResumes[0]._id }
                    );

                    setUploadedResume(resumeWithUrl);
                }

                if (!activeResume && allResumes.length === 0) {
                    setErrorMessage('No resumes available');
                    return;
                }

                // Determine if we should display based on location
                if (configData) {
                    setShouldDisplay(configData.displayLocation === location);
                } else {
                    setShouldDisplay(location === 'home'); // Default
                }
            } catch (error) {
                setErrorMessage(`Error: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [location]);

    const handleDownload = () => {
        try {
            // First, try to use the fileUrl that we fetched directly
            if (uploadedResume && uploadedResume.fileUrl) {
                window.open(uploadedResume.fileUrl, '_blank');
                return;
            }

            // If that fails, try to construct a URL from Sanity's CDN format
            if (uploadedResume && uploadedResume.resumeFile?.asset?._ref) {
                // Get the Sanity project ID and dataset from environment or client config
                const projectId = client.config().projectId;
                const dataset = client.config().dataset;

                if (!projectId || !dataset) {
                    throw new Error("Missing Sanity project ID or dataset");
                }

                const assetId = uploadedResume.resumeFile.asset._ref;
                // Extract just the ID part from the reference, removing "file-" prefix and "-pdf" suffix
                const cleanId = assetId.replace(/^file-/, '').replace(/-pdf$/, '');

                // Construct the URL using Sanity's CDN pattern
                const url = `https://cdn.sanity.io/files/${projectId}/${dataset}/${cleanId}.pdf`;
                window.open(url, '_blank');
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
                        <span className="download">
                            <FaDownload className="download-icon" />
                            Download Resume
                        </span>
                    )}
                </button>
            )}
        </div>
    );
};

export default ResumeDownload;