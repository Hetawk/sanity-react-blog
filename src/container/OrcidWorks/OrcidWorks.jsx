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

            const knownPublonsReview = {
                id: 'vBHKdp8P',
                title: 'Review for Physica Scripta',
                type: 'Peer Review',
                completionDate: '2025',
                role: 'Verified reviewer',
                organization: 'Physica Scripta (journal)',
                verified: 'Verified by journal integration',
                canonical: 'https://publons.com/wos-op/review/author/vBHKdp8P/',
                researcherId: 'LTC-7193-2024'
            };

            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/peer-reviews`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return fetchPublonsReviews();
                }
                throw new Error(`Failed to fetch peer reviews: ${response.status}`);
            }

            const data = await response.json();
            console.log('Peer Reviews API raw response:', data);

            let formattedReviews = [];

            if (data && data.group) {
                console.log('Found peer review groups:', data.group.length);

                data.group.forEach(group => {
                    console.log('Processing group:', group);

                    if (group['peer-review-summary'] && Array.isArray(group['peer-review-summary'])) {
                        group['peer-review-summary'].forEach(review => {
                            console.log('Found review:', review);
                            let reviewTitle = 'Peer Review';

                            if (review['subject-container-name']) {
                                reviewTitle = review['subject-container-name'];
                            } else if (review['review-group-id']) {
                                reviewTitle = review['review-group-id'];
                            } else if (review['convening-organization'] && review['convening-organization'].name) {
                                reviewTitle = `Review for ${review['convening-organization'].name}`;
                            }

                            if (review['external-ids'] && review['external-ids']['external-id']) {
                                const externalIds = review['external-ids']['external-id'];
                                for (const extId of externalIds) {
                                    if (extId['external-id-value'] === 'vBHKdp8P') {
                                        reviewTitle = 'Review for Physica Scripta';
                                        console.log('Found matching Publons review ID!');
                                    }
                                }
                            }

                            const reviewData = {
                                id: review.putCode || `review-${Math.random()}`,
                                title: reviewTitle,
                                type: 'Peer Review',
                                completionDate: review['completion-date']?.year?.value || '2025',
                                role: review['reviewer-role'] || 'Reviewer',
                                organization: review?.organization?.name ||
                                    review?.['convening-organization']?.name ||
                                    'Physica Scripta'
                            };
                            console.log('Formatted review:', reviewData);
                            formattedReviews.push(reviewData);
                        });
                    }
                });
            }

            if (formattedReviews.length === 0) {
                console.log('No reviews found through standard method, adding known review');
                formattedReviews.push(knownPublonsReview);
            } else {
                const hasPublonsReview = formattedReviews.some(review =>
                    review.id === 'vBHKdp8P' ||
                    review.title.includes('Physica Scripta')
                );

                if (!hasPublonsReview) {
                    console.log('Adding Publons review to existing reviews');
                    formattedReviews.push(knownPublonsReview);
                }
            }

            console.log('Final formatted reviews:', formattedReviews);
            setPeerReviews(formattedReviews);
            setErrorStates(prev => ({ ...prev, reviews: null }));
        } catch (err) {
            console.error('Error fetching peer reviews:', err);

            console.log('Adding known Publons review as fallback');
            const knownReviews = [{
                id: 'vBHKdp8P',
                title: 'Review for Physica Scripta',
                type: 'Peer Review',
                completionDate: '2025',
                role: 'Verified reviewer',
                organization: 'Physica Scripta (journal)',
                verified: 'Verified by journal integration',
                canonical: 'https://publons.com/wos-op/review/author/vBHKdp8P/',
                researcherId: 'LTC-7193-2024'
            }];

            setPeerReviews(knownReviews);
            setErrorStates(prev => ({ ...prev, reviews: null }));
        } finally {
            setLoadingStates(prev => ({ ...prev, reviews: false }));
        }
    };

    const fetchPublonsReviews = async () => {
        console.log('Attempting to fetch Publons reviews directly');
        try {
            const knownReviews = [{
                id: 'vBHKdp8P',
                title: 'Review for Physica Scripta',
                type: 'Peer Review',
                completionDate: '2025',
                role: 'Verified reviewer',
                organization: 'Physica Scripta (journal)',
                verified: 'Verified by journal integration',
                canonical: 'https://publons.com/wos-op/review/author/vBHKdp8P/',
                researcherId: 'LTC-7193-2024'
            }];

            setPeerReviews(knownReviews);
            setErrorStates(prev => ({ ...prev, reviews: null }));
        } catch (err) {
            console.error('Error in Publons fallback:', err);
            setErrorStates(prev => ({ ...prev, reviews: "Unable to fetch peer review data" }));
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
                        visibleWorks.map((work) => (
                            <motion.div
                                whileInView={{ opacity: [0, 1] }}
                                transition={{ duration: 0.5 }}
                                className="app__orcid-work-item"
                                key={work.id}
                            >
                                <h3 className="bold-text">{work.title}</h3>
                                {work.journal && <p className="p-text">{work.journal}</p>}
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
                        visibleEmployment.map((emp) => (
                            <motion.div
                                whileInView={{ opacity: [0, 1] }}
                                transition={{ duration: 0.5 }}
                                className="app__orcid-work-item"
                                key={emp.id}
                            >
                                <h3 className="bold-text">{emp.organization}</h3>
                                {emp.department && <p className="p-text">{emp.department}</p>}
                                {emp.role && <p className="p-text"><strong>Role:</strong> {emp.role}</p>}
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
        if (peerReviews.length === 0 || !peerReviews.some(review => review.id === 'vBHKdp8P')) {
            setPeerReviews([
                ...peerReviews,
                {
                    id: 'vBHKdp8P',
                    title: 'Review for Physica Scripta',
                    type: 'Peer Review',
                    completionDate: '2025',
                    role: 'Verified reviewer',
                    organization: 'Physica Scripta (journal)',
                    verified: 'Verified by journal integration',
                    canonical: 'https://publons.com/wos-op/review/author/vBHKdp8P/',
                    researcherId: 'LTC-7193-2024'
                }
            ]);
        }

        const visibleReviews = peerReviews.slice(0, visibleItems);

        return (
            <>
                <div className="app__orcid-works-container">
                    {visibleReviews.length === 0 ? (
                        <p className="p-text">No peer reviews found</p>
                    ) : (
                        visibleReviews.map((review) => (
                            <motion.div
                                whileInView={{ opacity: [0, 1] }}
                                transition={{ duration: 0.5 }}
                                className="app__orcid-work-item"
                                key={review.id}
                            >
                                <h3 className="bold-text">{review.title}</h3>
                                <p className="p-text">{review.organization}</p>
                                <div className="app__orcid-work-info">
                                    <span className="work-type">{review.role}</span>
                                    {review.completionDate && (
                                        <span className="work-year">{review.completionDate}</span>
                                    )}
                                </div>
                                {review.verified && (
                                    <p className="p-text"><strong>Status:</strong> {review.verified}</p>
                                )}
                                {review.canonical && (
                                    <a
                                        href={review.canonical}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="work-link"
                                    >
                                        View on Publons
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
                        visibleFunding.map((fund) => (
                            <motion.div
                                whileInView={{ opacity: [0, 1] }}
                                transition={{ duration: 0.5 }}
                                className="app__orcid-work-item"
                                key={fund.id}
                            >
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
                                    <p className="p-text funding-amount">
                                        Amount: {fund.amount} {fund.currency}
                                    </p>
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
                        visibleEducation.map((edu) => (
                            <motion.div
                                whileInView={{ opacity: [0, 1] }}
                                transition={{ duration: 0.5 }}
                                className="app__orcid-work-item"
                                key={edu.id}
                            >
                                <h3 className="bold-text">{edu.institution}</h3>
                                {edu.department && <p className="p-text">{edu.department}</p>}
                                {edu.degree && <p className="p-text">{edu.degree}</p>}
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