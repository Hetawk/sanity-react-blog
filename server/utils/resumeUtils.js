/**
 * Resume Utilities - DRY principle modular functions
 * Common utilities for resume operations across the application
 */

const crypto = require('crypto');

// ============================================
// SLUG & LINK GENERATION
// ============================================

/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The title to slugify
 * @returns {string} URL-friendly slug
 */
const generateSlug = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

/**
 * Generate a unique slug with timestamp suffix
 * @param {string} title - The title to slugify
 * @returns {string} Unique URL-friendly slug
 */
const generateUniqueSlug = (title) => {
    const baseSlug = generateSlug(title);
    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
};

/**
 * Generate a shareable link token
 * @param {number} length - Length of the token
 * @returns {string} Random shareable link
 */
const generateShareableLink = (length = 32) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// ============================================
// JSON PARSING & HANDLING
// ============================================

/**
 * Safely parse JSON string to object
 * @param {string|null} jsonString - JSON string to parse
 * @param {any} defaultValue - Default value if parsing fails
 * @returns {any} Parsed object or default value
 */
const safeParseJSON = (jsonString, defaultValue = []) => {
    if (!jsonString) return defaultValue;
    try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (error) {
        console.warn('JSON parse error:', error.message);
        return defaultValue;
    }
};

/**
 * Safely stringify object to JSON
 * @param {any} value - Value to stringify
 * @returns {string|null} JSON string or null
 */
const safeStringifyJSON = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    try {
        return JSON.stringify(value);
    } catch (error) {
        console.warn('JSON stringify error:', error.message);
        return null;
    }
};

// ============================================
// DATE FORMATTING BY COUNTRY
// ============================================

const DATE_FORMATS = {
    US: { format: 'MM/DD/YYYY', locale: 'en-US' },
    UK: { format: 'DD/MM/YYYY', locale: 'en-GB' },
    DE: { format: 'DD.MM.YYYY', locale: 'de-DE' },
    CA: { format: 'YYYY-MM-DD', locale: 'en-CA' },
    AU: { format: 'DD/MM/YYYY', locale: 'en-AU' },
    CN: { format: 'YYYY年MM月DD日', locale: 'zh-CN' },
};

/**
 * Format date according to country standards
 * @param {Date|string} date - Date to format
 * @param {string} countryCode - Country code (US, UK, DE, etc.)
 * @returns {string} Formatted date string
 */
