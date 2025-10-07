import React, { useState, useEffect } from 'react';

import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import './OrcidWorks.scss';

const OrcidWorks = () => {
    const [activeTab, setActiveTab] = useState('publications');
    const [works, setWorks] = useState([]);
    const [employment, setEmployment] = useState([]);
    const [peerReviews, setPeerReviews] = useState([]);
    const [funding, setFunding] = useState([]);
    const [education, setEducation] = useState([]);

    const [loadingStates, setLoadingStates] = useState({
        publications: true,
        employment: false,
        reviews: false,
        funding: false,
        education: false
    });

    const [errorStates, setErrorStates] = useState({
        publications: null,
        employment: null,
        reviews: null,
        funding: null,
        education: null
    });

    const [visibleItems, setVisibleItems] = useState(6);

    const orcidId = '0009-0005-5213-9834';

    const handleShowMore = () => {
        setVisibleItems(prevVisible => prevVisible + 6);
    };

    const handleShowLess = () => {
        setVisibleItems(prevVisible => Math.max(6, prevVisible - 6));
    };

    const handleReset = () => {
        setVisibleItems(6);
    };

    useEffect(() => {
        setVisibleItems(6);
    }, [activeTab]);

    const fetchOrcidWorks = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, publications: true }));
            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch ORCID works: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.group) {
                const formattedWorks = data.group.map(group => {
                    const work = group['work-summary'][0];

                    return {
                        id: work.putCode,
                        title: work.title?.title?.value || 'Untitled Work',
                        type: work.type,
                        url: work?.url?.value,
                        journal: work['journal-title']?.value,
                        year: work['publication-date']?.year?.value,
                    };
                });
                setWorks(formattedWorks);

                setErrorStates(prev => ({ ...prev, publications: null }));
            } else {
                setWorks([]);

                setErrorStates(prev => ({ ...prev, publications: "No publication data found" }));
            }
        } catch (err) {
            console.error('Error fetching ORCID works:', err);

            setErrorStates(prev => ({ ...prev, publications: err.message }));
        } finally {
            setLoadingStates(prev => ({ ...prev, publications: false }));
        }
    };

    const fetchEmployment = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, employment: true }));
            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/employments`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.log('Trying alternative employment endpoint');
                return fetchAlternativeEmployment();
            }

            const data = await response.json();
            console.log('Employment API response:', data);

            let formattedEmployment = [];

            if (data && data['affiliation-group']) {
                data['affiliation-group'].forEach(group => {
                    if (group['summaries'] && Array.isArray(group['summaries'])) {
                        group.summaries.forEach(emp => {
                            if (emp['employment-summary']) {
                                const summary = emp['employment-summary'];
                                formattedEmployment.push({
                                    id: summary.putCode || `emp-${Math.random()}`,
                                    organization: summary?.organization?.name || 'Unknown Organization',
                                    department: summary['department-name'] || '',
                                    role: summary['role-title'] || 'Employee',
                                    startYear: summary['start-date']?.year?.value,
                                    endYear: summary['end-date']?.year?.value,
                                    location: summary?.organization?.address?.city || '',
                                    country: summary?.organization?.address?.country || ''
                                });
                            }
                        });
                    }
                });
            } else if (data && data.summaries) {
                formattedEmployment = data.summaries.map(emp => ({
                    id: emp.putCode || `emp-${Math.random()}`,
                    organization: emp?.organization?.name || 'Unknown Organization',
                    department: emp['department-name'] || '',
                    role: emp['role-title'] || 'Employee',
                    startYear: emp['start-date']?.year?.value,
                    endYear: emp['end-date']?.year?.value,
                    location: emp?.organization?.address?.city || '',
                    country: emp?.organization?.address?.country || ''
                }));
            }

            console.log('Formatted employment data:', formattedEmployment);
            setEmployment(formattedEmployment);

            if (formattedEmployment.length === 0) {
                setErrorStates(prev => ({ ...prev, employment: "No employment data found in this ORCID profile" }));
            } else {
                setErrorStates(prev => ({ ...prev, employment: null }));
            }
        } catch (err) {
            console.error('Error fetching employment:', err);
            setErrorStates(prev => ({ ...prev, employment: err.message }));
        } finally {
            setLoadingStates(prev => ({ ...prev, employment: false }));
        }
    };

    const fetchAlternativeEmployment = async () => {
        try {
            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/employment`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("No employment data available for this ORCID profile");
                }
                throw new Error(`Failed to fetch employment: ${response.status}`);
            }

            const data = await response.json();
            console.log('Alternative Employment API response:', data);

            let formattedEmployment = [];

            if (data && data['employment-summary']) {
                const emp = data['employment-summary'];
                formattedEmployment.push({
                    id: emp.putCode || `emp-${Math.random()}`,
                    organization: emp?.organization?.name || 'Unknown Organization',
                    department: emp['department-name'] || '',
                    role: emp['role-title'] || 'Employee',
                    startYear: emp['start-date']?.year?.value,
                    endYear: emp['end-date']?.year?.value,
                    location: emp?.organization?.address?.city || '',
                    country: emp?.organization?.address?.country || ''
                });
            } else if (data && Array.isArray(data)) {
                formattedEmployment = data.map(emp => ({
                    id: emp.putCode || `emp-${Math.random()}`,
                    organization: emp?.organization?.name || 'Unknown Organization',
                    department: emp['department-name'] || '',
                    role: emp['role-title'] || 'Employee',
                    startYear: emp['start-date']?.year?.value,
                    endYear: emp['end-date']?.year?.value,
                    location: emp?.organization?.address?.city || '',
                    country: emp?.organization?.address?.country || ''
                }));
            }

            console.log('Alternative formatted employment:', formattedEmployment);
            setEmployment(formattedEmployment);

            if (formattedEmployment.length === 0) {
                setErrorStates(prev => ({ ...prev, employment: "No employment data found in this ORCID profile" }));
            } else {
                setErrorStates(prev => ({ ...prev, employment: null }));
            }
        } catch (err) {
            console.error('Error fetching alternative employment:', err);
            setErrorStates(prev => ({ ...prev, employment: err.message }));
        }
    };

    const fetchPeerReviews = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, reviews: true }));

            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/peer-reviews`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch peer reviews: ${response.status}`);
            }

            const data = await response.json();
            console.log('Peer Reviews API raw response:', data);

            let formattedReviews = [];

            // Map of known ISSNs to journal names
            const journalNames = {
                '1402-4896': 'Physica Scripta',
                '0950-7051': 'Knowledge-Based Systems'
            };

            if (data && data.group) {
                console.log('Found peer review groups:', data.group.length);

                data.group.forEach(group => {
                    // Extract ISSN from group external-ids
                    let journalISSN = null;
                    let journalName = null;

                    if (group['external-ids'] && group['external-ids']['external-id']) {
                        const groupExtIds = group['external-ids']['external-id'];
                        for (const extId of groupExtIds) {
                            if (extId['external-id-type'] === 'peer-review' && extId['external-id-value']) {
                                journalISSN = extId['external-id-value'].replace('issn:', '');
                                journalName = journalNames[journalISSN] || null;
                            }
                        }
                    }

                    // Process each peer-review-group
                    if (group['peer-review-group'] && Array.isArray(group['peer-review-group'])) {
                        group['peer-review-group'].forEach(reviewGroup => {
                            if (reviewGroup['peer-review-summary'] && Array.isArray(reviewGroup['peer-review-summary'])) {
                                reviewGroup['peer-review-summary'].forEach(review => {
                                    console.log('Processing review:', review);

                                    // Extract review URL from external IDs
                                    let reviewUrl = review['review-url']?.value || null;
                                    let externalIdValue = null;

                                    if (review['external-ids'] && review['external-ids']['external-id']) {
                                        const reviewExtIds = review['external-ids']['external-id'];
                                        for (const extId of reviewExtIds) {
                                            if (extId['external-id-url']?.value) {
                                                reviewUrl = extId['external-id-url'].value;
                                                externalIdValue = extId['external-id-value'];
                                            }
                                        }
                                    }

                                    // Determine journal name from review-group-id if not found
                                    if (!journalName && review['review-group-id']) {
                                        const reviewGroupISSN = review['review-group-id'].replace('issn:', '');
                                        journalName = journalNames[reviewGroupISSN] || null;
                                    }

                                    // Get organization info
                                    const organizationName = review['convening-organization']?.name || 'Unknown Organization';
                                    const sourceName = review?.source?.['source-name']?.value;

                                    // Determine verification status
                                    let verified = null;
                                    if (sourceName && sourceName.includes('Web of Science')) {
                                        verified = 'Verified by journal integration';
                                    } else if (organizationName.includes('Elsevier')) {
                                        verified = 'Verified by Elsevier Editorial';
                                    }

                                    // Build title
                                    let title = journalName ? `Review for ${journalName}` : 'Peer Review';

                                    const reviewData = {
                                        id: review['put-code'] || externalIdValue || `review-${Math.random()}`,
                                        title: title,
                                        type: 'Peer Review',
                                        completionDate: review['completion-date']?.year?.value || 'N/A',
                                        role: review['reviewer-role']?.charAt(0).toUpperCase() + review['reviewer-role']?.slice(1) || 'Reviewer',
                                        organization: journalName ? `${journalName} (journal)` : organizationName,
                                        verified: verified,
                                        reviewUrl: reviewUrl,
                                        issn: journalISSN
                                    };

                                    console.log('Formatted review:', reviewData);
                                    formattedReviews.push(reviewData);
                                });
                            }
                        });
                    }
                });
            }

            console.log('Final formatted reviews:', formattedReviews);
            setPeerReviews(formattedReviews);

            if (formattedReviews.length === 0) {
                setErrorStates(prev => ({ ...prev, reviews: "No peer review data found in this ORCID profile" }));
            } else {
                setErrorStates(prev => ({ ...prev, reviews: null }));
            }
        } catch (err) {
            console.error('Error fetching peer reviews:', err);
            setErrorStates(prev => ({ ...prev, reviews: err.message }));
        } finally {
            setLoadingStates(prev => ({ ...prev, reviews: false }));
        }
    };

    const fetchFunding = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, funding: true }));
            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/fundings`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.log('Trying alternative funding endpoint');
                return fetchAlternativeFunding();
            }

            const data = await response.json();
            console.log('Funding API response:', data);

            let formattedFunding = [];

            if (data && data['group']) {
                data.group.forEach(group => {
                    if (group['funding-summary'] && Array.isArray(group['funding-summary'])) {
                        group['funding-summary'].forEach(fund => {
                            formattedFunding.push({
                                id: fund.putCode || `fund-${Math.random()}`,
                                title: fund.title?.title?.value || 'Untitled Grant',
                                type: fund.type || 'Grant',
                                organization: fund?.organization?.name || 'Unknown Organization',
                                startYear: fund['start-date']?.year?.value,
                                endYear: fund['end-date']?.year?.value,
                                amount: fund?.amount?.value,
                                currency: fund?.amount?.['currency-code']
                            });
                        });
                    }
                });
            }

            console.log('Formatted funding data:', formattedFunding);
            setFunding(formattedFunding);

            if (formattedFunding.length === 0) {
                setErrorStates(prev => ({ ...prev, funding: "No funding data found in this ORCID profile" }));
            } else {
                setErrorStates(prev => ({ ...prev, funding: null }));
            }
        } catch (err) {
            console.error('Error fetching funding:', err);
            setErrorStates(prev => ({ ...prev, funding: err.message }));
        } finally {
            setLoadingStates(prev => ({ ...prev, funding: false }));
        }
    };

    const fetchAlternativeFunding = async () => {
        try {
            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/funding`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("No funding data available for this ORCID profile");
                }
                throw new Error(`Failed to fetch funding: ${response.status}`);
            }

            const data = await response.json();
            console.log('Alternative Funding API response:', data);

            let formattedFunding = [];

            if (data && data['funding-summary']) {
                const fund = data['funding-summary'];
                formattedFunding.push({
                    id: fund.putCode || `fund-${Math.random()}`,
                    title: fund.title?.title?.value || 'Untitled Grant',
                    type: fund.type || 'Grant',
                    organization: fund?.organization?.name || 'Unknown Organization',
                    startYear: fund['start-date']?.year?.value,
                    endYear: fund['end-date']?.year?.value,
                    amount: fund?.amount?.value,
                    currency: fund?.amount?.['currency-code']
                });
            } else if (data && Array.isArray(data)) {
                formattedFunding = data.map(fund => ({
                    id: fund.putCode || `fund-${Math.random()}`,
                    title: fund.title?.title?.value || 'Untitled Grant',
                    type: fund.type || 'Grant',
                    organization: fund?.organization?.name || 'Unknown Organization',
                    startYear: fund['start-date']?.year?.value,
                    endYear: fund['end-date']?.year?.value,
                    amount: fund?.amount?.value,
                    currency: fund?.amount?.['currency-code']
                }));
            }

            console.log('Alternative formatted funding:', formattedFunding);
            setFunding(formattedFunding);

            if (formattedFunding.length === 0) {
                setErrorStates(prev => ({ ...prev, funding: "No funding data found in this ORCID profile" }));
            } else {
                setErrorStates(prev => ({ ...prev, funding: null }));
            }
        } catch (err) {
            console.error('Error fetching alternative funding:', err);
            setErrorStates(prev => ({ ...prev, funding: err.message }));
        }
    };

    const fetchEducation = async () => {
        try {
            setLoadingStates(prev => ({ ...prev, education: true }));
            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/educations`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.log('Trying alternative education endpoint');
                return fetchAlternativeEducation();
            }

            const data = await response.json();
            console.log('Education API response:', data);

            let formattedEducation = [];

            if (data && data['affiliation-group']) {
                data['affiliation-group'].forEach(group => {
                    if (group['summaries'] && Array.isArray(group['summaries'])) {
                        group.summaries.forEach(edu => {
                            if (edu['education-summary']) {
                                const summary = edu['education-summary'];
                                formattedEducation.push({
                                    id: summary.putCode || `edu-${Math.random()}`,
                                    institution: summary?.organization?.name || 'Unknown Institution',
                                    department: summary['department-name'] || '',
                                    role: summary['role-title'] || 'Student',
                                    startYear: summary['start-date']?.year?.value,
                                    endYear: summary['end-date']?.year?.value,
                                    degree: summary['degree-name'] || ''
                                });
                            }
                        });
                    }
                });
            } else if (data && data.summaries) {
                formattedEducation = data.summaries.map(edu => ({
                    id: edu.putCode || `edu-${Math.random()}`,
                    institution: edu?.organization?.name || 'Unknown Institution',
                    department: edu['department-name'] || '',
                    role: edu['role-title'] || 'Student',
                    startYear: edu['start-date']?.year?.value,
                    endYear: edu['end-date']?.year?.value,
                    degree: edu['degree-name'] || ''
                }));
            }

            console.log('Formatted education data:', formattedEducation);
            setEducation(formattedEducation);

            if (formattedEducation.length === 0) {
                setErrorStates(prev => ({ ...prev, education: "No education data found in this ORCID profile" }));
            } else {
                setErrorStates(prev => ({ ...prev, education: null }));
            }
        } catch (err) {
            console.error('Error fetching education:', err);
            setErrorStates(prev => ({ ...prev, education: err.message }));
        } finally {
            setLoadingStates(prev => ({ ...prev, education: false }));
        }
    };

    const fetchAlternativeEducation = async () => {
        try {
            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/education`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("No education data available for this ORCID profile");
                }
                throw new Error(`Failed to fetch education: ${response.status}`);
            }

            const data = await response.json();
            console.log('Alternative Education API response:', data);

            let formattedEducation = [];

            if (data && data['education-summary']) {
                const edu = data['education-summary'];
                formattedEducation.push({
                    id: edu.putCode || `edu-${Math.random()}`,
                    institution: edu?.organization?.name || 'Unknown Institution',
                    department: edu['department-name'] || '',
                    role: edu['role-title'] || 'Student',
                    startYear: edu['start-date']?.year?.value,
                    endYear: edu['end-date']?.year?.value,
                    degree: edu['degree-name'] || ''
                });
            } else if (data && Array.isArray(data)) {
                formattedEducation = data.map(edu => ({
                    id: edu.putCode || `edu-${Math.random()}`,
                    institution: edu?.organization?.name || 'Unknown Institution',
                    department: edu['department-name'] || '',
                    role: edu['role-title'] || 'Student',
                    startYear: edu['start-date']?.year?.value,
                    endYear: edu['end-date']?.year?.value,
                    degree: edu['degree-name'] || ''
                }));
            }

            console.log('Alternative formatted education:', formattedEducation);
            setEducation(formattedEducation);

            if (formattedEducation.length === 0) {
                setErrorStates(prev => ({ ...prev, education: "No education data found in this ORCID profile" }));
            } else {
                setErrorStates(prev => ({ ...prev, education: null }));
            }
        } catch (err) {
            console.error('Error fetching alternative education:', err);
            setErrorStates(prev => ({ ...prev, education: err.message }));
        }
    };

    useEffect(() => {
        if (activeTab === 'publications') {
            if (works.length === 0 && !errorStates.publications) {
                fetchOrcidWorks();
            }
        } else if (activeTab === 'employment') {
            if (employment.length === 0 && !loadingStates.employment && !errorStates.employment) {
                fetchEmployment();
            }
        } else if (activeTab === 'reviews') {
            if (peerReviews.length === 0 && !loadingStates.reviews && !errorStates.reviews) {
                fetchPeerReviews();
            }
        } else if (activeTab === 'funding') {
            if (funding.length === 0 && !loadingStates.funding && !errorStates.funding) {
                fetchFunding();
            }
        } else if (activeTab === 'education') {
            if (education.length === 0 && !loadingStates.education && !errorStates.education) {
                fetchEducation();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        fetchOrcidWorks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderTabContent = () => {
        if (activeTab === 'publications') {
            if (loadingStates.publications) {
                return <div className="app__flex"><p>Loading publications...</p></div>;
            }

            return errorStates.publications ? <div className="app__flex error-message"><p>{errorStates.publications}</p></div> : renderPublicationsTab();
        } else if (activeTab === 'employment') {
            if (loadingStates.employment) {
                return <div className="app__flex"><p>Loading employment information...</p></div>;
            }

            return errorStates.employment ? <div className="app__flex error-message"><p>{errorStates.employment}</p><p className="suggestion">Employment information may not be available for all ORCID profiles.</p></div> : renderEmploymentTab();
        } else if (activeTab === 'reviews') {
            if (loadingStates.reviews) {
                return <div className="app__flex"><p>Loading peer reviews...</p></div>;
            }

            return errorStates.reviews ? <div className="app__flex error-message"><p>{errorStates.reviews}</p><p className="suggestion">Peer review data may not be available for all ORCID profiles.</p></div> : renderReviewsTab();
        } else if (activeTab === 'funding') {
            if (loadingStates.funding) {
                return <div className="app__flex"><p>Loading funding information...</p></div>;
            }

            return errorStates.funding ? <div className="app__flex error-message"><p>{errorStates.funding}</p><p className="suggestion">Funding information may not be available for all ORCID profiles.</p></div> : renderFundingTab();
        } else if (activeTab === 'education') {
            if (loadingStates.education) {
                return <div className="app__flex"><p>Loading education information...</p></div>;
            }

            return errorStates.education ? <div className="app__flex error-message"><p>{errorStates.education}</p><p className="suggestion">Education information may not be available for all ORCID profiles.</p></div> : renderEducationTab();
        }

        return null;
    };

    const renderPublicationsTab = () => {
        const visibleWorks = works.slice(0, visibleItems);

        return (
            <>
                <div className="app__orcid-works-container">
                    {visibleWorks.length === 0 ? (
                        <p className="p-text">No publications found</p>
                    ) : (
                        visibleWorks.map((work, index) => (
                            <motion.div
                                key={work.id || `work-${index}`}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="app__orcid-work-item publication-card"
                            >
                                <div className="card-icon">📄</div>
                                <h3 className="bold-text">{work.title}</h3>
                                {work.journal && <p className="p-text journal-name">{work.journal}</p>}
                                <div className="app__orcid-work-info">
                                    {work.type && <span className="work-type">{work.type}</span>}
                                    {work.year && <span className="work-year">{work.year}</span>}
                                </div>
                                {work.url && (
                                    <a
                                        href={work.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="work-link"
                                    >
                                        View Publication
                                    </a>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
                {works.length > 6 && (
                    <div className="app__orcid-show-more">
                        {works.length > visibleItems && (
                            <button
                                type="button"
                                onClick={handleShowMore}
                                className="show-more-btn"
                            >
                                Show More
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleShowLess}
                                className="show-less-btn"
                            >
                                Show Less
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="reset-btn"
                            >
                                Reset View
                            </button>
                        )}
                    </div>
                )}
            </>
        );
    };

    const renderEmploymentTab = () => {
        const visibleEmployment = employment.slice(0, visibleItems);

        return (
            <>
                <div className="app__orcid-works-container">
                    {visibleEmployment.length === 0 ? (
                        <p className="p-text">No employment information found</p>
                    ) : (
                        visibleEmployment.map((emp, index) => (
                            <motion.div
                                key={emp.id || `emp-${index}`}
                                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="app__orcid-work-item employment-card"
                            >
                                <div className="card-icon">💼</div>
                                <h3 className="bold-text">{emp.organization}</h3>
                                {emp.department && <p className="p-text department-name">{emp.department}</p>}
                                {emp.role && (
                                    <div className="role-info">
                                        <p className="p-text"><strong>Role:</strong> {emp.role}</p>
                                    </div>
                                )}
                                <div className="app__orcid-work-info">
                                    {emp.location && <span className="work-location">{emp.location}, {emp.country}</span>}
                                    {emp.startYear && (
                                        <span className="work-year">
                                            {emp.startYear}-{emp.endYear || 'Present'}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
                {employment.length > 6 && (
                    <div className="app__orcid-show-more">
                        {employment.length > visibleItems && (
                            <button
                                type="button"
                                onClick={handleShowMore}
                                className="show-more-btn"
                            >
                                Show More
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleShowLess}
                                className="show-less-btn"
                            >
                                Show Less
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="reset-btn"
                            >
                                Reset View
                            </button>
                        )}
                    </div>
                )}
            </>
        );
    };

    const renderReviewsTab = () => {
        const visibleReviews = peerReviews.slice(0, visibleItems);

        return (
            <>
                <div className="app__orcid-works-container">
                    {visibleReviews.length === 0 ? (
                        <p className="p-text">No peer reviews found</p>
                    ) : (
                        visibleReviews.map((review, index) => (
                            <motion.div
                                key={review.id || `review-${index}`}
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 120
                                }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="app__orcid-work-item review-card"
                            >
                                <div className="card-icon">🔍</div>
                                <h3 className="bold-text">{review.title}</h3>
                                <p className="p-text">{review.organization}</p>
                                {review.issn && (
                                    <p className="review-issn">
                                        <strong>ISSN:</strong> {review.issn}
                                    </p>
                                )}
                                <div className="app__orcid-work-info">
                                    <span className="work-type">{review.role}</span>
                                    {review.completionDate && (
                                        <span className="work-year">{review.completionDate}</span>
                                    )}
                                </div>
                                {review.verified && (
                                    <div className="review-status">
                                        <p className="p-text"><strong>Status:</strong> {review.verified}</p>
                                    </div>
                                )}
                                {review.reviewUrl && (
                                    <a
                                        href={review.reviewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="work-link"
                                    >
                                        {review.reviewUrl.includes('publons') ? 'View on Publons' : 'View Review'}
                                    </a>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
                {peerReviews.length > 6 && (
                    <div className="app__orcid-show-more">
                        {peerReviews.length > visibleItems && (
                            <button
                                type="button"
                                onClick={handleShowMore}
                                className="show-more-btn"
                            >
                                Show More
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleShowLess}
                                className="show-less-btn"
                            >
                                Show Less
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="reset-btn"
                            >
                                Reset View
                            </button>
                        )}
                    </div>
                )}
            </>
        );
    };

    const renderFundingTab = () => {
        const visibleFunding = funding.slice(0, visibleItems);

        return (
            <>
                <div className="app__orcid-works-container">
                    {visibleFunding.length === 0 ? (
                        <p className="p-text">No funding information found</p>
                    ) : (
                        visibleFunding.map((fund, index) => (
                            <motion.div
                                key={fund.id || `fund-${index}`}
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="app__orcid-work-item funding-card"
                            >
                                <div className="card-icon">💰</div>
                                <h3 className="bold-text">{fund.title}</h3>
                                <p className="p-text">{fund.organization}</p>
                                <div className="app__orcid-work-info">
                                    <span className="work-type">{fund.type}</span>
                                    {fund.startYear && fund.endYear && (
                                        <span className="work-year">
                                            {fund.startYear}-{fund.endYear}
                                        </span>
                                    )}
                                </div>
                                {fund.amount && (
                                    <div className="funding-amount">
                                        {fund.amount} {fund.currency}
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
                {funding.length > 6 && (
                    <div className="app__orcid-show-more">
                        {funding.length > visibleItems && (
                            <button
                                type="button"
                                onClick={handleShowMore}
                                className="show-more-btn"
                            >
                                Show More
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleShowLess}
                                className="show-less-btn"
                            >
                                Show Less
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="reset-btn"
                            >
                                Reset View
                            </button>
                        )}
                    </div>
                )}
            </>
        );
    };

    const renderEducationTab = () => {
        const visibleEducation = education.slice(0, visibleItems);

        return (
            <>
                <div className="app__orcid-works-container">
                    {visibleEducation.length === 0 ? (
                        <p className="p-text">No education information found</p>
                    ) : (
                        visibleEducation.map((edu, index) => (
                            <motion.div
                                key={edu.id || `edu-${index}`}
                                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                viewport={{ once: true, amount: 0.3 }}
                                className="app__orcid-work-item education-card"
                            >
                                <div className="card-icon">🎓</div>
                                <h3 className="bold-text">{edu.institution}</h3>
                                {edu.department && <p className="p-text department-name">{edu.department}</p>}
                                {edu.degree && <div className="degree-badge">{edu.degree}</div>}
                                <div className="app__orcid-work-info">
                                    <span className="work-type">{edu.role}</span>
                                    {edu.startYear && edu.endYear && (
                                        <span className="work-year">
                                            {edu.startYear}-{edu.endYear || 'Present'}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
                {education.length > 6 && (
                    <div className="app__orcid-show-more">
                        {education.length > visibleItems && (
                            <button
                                type="button"
                                onClick={handleShowMore}
                                className="show-more-btn"
                            >
                                Show More
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleShowLess}
                                className="show-less-btn"
                            >
                                Show Less
                            </button>
                        )}
                        {visibleItems > 6 && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="reset-btn"
                            >
                                Reset View
                            </button>
                        )}
                    </div>
                )}
            </>
        );
    };

    return (
        <>
            <h2 className="head-text">
                My ORCID <span>Profile</span>
            </h2>
            <div className="app__orcid-tabs">
                <button
                    className={`tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('publications')}
                >
                    Publications
                </button>
                <button
                    className={`tab-btn ${activeTab === 'employment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employment')}
                >
                    Employment
                </button>
                <button
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Peer Reviews
                </button>
                <button
                    className={`tab-btn ${activeTab === 'funding' ? 'active' : ''}`}
                    onClick={() => setActiveTab('funding')}
                >
                    Funding
                </button>
                <button
                    className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
                    onClick={() => setActiveTab('education')}
                >
                    Education
                </button>
            </div>
            <div className="app__orcid-content">{renderTabContent()}</div>
            <div className="app__orcid-badge">
                <a href={`https://orcid.org/${orcidId}`} target="_blank" rel="noopener noreferrer">
                    <img
                        src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png"
                        alt="ORCID iD"
                    />
                    <span>View my complete ORCID profile</span>
                </a>
            </div>
        </>
    );
};

export default AppWrap(MotionWrap(OrcidWorks, 'app__orcid-works'), 'publications', 'app__primarybg');