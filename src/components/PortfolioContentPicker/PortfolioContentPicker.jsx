import React,
{
    useState,
    useEffect,
    useCallback
}

    from 'react';

import {
    FiSearch,
    FiPlus,
    FiCheck,
    FiX,
    FiLoader,
    FiExternalLink,
    FiChevronDown
}

    from 'react-icons/fi';

import {
    apiClient
}

    from '../../api/client';
import './PortfolioContentPicker.scss';

// Available content types for portfolio
const CONTENT_TYPES = [{
    key: 'experiences', label: 'Work Experience', icon: '💼'
}

    ,
{
    key: 'education', label: 'Education', icon: '🎓'
}

    ,
{
    key: 'skills', label: 'Skills', icon: '⚡'
}

    ,
{
    key: 'certifications', label: 'Certifications', icon: '📜'
}

    ,
{
    key: 'awards', label: 'Awards', icon: '🏆'
}

    ,
{
    key: 'projects', label: 'Projects', icon: '🚀'
}

    ,
{
    key: 'publications', label: 'Publications', icon: '📚'
}

    ,
{
    key: 'leadership', label: 'Leadership', icon: '👥'
}

    ,
{
    key: 'volunteer', label: 'Volunteer Work', icon: '🤝'
}

    ,
{
    key: 'references', label: 'References', icon: '📋'
}

    ,
{
    key: 'languages', label: 'Languages', icon: '🌍'
}

    ,
];

/**
 * PortfolioContentPicker Component
 * 
 * Allows users to search and select existing portfolio content (experiences, skills, 
 * certifications, etc.) to add to their resume.
 * 
 * Props:
 * - contentType: 'experiences' | 'education' | 'certifications' | 'awards' | 'projects' | 'skills' | 'publications' | 'leadership' | 'volunteer' | 'references' | 'languages'
 * - onSelect: (item) => void - callback when an item is selected
 * - onClose: () => void - callback to close the picker
 * - selectedIds: string[] - already selected item IDs to show as disabled
 * - multiple: boolean - allow multiple selection (default: true)
 * - allowTypeSwitch: boolean - allow switching between content types (default: false)
 */