const formatDateByCountry = (date, countryCode = 'US') => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';

    const config = DATE_FORMATS[countryCode] || DATE_FORMATS.US;

    try {
        return dateObj.toLocaleDateString(config.locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch (error) {
        return dateObj.toISOString().split('T')[0];
    }
};

/**
 * Format date range for resume display
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date (null if current)
 * @param {boolean} isCurrent - Is current position
 * @param {string} countryCode - Country code
 * @returns {string} Formatted date range
 */
const formatDateRange = (startDate, endDate, isCurrent = false, countryCode = 'US') => {
    const start = formatDateByCountry(startDate, countryCode);
    if (!start) return '';

    if (isCurrent) {
        return `${start} - Present`;
    }

    const end = formatDateByCountry(endDate, countryCode);
    return end ? `${start} - ${end}` : start;
};

// ============================================
// CONTENT TRANSFORMATION
// ============================================

/**
 * Transform portfolio content for resume use
 * Uses resumeSummary if available, otherwise truncates full description
 * @param {object} item - Portfolio item (experience, award, etc.)
 * @param {number} maxLength - Max length for description
 * @returns {object} Transformed item for resume
 */
const transformForResume = (item, maxLength = 200) => {
    if (!item) return null;

    // Use resumeSummary if available, otherwise truncate description
    const description = item.resumeSummary || truncateText(item.description || item.desc || '', maxLength);

    return {
        ...item,
        resumeDescription: description,
        originalDescription: item.description || item.desc || null,
    };
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '...';
};

// ============================================
// PORTFOLIO CONTENT MAPPERS
// ============================================

/**
 * Map WorkExperience to resume experience format
 * @param {object} workExp - WorkExperience record
 * @param {string} countryCode - Country code for date formatting
 * @returns {object} Resume-formatted experience
 */
const mapWorkExperienceToResume = (workExp, countryCode = 'US') => {
    if (!workExp) return null;

    return {
        id: workExp.id,
        sourceId: workExp.id,
        sourceType: 'WorkExperience',
        position: workExp.position || workExp.name,
        company: workExp.company,
        location: workExp.location,
        period: formatDateRange(workExp.startDate, workExp.endDate, workExp.isCurrent, countryCode),
        startDate: workExp.startDate,
        endDate: workExp.endDate,
        isCurrent: workExp.isCurrent,
        description: workExp.resumeSummary || truncateText(workExp.desc, 300),
        fullDescription: workExp.desc,
        responsibilities: safeParseJSON(workExp.responsibilities, []),
        achievements: safeParseJSON(workExp.achievements, []),
        skills: safeParseJSON(workExp.skills, []),
    };
};

/**
 * Map Education to resume education format
 * @param {object} edu - Education record
 * @param {string} countryCode - Country code for date formatting
 * @returns {object} Resume-formatted education
 */
const mapEducationToResume = (edu, countryCode = 'US') => {
    if (!edu) return null;

    return {
        id: edu.id,
        sourceId: edu.id,
        sourceType: 'Education',
        degree: edu.degree,
        field: edu.field,
        institution: edu.institution,
        location: edu.location,
        period: formatDateRange(edu.startDate, edu.endDate, edu.isCurrent, countryCode),
        startDate: edu.startDate,
        endDate: edu.endDate,
        isCurrent: edu.isCurrent,
        description: edu.resumeSummary || truncateText(edu.description, 200),
        gpa: edu.gpa,
        honors: edu.honors,
    };
};

/**
 * Map Certification to resume certification format
 * @param {object} cert - Certification record
 * @param {string} countryCode - Country code for date formatting
 * @returns {object} Resume-formatted certification
 */
const mapCertificationToResume = (cert, countryCode = 'US') => {
    if (!cert) return null;

    return {
        id: cert.id,
        sourceId: cert.id,
        sourceType: 'Certification',
        name: cert.name,
        issuer: cert.issuer,
        date: formatDateByCountry(cert.issueDate, countryCode),
        issueDate: cert.issueDate,
        expirationDate: cert.expirationDate,
        credentialId: cert.credentialId,
        credentialUrl: cert.credentialUrl,
        description: cert.resumeSummary || truncateText(cert.description, 150),
    };
};

/**
 * Map Award to resume award format
 * @param {object} award - Award record
 * @param {string} countryCode - Country code for date formatting
 * @returns {object} Resume-formatted award
 */
const mapAwardToResume = (award, countryCode = 'US') => {
    if (!award) return null;

    return {
        id: award.id,
        sourceId: award.id,
        sourceType: 'Award',
        name: award.title,
        issuer: award.issuer,
        date: award.year || formatDateByCountry(award.awardDate, countryCode),
        description: award.resumeSummary || truncateText(award.description, 150),
        link: award.link,
    };
};

/**
 * Map Work (Project) to resume project format
 * @param {object} work - Work record
 * @returns {object} Resume-formatted project
 */
const mapProjectToResume = (work) => {
    if (!work) return null;

    return {
        id: work.id,
        sourceId: work.id,
        sourceType: 'Work',
        name: work.title,
        description: work.resumeSummary || truncateText(work.description, 200),
        technologies: safeParseJSON(work.techStack, work.tags?.split(',') || []),
        url: work.projectLink || work.githubUrl,
        role: work.role,
    };
};

/**
 * Map Skill to resume skill format
 * @param {object} skill - Skill record
 * @returns {object} Resume-formatted skill
 */
const mapSkillToResume = (skill) => {
    if (!skill) return null;

    return {
        id: skill.id,
        sourceId: skill.id,
        sourceType: 'Skill',
        name: skill.name,
        category: skill.category,
        level: skill.proficiencyLevel,
        years: skill.yearsExperience,
        description: skill.resumeSummary || skill.description,
    };
};

/**
 * Map Publication to resume publication format
 * @param {object} pub - Publication record
 * @returns {object} Resume-formatted publication
 */
const mapPublicationToResume = (pub) => {
    if (!pub) return null;

    return {
        id: pub.id,
        sourceId: pub.id,
        sourceType: 'Publication',
        title: pub.title,
        venue: pub.venue,
        year: pub.year,
        authors: pub.authors,
        description: pub.resumeSummary || truncateText(pub.abstract, 200),
        doi: pub.doi,
        url: pub.pdfUrl || pub.arxivUrl,
    };
};

/**
 * Map Leadership to resume leadership format
 * @param {object} lead - Leadership record
 * @param {string} countryCode - Country code for date formatting
 * @returns {object} Resume-formatted leadership
 */
const mapLeadershipToResume = (lead, countryCode = 'US') => {
    if (!lead) return null;

    return {
        id: lead.id,
        sourceId: lead.id,
        sourceType: 'Leadership',
        title: lead.title,
        organization: lead.organization,
        role: lead.role,
        period: formatDateRange(lead.startDate, lead.endDate, lead.isCurrent, countryCode),
        description: lead.resumeSummary || truncateText(lead.description, 200),
    };
};

/**
 * Map VolunteerWork to resume volunteer format
 * @param {object} vol - VolunteerWork record
 * @param {string} countryCode - Country code for date formatting
 * @returns {object} Resume-formatted volunteer work
 */
const mapVolunteerToResume = (vol, countryCode = 'US') => {
    if (!vol) return null;

    return {
        id: vol.id,
        sourceId: vol.id,
        sourceType: 'VolunteerWork',
        role: vol.role,
        organization: vol.organization,
        location: vol.location,
        period: formatDateRange(vol.startDate, vol.endDate, vol.isCurrent, countryCode),
        description: vol.resumeSummary || truncateText(vol.description, 150),
    };
};

/**
 * Map Reference to resume reference format
 * @param {object} ref - Reference record
 * @returns {object} Resume-formatted reference
 */
const mapReferenceToResume = (ref) => {
    if (!ref) return null;

    return {
        id: ref.id,
        sourceId: ref.id, // UUID for database operations
        sourceSlug: ref.slug, // Human-readable slug for display/fallback
        sourceType: 'Reference',
        name: ref.name,
        title: ref.title,
        company: ref.company,
        email: ref.email,
        phone: ref.phone,
        linkedin: ref.linkedin,
        relationship: ref.relationship,
        relationshipType: ref.relationshipType,
        context: ref.company_context,
        hasConsent: ref.hasConsent,
    };
};

/**
 * Map LanguageProficiency to resume language format
 * @param {object} lang - LanguageProficiency record
 * @returns {object} Resume-formatted language
 */
const mapLanguageToResume = (lang) => {
    if (!lang) return null;

    return {
        id: lang.id,
        sourceId: lang.id,
        sourceType: 'LanguageProficiency',
        language: lang.language,
        level: lang.level,
        reading: lang.reading,
        writing: lang.writing,
        speaking: lang.speaking,
        listening: lang.listening,
    };
};

// ============================================
// COUNTRY CONFIGURATION
// ============================================

const COUNTRY_CONFIGS = {
    US: {
        code: 'US',
        name: 'United States',
        preferredLength: 1,
        dateFormat: 'MM/DD/YYYY',
        photoRequired: false,
        sections: ['summary', 'experience', 'education', 'skills', 'certifications', 'projects'],
        tips: [
            'Keep to 1 page if possible (2 for 10+ years experience)',
            'Use action verbs and quantifiable achievements',
            'ATS-friendly formatting recommended',
            'No photo, age, or marital status',
        ],
    },
    UK: {
        code: 'UK',
        name: 'United Kingdom',
        preferredLength: 2,
        dateFormat: 'DD/MM/YYYY',
        photoRequired: false,
        sections: ['profile', 'experience', 'education', 'skills', 'interests'],
        tips: [
            'CV typically 2 pages',
            'Include personal profile/statement',
            'References available upon request',
            'No photo required',
        ],
    },
    DE: {
        code: 'DE',
        name: 'Germany',
        preferredLength: 2,
        dateFormat: 'DD.MM.YYYY',
        photoRequired: true,
        sections: ['personal', 'experience', 'education', 'skills', 'certifications', 'languages'],
        tips: [
            'Lebenslauf (CV) format preferred',
            'Professional photo required',
            'Include date of birth and nationality',
            'Chronological order (most recent first)',
            'Sign and date the CV',
        ],
    },
    CA: {
        code: 'CA',
        name: 'Canada',
        preferredLength: 2,
        dateFormat: 'YYYY-MM-DD',
        photoRequired: false,
        sections: ['summary', 'experience', 'education', 'skills', 'volunteer'],
        tips: [
            'Similar to US format',
            '1-2 pages preferred',
            'Include volunteer work',
            'Bilingual (French/English) may be required',
            'No photo or personal information',
        ],
    },
    AU: {
        code: 'AU',
        name: 'Australia',
        preferredLength: 2,
        dateFormat: 'DD/MM/YYYY',
        photoRequired: false,
        sections: ['profile', 'experience', 'education', 'skills', 'referees'],
        tips: [
            '2-3 pages acceptable',
            'Include referees section',
            'Cover letter often required',
            'Emphasize achievements',
            'No photo required',
        ],
    },
    CN: {
        code: 'CN',
        name: 'China',
        preferredLength: 1,
        dateFormat: 'YYYY年MM月DD日',
        photoRequired: true,
        sections: ['personal', 'education', 'experience', 'skills', 'certifications', 'languages'],
        tips: [
            '1 page preferred for junior roles',
            'Photo required (formal, passport-style)',
            'Include personal details (age, gender, marital status)',
            'Education often listed before experience',
            'Include political affiliations if relevant',
            'CET-4/CET-6 English scores important',
        ],
    },
};

/**
 * Get country configuration
 * @param {string} countryCode - Country code
 * @returns {object} Country configuration
 */
const getCountryConfig = (countryCode) => {
    return COUNTRY_CONFIGS[countryCode] || COUNTRY_CONFIGS.US;
};

/**
 * Get all country configurations
 * @returns {object} All country configurations
 */
const getAllCountryConfigs = () => {
    return COUNTRY_CONFIGS;
};

// ============================================
// RESUME TYPE CONFIGURATIONS
// ============================================

const RESUME_TYPES = {
    professional: {
        name: 'Professional',
        description: 'Work-focused resume for professional roles',
        sections: ['summary', 'experience', 'skills', 'education', 'certifications'],
    },
    academic: {
        name: 'Academic',
        description: 'Education-focused CV for academic/research positions',
        sections: ['education', 'research', 'publications', 'experience', 'skills', 'awards'],
    },
    hybrid: {
        name: 'Hybrid',
        description: 'Combination of professional and academic formats',
        sections: ['summary', 'experience', 'education', 'publications', 'skills', 'projects'],
    },
    technical: {
        name: 'Technical',
        description: 'Skills-focused resume for technical roles',
        sections: ['skills', 'experience', 'projects', 'certifications', 'education'],
    },
    creative: {
        name: 'Creative',
        description: 'Portfolio-focused resume for creative roles',
        sections: ['portfolio', 'experience', 'skills', 'education', 'awards'],
    },
};

/**
 * Get resume type configuration
 * @param {string} typeName - Type name
 * @returns {object} Resume type configuration
 */
const getResumeTypeConfig = (typeName) => {
    return RESUME_TYPES[typeName.toLowerCase()] || RESUME_TYPES.professional;
};

module.exports = {
    // Slug & Link Generation
    generateSlug,
    generateUniqueSlug,
    generateShareableLink,

    // JSON Handling
    safeParseJSON,
    safeStringifyJSON,

    // Date Formatting
    DATE_FORMATS,
    formatDateByCountry,
    formatDateRange,

    // Content Transformation
    transformForResume,
    truncateText,

    // Portfolio Content Mappers
    mapWorkExperienceToResume,
    mapEducationToResume,
    mapCertificationToResume,
    mapAwardToResume,
    mapProjectToResume,
    mapSkillToResume,
    mapPublicationToResume,
    mapLeadershipToResume,
    mapVolunteerToResume,
    mapReferenceToResume,
    mapLanguageToResume,

    // Country Configuration
    COUNTRY_CONFIGS,
    getCountryConfig,
    getAllCountryConfigs,

    // Resume Types
    RESUME_TYPES,
    getResumeTypeConfig,
};
