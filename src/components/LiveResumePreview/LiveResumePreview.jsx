import React from 'react';
import './LiveResumePreview.scss';

/**
 * LiveResumePreview Component
 * Renders a live preview of the resume content in a canvas-like format
 * Updates in real-time as the user edits the resume
 * Respects visibility settings for fields like country, email, phone etc.
 * Shows labels for links instead of full URLs
 */
const LiveResumePreview = ({
    formData, scale = 0.7
}

) => {
    const {

        fullName,
        email,
        phone,
        location,
        city,
        country,
        summary,
        // New username-based fields
        linkedinUsername,
        portfolioUrl,
        portfolioLabel = 'Portfolio',
        githubCompany,
        githubPersonal,
        // Legacy URL fields (for backward compatibility)
        linkedinUrl,
        githubUrl,
        githubPersonalUrl,
        experience = [],
        education = [],
        skills = [],
        certifications = [],
        languages = [],
        projects = [],
        publications = [],
        awards = [],
        volunteerWork = [],
        visibility = {},
        portfolioSource = 'personal',
    } = formData || {};

    // Default visibility settings (all visible if not specified)
    const vis = {
        country: visibility.country !== false,
        city: visibility.city !== false,
        phone: visibility.phone !== false,
        email: visibility.email !== false,
        linkedinUrl: visibility.linkedinUrl !== false,
        portfolioUrl: visibility.portfolioUrl !== false,
        githubUrl: visibility.githubUrl !== false,
        githubPersonalUrl: visibility.githubPersonalUrl !== false,
    };

    // Get LinkedIn display (prefer new username field)
    const getLinkedinDisplay = () => {
        if (linkedinUsername) return linkedinUsername;
        if (linkedinUrl) {
            // Extract username from full URL
            return linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '');
        }
        return null;
    };

    // Get GitHub display (prefer new username fields)
    const getGithubCompanyDisplay = () => {
        if (githubCompany) return githubCompany;
        if (githubUrl) {
            return githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
        }
        return null;
    };

    const getGithubPersonalDisplay = () => {
        if (githubPersonal) return githubPersonal;
        if (githubPersonalUrl) {
            return githubPersonalUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '');
        }
        return null;
    };

    // Build location string based on visibility
    const getLocationDisplay = () => {
        const parts = [];
        // Only add city/country if they are strings (not objects or booleans)
        if (vis.city && city && typeof city === 'string') parts.push(city);
        if (vis.country && country && typeof country === 'string') parts.push(country);
        // Fallback to legacy location field if city/country not set
        if (parts.length === 0 && location && typeof location === 'string') return location;
        return parts.join(', ');
    };

    // Format date for display
    const formatDate = (date) => {
        if (!date) return '';

        if (typeof date === 'string' && date.includes('-')) {
            const d = new Date(date);

            return d.toLocaleDateString('en-US', {
                month: 'short', year: 'numeric'
            }

            );
        }

        return date;
    };

    // Format period display
    const formatPeriod = (startDate, endDate, isCurrent) => {
        const start = formatDate(startDate);
        const end = isCurrent ? 'Present' : formatDate(endDate);
        if (!start && !end) return '';

        if (start && (isCurrent || end)) return `$ {
            start
        }

        - $ {
            end
        }

        `;
        return start || end || '';
    };

    // Parse responsibilities if string
    const parseResponsibilities = (resp) => {
        if (!resp) return [];
        if (Array.isArray(resp)) return resp;

        try {
            const parsed = JSON.parse(resp);
            return Array.isArray(parsed) ? parsed : [];
        }

        catch {
            return resp.split('\n').filter(r => r.trim());
        }
    };

    // Check if section has content
    const hasContent = (arr) => Array.isArray(arr) && arr.length > 0;

    return (<div className="live-resume-preview-container"> <div className="preview-header"> <span className="preview-label">Live Preview</span> <div className="preview-controls"> <span className="zoom-label">Scale: {
        Math.round(scale * 100)
    }

        %</span> </div> </div> <div className="preview-scroll-area"> <div className="resume-paper"

            style={
                {
                    transform: `scale($ {
                        scale
                    }

                )`, transformOrigin: 'top center'
                }
            }

        > {
                /* Header Section */
            }

            <header className="resume-header"> <h1 className="name"> {
                fullName || 'Your Name'
            }

            </h1> <div className="contact-info"> {
                vis.email && email && <span className="contact-item">📧 {
                    email
                }

                </span>
            }

                    {
                        vis.phone && phone && <span className="contact-item">📱 {
                            phone
                        }

                        </span>
                    }

                    {
                        getLocationDisplay() && <span className="contact-item">📍 {
                            getLocationDisplay()
                        }

                        </span>
                    }

                </div> <div className="links"> {
                    vis.linkedinUrl && getLinkedinDisplay() && (<span className="link-item">
                        <strong>LinkedIn:</strong> linkedin.com/in/{getLinkedinDisplay()}
                    </span>)
                }

                    {
                        vis.portfolioUrl && portfolioUrl && (<span className="link-item">
                            <strong>Portfolio:</strong> {portfolioUrl}
                        </span>)
                    }

                    {
                        vis.githubUrl && getGithubCompanyDisplay() && (<span className="link-item">
                            <strong>GitHub (Company):</strong> github.com/{getGithubCompanyDisplay()}
                        </span>)
                    }

                    {
                        vis.githubPersonalUrl && getGithubPersonalDisplay() && (<span className="link-item">
                            <strong>GitHub:</strong> github.com/{getGithubPersonalDisplay()}
                        </span>)
                    }

                </div> </header> {
                /* Summary Section */
            }

            {
                summary && (<section className="resume-section"> <h2 className="section-title">Professional Summary</h2> <p className="summary-text"> {
                    summary
                }

                </p> </section>)
            }

            {
                /* Experience Section */
            }

            {
                hasContent(experience) && (<section className="resume-section"> <h2 className="section-title">Work Experience</h2> {
                    experience.map((exp, index) => (<div key={
                        exp.id || index
                    }

                        className="resume-entry"> <div className="entry-header"> <div className="entry-main"> <h3 className="entry-title"> {
                            exp.position || 'Position'
                        }

                        </h3> <span className="entry-company"> {
                            exp.company || 'Company'
                        }

                            </span> </div> <div className="entry-meta"> <span className="entry-period"> {
                                exp.period || formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)
                            }

                            </span> {
                                    exp.location && <span className="entry-location"> {
                                        exp.location
                                    }

                                    </span>
                                }

                            </div> </div> {
                            exp.description && (<p className="entry-description"> {
                                exp.description
                            }

                            </p>)
                        }

                        {
                            parseResponsibilities(exp.responsibilities).length > 0 && (<ul className="entry-responsibilities"> {
                                parseResponsibilities(exp.responsibilities).map((resp, i) => (<li key={
                                    i
                                }

                                > {
                                        resp
                                    }

                                </li>))
                            }

                            </ul>)
                        }

                        {
                            exp.sourceId && (<span className={
                                `portfolio-indicator $ {
                                            exp.sourceType || 'personal'
                                        }

                                        `
                            }

                            > {
                                    exp.sourceType === 'company' ? '🏢 Company' : '🧑 Personal'
                                }

                            </span>)
                        }

                    </div>))
                }

                </section>)
            }

            {
                /* Education Section */
            }

            {
                hasContent(education) && (<section className="resume-section"> <h2 className="section-title">Education</h2> {
                    education.map((edu, index) => (<div key={
                        edu.id || index
                    }

                        className="resume-entry"> <div className="entry-header"> <div className="entry-main"> <h3 className="entry-title"> {
                            edu.degree || 'Degree'
                        }

                            {
                                edu.field && <span className="entry-field"> in {
                                    edu.field
                                }

                                </span>
                            }

                        </h3> <span className="entry-company"> {
                            edu.institution || 'Institution'
                        }

                            </span> </div> <div className="entry-meta"> <span className="entry-period"> {
                                edu.period || formatPeriod(edu.startDate, edu.endDate, false)
                            }

                            </span> {
                                    edu.location && <span className="entry-location"> {
                                        edu.location
                                    }

                                    </span>
                                }

                            </div> </div> {
                            edu.gpa && <p className="entry-gpa">GPA: {
                                edu.gpa
                            }

                            </p>
                        }

                        {
                            edu.description && <p className="entry-description"> {
                                edu.description
                            }

                            </p>
                        }

                        {
                            edu.sourceId && (<span className="portfolio-indicator">From Portfolio</span>)
                        }

                    </div>))
                }

                </section>)
            }

            {
                /* Skills Section */
            }

            {
                hasContent(skills) && (<section className="resume-section"> <h2 className="section-title">Skills</h2> <div className="skills-grid"> {
                    skills.map((skill, index) => (<span key={
                        index
                    }

                        className="skill-tag"> {
                            typeof skill === 'string' ? skill : skill.name
                        }

                    </span>))
                }

                </div> </section>)
            }

            {
                /* Projects Section */
            }

            {
                hasContent(projects) && (<section className="resume-section"> <h2 className="section-title">Projects</h2> {
                    projects.map((proj, index) => (<div key={
                        proj.id || index
                    }

                        className="resume-entry"> <div className="entry-header"> <div className="entry-main"> <h3 className="entry-title"> {
                            proj.title || proj.name || 'Project'
                        }

                        </h3> {
                                proj.role && <span className="entry-role"> {
                                    proj.role
                                }

                                </span>
                            }

                        </div> {
                                proj.period && <span className="entry-period"> {
                                    proj.period
                                }

                                </span>
                            }

                        </div> {
                            proj.techStack && (<p className="entry-tech"> <strong>Tech:</strong> {
                                Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack
                            }

                            </p>)
                        }

                        {
                            proj.description && <p className="entry-description"> {
                                proj.description
                            }

                            </p>
                        }

                        {
                            proj.url && <p className="entry-link">🔗 {
                                proj.url
                            }

                            </p>
                        }

                        {
                            proj.sourceId && (<span className="portfolio-indicator">From Portfolio</span>)
                        }

                    </div>))
                }

                </section>)
            }

            {
                /* Certifications Section */
            }

            {
                hasContent(certifications) && (<section className="resume-section"> <h2 className="section-title">Certifications</h2> {
                    certifications.map((cert, index) => (<div key={
                        cert.id || index
                    }

                        className="resume-entry compact"> <div className="entry-header"> <h3 className="entry-title"> {
                            cert.name || cert.title || 'Certification'
                        }

                        </h3> <span className="entry-issuer"> {
                            cert.issuer
                        }

                            </span> </div> {
                            (cert.issueDate || cert.expirationDate) && (<span className="entry-dates"> {
                                formatDate(cert.issueDate)
                            }

                                {
                                    cert.expirationDate && ` - $ {
                                            formatDate(cert.expirationDate)
                                        }

                                        `
                                }

                            </span>)
                        }

                        {
                            cert.credentialId && (<span className="credential-id">ID: {
                                cert.credentialId
                            }

                            </span>)
                        }

                        {
                            cert.sourceId && (<span className="portfolio-indicator">From Portfolio</span>)
                        }

                    </div>))
                }

                </section>)
            }

            {
                /* Publications Section */
            }

            {
                hasContent(publications) && (<section className="resume-section"> <h2 className="section-title">Publications</h2> {
                    publications.map((pub, index) => (<div key={
                        pub.id || index
                    }

                        className="resume-entry compact"> <h3 className="entry-title"> {
                            pub.title || 'Publication'
                        }

                        </h3> <p className="entry-meta-line"> {
                            pub.publisher && <span> {
                                pub.publisher
                            }

                            </span>
                        }

                            {
                                pub.year && <span> • {
                                    pub.year
                                }

                                </span>
                            }

                        </p> {
                            pub.description && <p className="entry-description"> {
                                pub.description
                            }

                            </p>
                        }

                        {
                            pub.url && <p className="entry-link">🔗 {
                                pub.url
                            }

                            </p>
                        }

                        {
                            pub.sourceId && (<span className="portfolio-indicator">From Portfolio</span>)
                        }

                    </div>))
                }

                </section>)
            }

            {
                /* Awards Section */
            }

            {
                hasContent(awards) && (<section className="resume-section"> <h2 className="section-title">Awards & Achievements</h2> {
                    awards.map((award, index) => (<div key={
                        award.id || index
                    }

                        className="resume-entry compact"> <div className="entry-header"> <h3 className="entry-title"> {
                            award.title || award.name || 'Award'
                        }

                        </h3> {
                                award.year && <span className="entry-year"> {
                                    award.year
                                }

                                </span>
                            }

                        </div> {
                            award.issuer && <span className="entry-issuer"> {
                                award.issuer
                            }

                            </span>
                        }

                        {
                            award.description && <p className="entry-description"> {
                                award.description
                            }

                            </p>
                        }

                        {
                            award.sourceId && (<span className="portfolio-indicator">From Portfolio</span>)
                        }

                    </div>))
                }

                </section>)
            }

            {
                /* Volunteer Work Section */
            }

            {
                hasContent(volunteerWork) && (<section className="resume-section"> <h2 className="section-title">Volunteer Experience</h2> {
                    volunteerWork.map((vol, index) => (<div key={
                        vol.id || index
                    }

                        className="resume-entry"> <div className="entry-header"> <div className="entry-main"> <h3 className="entry-title"> {
                            vol.position || vol.role || 'Role'
                        }

                        </h3> <span className="entry-company"> {
                            vol.organization || 'Organization'
                        }

                            </span> </div> <span className="entry-period"> {
                                vol.period || formatPeriod(vol.startDate, vol.endDate, vol.isCurrent)
                            }

                            </span> </div> {
                            vol.description && <p className="entry-description"> {
                                vol.description
                            }

                            </p>
                        }

                        {
                            vol.sourceId && (<span className="portfolio-indicator">From Portfolio</span>)
                        }

                    </div>))
                }

                </section>)
            }

            {
                /* Languages Section */
            }

            {
                hasContent(languages) && (<section className="resume-section"> <h2 className="section-title">Languages</h2> <div className="languages-list"> {
                    languages.map((lang, index) => (<span key={
                        index
                    }

                        className="language-item"> {
                            typeof lang === 'string' ? lang : `$ {
                                    lang.name
                                }

                                : $ {
                                    lang.level || 'Fluent'
                                }

                                `
                        }

                    </span>))
                }

                </div> </section>)
            }

            {
                /* Empty State */
            }

            {
                !summary && !hasContent(experience) && !hasContent(education) && !hasContent(skills) && (<div className="empty-preview"> <p>Start adding content to see your resume preview</p> <ul> <li>Add your professional summary</li> <li>Add work experience from your portfolio</li> <li>Include education details</li> <li>List your skills and certifications</li> </ul> </div>)
            }

            {
                /* Footer */
            }

            <footer className="resume-footer"> <span className="generated-note">Live Preview • Updates as you type</span> </footer> </div> </div> </div>);
}

export default LiveResumePreview;