const PortfolioContentPicker = ({
    contentType: initialContentType,
    onSelect,
    onClose,
    selectedIds = [],
    multiple = true,
    title = 'Add from Portfolio',
    allowTypeSwitch = true
}

) => {
    const [contentType,
        setContentType] = useState(initialContentType);
    const [showTypeDropdown,
        setShowTypeDropdown] = useState(false);
    const [searchQuery,
        setSearchQuery] = useState('');
    const [results,
        setResults] = useState([]);
    const [loading,
        setLoading] = useState(false);
    const [error,
        setError] = useState(null);
    const [pendingSelections,
        setPendingSelections] = useState([]);

    // Debounce search
    const [debouncedQuery,
        setDebouncedQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }

            , 300);
        return () => clearTimeout(timer);
    }

        , [searchQuery]);

    // Get current content type info
    const currentTypeInfo = CONTENT_TYPES.find(t => t.key === contentType) || {
        label: contentType, icon: '📄'
    }

        ;

    // Fetch content on mount and when query changes
    const fetchContent = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let response;

            const searchParam = debouncedQuery.trim() ? `?search=${encodeURIComponent(debouncedQuery)}` : '';

            // Use apiClient.get directly
            response = await apiClient.get(`/api/portfolio-content/${contentType}${searchParam}`);

            // Handle the response format - it returns {success: true, items: [...], total: N}
            setResults(response.items || response.data || []);
        }

        catch (err) {
            console.error('Failed to fetch portfolio content:', err);
            setError('Failed to load content. Please try again.');
            setResults([]);
        }

        finally {
            setLoading(false);
        }
    }

        , [contentType, debouncedQuery]);

    useEffect(() => {
        fetchContent();
    }

        , [fetchContent]);

    // Handle item toggle selection
    const toggleSelection = (item) => {
        const isSelected = pendingSelections.some(s => s.id === item.id);

        if (isSelected) {
            setPendingSelections(pendingSelections.filter(s => s.id !== item.id));
        }

        else {
            if (multiple) {
                setPendingSelections([...pendingSelections, item]);
            }

            else {
                setPendingSelections([item]);
            }
        }
    }

        ;

    // Confirm selection
    const handleConfirm = () => {

        // Transform all items with unique IDs and pass them all at once
        const transformedItems = pendingSelections.map((item, index) => ({
            item: transformItemForResume(item, contentType, index),
            contentType: contentType
        }

        ));

        // Pass all items at once to the parent handler
        onSelect(transformedItems, contentType, true); // true = batch mode
        onClose();
    }

        ;

    // Transform portfolio item to resume format
    const transformItemForResume = (item, type, indexOffset = 0) => {
        // Use timestamp + index offset to ensure unique IDs even in batch operations
        const uniqueId = Date.now() + indexOffset;

        switch (type) {
            case 'experiences': return {
                id: uniqueId,
                sourceId: item.id,
                position: item.position || item.name || '',
                company: item.company || item.employer || '',
                location: item.location || '',
                period: formatPeriod(item.startDate, item.endDate, item.isCurrent),
                startDate: item.startDate,
                endDate: item.endDate,
                isCurrent: item.isCurrent || false,
                description: item.resumeSummary || item.desc || item.description || '',
                responsibilities: parseResponsibilities(item.responsibilities)
            }

                ;

            case 'education': return {
                id: uniqueId,
                sourceId: item.id,
                degree: item.degree || '',
                field: item.field || '',
                institution: item.institution || '',
                location: item.location || '',
                period: formatPeriod(item.startDate, item.endDate, item.isCurrent),
                startDate: item.startDate,
                endDate: item.endDate,
                gpa: item.gpa || '',
                description: item.resumeSummary || item.description || ''
            }

                ;

            case 'certifications': return {
                id: uniqueId,
                sourceId: item.id,
                name: item.name || '',
                issuer: item.issuer || '',
                issueDate: item.issueDate,
                expirationDate: item.expirationDate,
                credentialId: item.credentialId || '',
                credentialUrl: item.credentialUrl || '',
                description: item.resumeSummary || item.description || ''
            }

                ;

            case 'awards': return {
                id: uniqueId,
                sourceId: item.id,
                title: item.title || '',
                issuer: item.issuer || '',
                year: item.year || (item.awardDate ? new Date(item.awardDate).getFullYear() : ''),
                description: item.resumeSummary || item.description || ''
            }

                ;

            case 'projects': return {
                id: uniqueId,
                sourceId: item.id,
                title: item.title || '',
                role: item.role || '',
                period: formatPeriod(item.startDate, item.endDate, item.isCurrent),
                techStack: item.techStack || item.tags || '',
                description: item.resumeSummary || item.description || '',
                url: item.projectLink || item.liveUrl || ''
            }

                ;

            case 'skills': return {
                id: uniqueId,
                sourceId: item.id,
                name: item.name || '',
                category: item.category || '',
                proficiencyLevel: item.proficiencyLevel || 0,
                yearsExperience: item.yearsExperience || 0,
                description: item.resumeSummary || item.description || ''
            }

                ;

            case 'publications': return {
                id: uniqueId,
                sourceId: item.id,
                title: item.title || '',
                venue: item.venue || '',
                year: item.year || '',
                authors: item.authors || '',
                url: item.url || '',
                description: item.resumeSummary || item.abstract || ''
            }

                ;

            case 'leadership': return {
                id: uniqueId,
                sourceId: item.id,
                title: item.title || '',
                organization: item.organization || '',
                role: item.role || '',
                period: formatPeriod(item.startDate, item.endDate, item.isCurrent),
                description: item.resumeSummary || item.description || ''
            }

                ;

            case 'volunteer': return {
                id: uniqueId,
                sourceId: item.id,
                role: item.role || '',
                organization: item.organization || '',
                period: formatPeriod(item.startDate, item.endDate, item.isCurrent),
                description: item.resumeSummary || item.description || ''
            }

                ;

            case 'references': return {
                id: uniqueId,
                sourceId: item.id || item.sourceId,
                sourceSlug: item.sourceSlug || item.slug,
                name: item.name || '',
                title: item.title || '',
                company: item.company || '',
                relationship: item.relationship || '',
                email: item.email || '',
                phone: item.phone || '',
                hasConsent: item.hasConsent || false
            }

                ;

            case 'languages': return {
                id: uniqueId,
                sourceId: item.id,
                language: item.language || '',
                proficiency: item.proficiency || '',
                isNative: item.isNative || false,
                certifications: item.certifications || ''
            }

                ;

            default: return item;
        }
    }

        ;

    // Format date period
    const formatPeriod = (startDate, endDate, isCurrent) => {
        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);

            return d.toLocaleDateString('en-US', {
                month: 'short', year: 'numeric'
            }

            );
        }

            ;

        const start = formatDate(startDate);
        const end = isCurrent ? 'Present' : formatDate(endDate);

        if (!start && !end) return '';

        if (!end || isCurrent) return `${start} - Present`;

        return `${start} - ${end}`;
    }

        ;

    // Parse responsibilities
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
    }

        ;

    // Render item based on content type
    const renderItem = (item) => {
        const isAlreadyAdded = selectedIds.includes(item.id);
        const isPending = pendingSelections.some(s => s.id === item.id);

        return (<div key={
            item.id
        }

            className={`picker-item ${isPending ? 'selected' : ''} ${isAlreadyAdded ? 'disabled' : ''}`}

            onClick={
                () => !isAlreadyAdded && toggleSelection(item)
            }

        > <div className="item-checkbox"> {
            isAlreadyAdded ? (<FiCheck className="already-added" />) : isPending ? (<FiCheck className="checked" />) : (<div className="unchecked" />)
        }

            </div> <div className="item-content"> {
                renderItemContent(item)
            }

            </div> </div>);
    }

        ;

    // Render item content based on type
    const renderItemContent = (item) => {
        switch (contentType) {
            case 'experiences': return (<> <div className="item-title"> {
                item.position || item.name
            }

            </div> <div className="item-subtitle"> {
                item.company
            }

                </div> <div className="item-meta"> {
                    formatPeriod(item.startDate, item.endDate, item.isCurrent)
                }

                    {item.location && ` • ${item.location}`}

                </div> {
                    item.resumeSummary && <div className="item-summary"> {
                        item.resumeSummary
                    }

                    </div>
                }

            </>);

            case 'education': return (<> <div className="item-title"> {
                item.degree
            }

                in {
                    item.field
                }

            </div> <div className="item-subtitle"> {
                item.institution
            }

                </div> <div className="item-meta"> {
                    formatPeriod(item.startDate, item.endDate, item.isCurrent)
                }

                    {item.gpa && ` • GPA: ${item.gpa}`}

                </div> </>);

            case 'certifications': return (<> <div className="item-title"> {
                item.name
            }

            </div> <div className="item-subtitle"> {
                item.issuer
            }

                </div> <div className="item-meta"> {
                    item.issueDate && new Date(item.issueDate).getFullYear()
                }

                    {item.credentialId && ` • ID: ${item.credentialId}`}

                </div> </>);

            case 'awards': return (<> <div className="item-title"> {
                item.title
            }

            </div> <div className="item-subtitle"> {
                item.issuer
            }

                </div> <div className="item-meta"> {
                    item.year
                }

                </div> </>);

            case 'projects': return (<> <div className="item-title"> {
                item.title
            }

            </div> <div className="item-subtitle"> {
                item.role
            }

                </div> <div className="item-meta"> {
                    item.techStack || item.tags
                }

                    {
                        item.projectLink && (<a href={
                            item.projectLink
                        }

                            target="_blank" rel="noopener noreferrer" onClick={
                                e => e.stopPropagation()
                            }

                        > <FiExternalLink /> </a>)
                    }

                </div> </>);

            case 'skills': return (<> <div className="item-title"> {
                item.name
            }

            </div> <div className="item-subtitle"> {
                item.category
            }

                </div> <div className="item-meta"> {item.proficiencyLevel && `Level: ${item.proficiencyLevel}/10`}

                    {item.yearsExperience && ` • ${item.yearsExperience} years`}

                </div> </>);

            case 'publications': return (<> <div className="item-title"> {
                item.title
            }

            </div> <div className="item-subtitle"> {
                item.venue
            }

                </div> <div className="item-meta"> {
                    item.year
                }

                    {item.authors && ` • ${item.authors}`}

                </div> </>);

            case 'leadership': return (<> <div className="item-title"> {
                item.title
            }

            </div> <div className="item-subtitle"> {
                item.organization
            }

                </div> <div className="item-meta"> {
                    item.role
                }

                    {
                        formatPeriod(item.startDate, item.endDate, item.isCurrent)
                    }

                </div> </>);

            case 'volunteer': return (<> <div className="item-title"> {
                item.role
            }

            </div> <div className="item-subtitle"> {
                item.organization
            }

                </div> <div className="item-meta"> {
                    formatPeriod(item.startDate, item.endDate, item.isCurrent)
                }

                </div> </>);

            case 'references': return (<> <div className="item-title"> {
                item.name
            }

            </div> <div className="item-subtitle"> {
                item.title
            }

                    at {
                        item.company
                    }

                </div> <div className="item-meta"> {
                    item.relationship
                }

                    {
                        item.hasConsent && ' ✓ Has consent'
                    }

                </div> </>);

            case 'languages': return (<> <div className="item-title"> {
                item.language
            }

            </div> <div className="item-subtitle"> {
                item.proficiency
            }

                </div> <div className="item-meta"> {
                    item.isNative && 'Native • '
                }

                    {
                        item.certifications
                    }

                </div> </>);

            default: return (<div className="item-title"> {
                item.name || item.title || 'Unknown'
            }

            </div>);
        }
    }

        ;

    // Get content type label
    const getContentTypeLabel = () => {
        const labels = {
            experiences: 'Work Experience',
            education: 'Education',
            certifications: 'Certifications',
            awards: 'Awards',
            projects: 'Projects',
            skills: 'Skills',
            publications: 'Publications',
            leadership: 'Leadership',
            volunteer: 'Volunteer Work',
            references: 'References',
            languages: 'Languages'
        }

            ;
        return labels[contentType] || contentType;
    }

        ;

    return (<div className="portfolio-content-picker-overlay" onClick={
        onClose
    }

    > <div className="portfolio-content-picker" onClick={
        e => e.stopPropagation()
    }

    > <div className="picker-header"> <div className="header-title-row"> <h3> {
        title
    }

    </h3> {
            allowTypeSwitch ? (<div className="type-switcher"> <button className="type-dropdown-btn"

                onClick={
                    () => setShowTypeDropdown(!showTypeDropdown)
                }

            > <span className="type-icon"> {
                currentTypeInfo.icon
            }

                </span> <span className="type-label"> {
                    currentTypeInfo.label
                }

                </span> <FiChevronDown className={`dropdown-arrow ${showTypeDropdown ? 'open' : ''}`}

                /> </button> {
                    showTypeDropdown && (<div className="type-dropdown-menu"> {
                        CONTENT_TYPES.map(type => (<button key={
                            type.key
                        }

                            className={`type-option ${contentType === type.key ? 'active' : ''}`}

                            onClick={
                                () => {
                                    setContentType(type.key);
                                    setShowTypeDropdown(false);
                                    setSearchQuery('');
                                }
                            }

                        > <span className="type-icon"> {
                            type.icon
                        }

                            </span> <span className="type-label"> {
                                type.label
                            }

                            </span> {
                                contentType === type.key && <FiCheck className="check-icon" />
                            }

                        </button>))
                    }

                    </div>)
                }

            </div>) : (<span className="content-type-badge"> <span className="type-icon"> {
                currentTypeInfo.icon
            }

            </span> <span className="type-label"> {
                currentTypeInfo.label
            }

                </span> </span>)
        }

    </div> <button className="close-btn" onClick={
        onClose
    }

    > <FiX /> </button> </div> <div className="picker-search"> <FiSearch className="search-icon" /> <input type="text"

        placeholder={`Search ${currentTypeInfo.label.toLowerCase()}...`}

        value={
            searchQuery
        }

        onChange={
            e => setSearchQuery(e.target.value)
        }

        autoFocus /> </div> <div className="picker-content"> {
            loading ? (<div className="picker-loading"> <FiLoader className="spinner" /> <span>Loading...</span> </div>) : error ? (<div className="picker-error"> <span> {
                error
            }

            </span> <button onClick={
                fetchContent
            }

            >Retry</button> </div>) : results.length === 0 ? (<div className="picker-empty"> <span>No {
                currentTypeInfo.label.toLowerCase()
            }

                found.</span> {
                    searchQuery && <span>Try a different search term.</span>
                }

            </div>) : (<div className="picker-items"> {
                results.map(item => renderItem(item))
            }

            </div>)
        }

            </div> <div className="picker-footer"> <span className="selection-count"> {
                pendingSelections.length
            }

                item {
                    pendingSelections.length !== 1 ? 's' : ''
                }

                selected </span> <div className="picker-actions"> <button className="btn btn-secondary" onClick={
                    onClose
                }

                > Cancel </button> <button className="btn btn-primary"

                    onClick={
                        handleConfirm
                    }

                    disabled={
                        pendingSelections.length === 0
                    }

                > <FiPlus /> Add Selected </button> </div> </div> </div> </div>);
}

    ;

export default PortfolioContentPicker;