import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiDownload, FiShare2, FiLock } from 'react-icons/fi';
import api from '../api/client';
import './PublicResumeViewer.scss';

/**
 * Public Resume Viewer
 * Accessible via shareable links or slug
 * Displays resume in template format with sharing and download options
 */
const PublicResumeViewer = () => {
    const {
        resumeSlug,
        shareableLink
    }

        = useParams();
    const [resume,
        setResume] = useState(null);
    const [loading,
        setLoading] = useState(true);
    const [error,
        setError] = useState(null);
    const [passwordInput,
        setPasswordInput] = useState('');
    const [needsPassword,
        setNeedsPassword] = useState(false);

    useEffect(() => {
        loadResume();
    }

        , [resumeSlug, shareableLink]);

    const loadResume = async (password = null) => {
        try {
            setLoading(true);
            setError(null);

            let response;

            if (resumeSlug) {
                response = await api.resumesV2.getBySlug(resumeSlug, password);
            }

            else if (shareableLink) {
                response = await api.resumesV2.getByShareableLink(shareableLink, password);
            }

            else {
                throw new Error('No resume identifier provided');
            }

            setResume(response.data);
            setNeedsPassword(false);

            // Record view
            try {
                if (resumeSlug) {
                    await api.resumesV2.recordView(response.data.id);
                }
            }

            catch (e) {
                console.warn('Failed to record view');
            }
        }

        catch (err) {
            if (err.message.includes('Invalid password')) {
                setNeedsPassword(true);
                setError('');
            }

            else {
                setError(err.message || 'Failed to load resume');
            }
        }

        finally {
            setLoading(false);
        }
    }

        ;

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        loadResume(passwordInput);
    }

        ;

    const handleDownload = async () => {
        try {
            // Record download
            await api.resumesV2.recordDownload(resume.id);

            // If there's a PDF URL, open it
            if (resume.pdfUrl) {
                window.open(resume.pdfUrl, '_blank');
            }

            else {
                alert('PDF is not yet generated. Please try again later.');
            }
        }

        catch (err) {
            console.error('Error recording download:', err);
        }
    }

        ;

    const handleShare = async () => {
        try {
            // Record share
            await api.resumesV2.recordShare(resume.id);

            // Copy link to clipboard
            const shareUrl = `$ {
                window.location.origin
            }

            /resume/$ {
                resume.shareableLink
            }

            `;
            await navigator.clipboard.writeText(shareUrl);
            alert('Share link copied to clipboard!');
        }

        catch (err) {
            console.error('Error sharing:', err);
            alert('Failed to share resume');
        }
    }

        ;

    if (loading) {
        return (<div className="public-resume-viewer"> <div className="loading">Loading resume...</div> </div>);
    }

    if (error) {
        return (<div className="public-resume-viewer"> <div className="error-message"> <h2>Oops !</h2> <p> {
            error
        }

        </p> </div> </div>);
    }

    if (needsPassword) {
        return (<div className="public-resume-viewer"> <div className="password-form"> <div className="password-container"> <FiLock className="lock-icon" /> <h2>This resume is password protected</h2> <p>Please enter the password to view it</p> <form onSubmit={
            handlePasswordSubmit
        }

        > <input type="password"

            value={
                passwordInput
            }

            onChange={
                (e) => setPasswordInput(e.target.value)
            }

            placeholder="Enter password"
            autoFocus /> <button type="submit" className="btn btn-primary"> Unlock Resume </button> </form> </div> </div> </div>);
    }

    if (!resume) {
        return (<div className="public-resume-viewer"> <div className="error-message"> <h2>Resume not found</h2> <p>The resume you're looking for doesn't exist or has been removed.</p> </div> </div>);
    }

    return (<div className="public-resume-viewer"> <div className="resume-container"> {
        /* Header */
    }

        <div className="resume-header"> <div className="header-content"> <h1> {
            resume.fullName || 'Resume'
        }

        </h1> {
                resume.summary && <p className="summary"> {
                    resume.summary
                }

                </p>
            }

            <div className="contact-info"> {
                resume.location && <span>📍 {
                    resume.location
                }

                </span>
            }

                {
                    resume.email && <span>📧 {
                        resume.email
                    }

                    </span>
                }

                {
                    resume.phone && <span>📱 {
                        resume.phone
                    }

                    </span>
                }

            </div> {
                resume.linkedinUrl && (<div className="social-links"> <a href={
                    resume.linkedinUrl
                }

                    target="_blank" rel="noopener noreferrer"> LinkedIn </a> {
                        resume.githubUrl && (<a href={
                            resume.githubUrl
                        }

                            target="_blank" rel="noopener noreferrer"> GitHub </a>)
                    }

                    {
                        resume.portfolioUrl && (<a href={
                            resume.portfolioUrl
                        }

                            target="_blank" rel="noopener noreferrer"> Portfolio </a>)
                    }

                </div>)
            }

        </div> <div className="header-meta"> <p className="template-name"> {
            resume.template?.name
        }

        </p> <p className="country-name"> {
            resume.country?.name
        }

                </p> <p className="type-name"> {
                    resume.type?.name
                }

                </p> </div> </div> {
            /* Actions */
        }

        <div className="resume-actions"> {
            resume.allowDownload && (<button className="btn btn-primary" onClick={
                handleDownload
            }

            > <FiDownload /> Download PDF </button>)
        }

            {
                resume.allowShare && (<button className="btn btn-secondary" onClick={
                    handleShare
                }

                > <FiShare2 /> Share Resume </button>)
            }

        </div> {
            /* Content Sections */
        }

        <div className="resume-content"> {
            /* Languages */
        }

            {
                resume.languages && resume.languages.length > 0 && (<section className="resume-section"> <h2>Languages</h2> <div className="skills-list"> {
                    resume.languages.map((lang, idx) => (<span key={
                        idx
                    }

                        className="skill-tag"> {
                            typeof lang === 'string' ? lang : lang.name
                        }

                    </span>))
                }

                </div> </section>)
            }

            {
                /* Skills */
            }

            {
                resume.skills && resume.skills.length > 0 && (<section className="resume-section"> <h2>Skills</h2> <div className="skills-list"> {
                    resume.skills.map((skill, idx) => (<span key={
                        idx
                    }

                        className="skill-tag"> {
                            typeof skill === 'string' ? skill : skill.name
                        }

                    </span>))
                }

                </div> </section>)
            }

            {
                /* Experience */
            }

            {
                resume.experience && resume.experience.length > 0 && (<section className="resume-section"> <h2>Experience</h2> <div className="timeline"> {
                    resume.experience.map((exp, idx) => (<div key={
                        idx
                    }

                        className="timeline-item"> <div className="timeline-header"> <h3> {
                            exp.position || exp.title
                        }

                        </h3> {
                                exp.period && <span className="period"> {
                                    exp.period
                                }

                                </span>
                            }

                        </div> {
                            exp.company && <p className="company"> {
                                exp.company
                            }

                            </p>
                        }

                        {
                            exp.description && <p className="description"> {
                                exp.description
                            }

                            </p>
                        }

                    </div>))
                }

                </div> </section>)
            }

            {
                /* Education */
            }

            {
                resume.education && resume.education.length > 0 && (<section className="resume-section"> <h2>Education</h2> <div className="timeline"> {
                    resume.education.map((edu, idx) => (<div key={
                        idx
                    }

                        className="timeline-item"> <div className="timeline-header"> <h3> {
                            edu.degree || edu.title
                        }

                        </h3> {
                                edu.period && <span className="period"> {
                                    edu.period
                                }

                                </span>
                            }

                        </div> {
                            edu.institution && <p className="company"> {
                                edu.institution
                            }

                            </p>
                        }

                        {
                            edu.description && <p className="description"> {
                                edu.description
                            }

                            </p>
                        }

                    </div>))
                }

                </div> </section>)
            }

            {
                /* Certifications */
            }

            {
                resume.certifications && resume.certifications.length > 0 && (<section className="resume-section"> <h2>Certifications</h2> <ul className="list-items"> {
                    resume.certifications.map((cert, idx) => (<li key={
                        idx
                    }

                    > <strong> {
                        cert.name || cert
                    }

                        </strong> {
                            cert.issuer && <span> - {
                                cert.issuer
                            }

                            </span>
                        }

                    </li>))
                }

                </ul> </section>)
            }

            {
                /* Projects */
            }

            {
                resume.projects && resume.projects.length > 0 && (<section className="resume-section"> <h2>Projects</h2> <div className="projects-list"> {
                    resume.projects.map((proj, idx) => (<div key={
                        idx
                    }

                        className="project-item"> <h3> {
                            proj.name || proj.title
                        }

                        </h3> {
                            proj.description && <p> {
                                proj.description
                            }

                            </p>
                        }

                        {
                            proj.technologies && (<div className="tech-tags"> {
                                Array.isArray(proj.technologies) ? proj.technologies.map((tech, tidx) => (<span key={
                                    tidx
                                }

                                    className="tech-tag"> {
                                        tech
                                    }

                                </span>)) : <span className="tech-tag"> {
                                    proj.technologies
                                }

                                </span>
                            }

                            </div>)
                        }

                        {
                            proj.url && (<a href={
                                proj.url
                            }

                                target="_blank" rel="noopener noreferrer"> View Project → </a>)
                        }

                    </div>))
                }

                </div> </section>)
            }

            {
                /* Awards */
            }

            {
                resume.awards && resume.awards.length > 0 && (<section className="resume-section"> <h2>Awards & Recognition</h2> <ul className="list-items"> {
                    resume.awards.map((award, idx) => (<li key={
                        idx
                    }

                    > <strong> {
                        award.name || award.title
                    }

                        </strong> {
                            award.issuer && <span> - {
                                award.issuer
                            }

                            </span>
                        }

                    </li>))
                }

                </ul> </section>)
            }

            {
                /* Volunteer Work */
            }

            {
                resume.volunteerWork && resume.volunteerWork.length > 0 && (<section className="resume-section"> <h2>Volunteer Work</h2> <div className="timeline"> {
                    resume.volunteerWork.map((vol, idx) => (<div key={
                        idx
                    }

                        className="timeline-item"> <div className="timeline-header"> <h3> {
                            vol.position || vol.role
                        }

                        </h3> {
                                vol.period && <span className="period"> {
                                    vol.period
                                }

                                </span>
                            }

                        </div> {
                            vol.organization && <p className="company"> {
                                vol.organization
                            }

                            </p>
                        }

                        {
                            vol.description && <p className="description"> {
                                vol.description
                            }

                            </p>
                        }

                    </div>))
                }

                </div> </section>)
            }

            {
                /* Publications */
            }

            {
                resume.publications && resume.publications.length > 0 && (<section className="resume-section"> <h2>Publications</h2> <ul className="list-items"> {
                    resume.publications.map((pub, idx) => (<li key={
                        idx
                    }

                    > <strong> {
                        pub.title
                    }

                        </strong> {
                            pub.venue && <span> - {
                                pub.venue
                            }

                            </span>
                        }

                        {
                            pub.year && <span> ( {
                                pub.year
                            }

                                )</span>
                        }

                    </li>))
                }

                </ul> </section>)
            }

        </div> {
            /* Footer */
        }

        <div className="resume-footer"> <p>Views: {
            resume.views
        }

            | Downloads: {
                resume.downloads
            }

            | Shares: {
                resume.shares
            }

        </p> <p className="generated-date">Generated on {
            new Date(resume.createdAt).toLocaleDateString()
        }

            </p> </div> </div> </div>);
}

    ;

export default PublicResumeViewer;