/**
 * Portfolio Content Service
 * Service for searching and managing portfolio content for resume integration
 * Follows DRY principle with reusable query builders
 */

const { PrismaClient } = require('@prisma/client');
const resumeUtils = require('../utils/resumeUtils');

const prisma = new PrismaClient();

// ============================================
// BASE QUERY BUILDERS (DRY)
// ============================================

/**
 * Build common where clause for published content
 * @param {object} options - Query options
 * @returns {object} Prisma where clause
 */
const buildPublishedWhere = (options = {}) => {
    const { includeUnpublished = false, search = '' } = options;

    const where = {
        deletedAt: null,
    };

    if (!includeUnpublished) {
        where.isPublished = true;
    }

    return where;
};

/**
 * Build search conditions for a model
 * @param {string} search - Search term
 * @param {string[]} fields - Fields to search
 * @returns {object[]} Prisma OR conditions
 */
const buildSearchConditions = (search, fields) => {
    if (!search) return [];

    return fields.map(field => ({
        [field]: { contains: search },
    }));
};

/**
 * Build pagination options
 * @param {object} options - Query options
 * @returns {object} Prisma pagination
 */
const buildPagination = (options = {}) => {
    const { skip = 0, take = 50 } = options;
    return { skip: parseInt(skip), take: parseInt(take) };
};

// ============================================
// WORK EXPERIENCE SEARCH
// ============================================

/**
 * Search work experiences for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchWorkExperiences = async (options = {}) => {
    const { search = '', countryCode = 'US' } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['name', 'company', 'position', 'desc']) : undefined,
    };

    // Remove OR if empty
    if (!where.OR?.length) delete where.OR;

    const items = await prisma.workExperience.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { startDate: 'desc' },
            { displayOrder: 'asc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapWorkExperienceToResume(item, countryCode)),
        total: await prisma.workExperience.count({ where }),
    };
};

// ============================================
// EDUCATION SEARCH
// ============================================

/**
 * Search education records for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchEducation = async (options = {}) => {
    const { search = '', countryCode = 'US' } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['degree', 'field', 'institution', 'description']) : undefined,
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.education.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { startDate: 'desc' },
            { displayOrder: 'asc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapEducationToResume(item, countryCode)),
        total: await prisma.education.count({ where }),
    };
};

// ============================================
// CERTIFICATIONS SEARCH
// ============================================

/**
 * Search certifications for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchCertifications = async (options = {}) => {
    const { search = '', countryCode = 'US' } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['name', 'issuer', 'description', 'category']) : undefined,
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.certification.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { issueDate: 'desc' },
            { displayOrder: 'asc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapCertificationToResume(item, countryCode)),
        total: await prisma.certification.count({ where }),
    };
};

// ============================================
// AWARDS SEARCH
// ============================================

/**
 * Search awards for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchAwards = async (options = {}) => {
    const { search = '', countryCode = 'US' } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['title', 'issuer', 'description', 'category']) : undefined,
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.award.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { year: 'desc' },
            { displayOrder: 'asc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapAwardToResume(item, countryCode)),
        total: await prisma.award.count({ where }),
    };
};

// ============================================
// PROJECTS (WORKS) SEARCH
// ============================================

/**
 * Search projects/works for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchProjects = async (options = {}) => {
    const { search = '' } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['title', 'description', 'category', 'techStack']) : undefined,
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.work.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { displayOrder: 'asc' },
            { createdAt: 'desc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapProjectToResume(item)),
        total: await prisma.work.count({ where }),
    };
};

// ============================================
// SKILLS SEARCH
// ============================================

/**
 * Search skills for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchSkills = async (options = {}) => {
    const { search = '', category = '' } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['name', 'description', 'category']) : undefined,
        ...(category && { category }),
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.skill.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { proficiencyLevel: 'desc' },
            { displayOrder: 'asc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapSkillToResume(item)),
        total: await prisma.skill.count({ where }),
    };
};

// ============================================
// PUBLICATIONS SEARCH
// ============================================

/**
 * Search publications for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchPublications = async (options = {}) => {
    const { search = '' } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['title', 'abstract', 'venue', 'authors']) : undefined,
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.publication.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { year: 'desc' },
            { displayOrder: 'asc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapPublicationToResume(item)),
        total: await prisma.publication.count({ where }),
    };
};

// ============================================
// LEADERSHIP SEARCH
// ============================================

/**
 * Search leadership roles for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchLeadership = async (options = {}) => {
    const { search = '', countryCode = 'US' } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['title', 'organization', 'description', 'role']) : undefined,
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.leadership.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { startDate: 'desc' },
            { displayOrder: 'asc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapLeadershipToResume(item, countryCode)),
        total: await prisma.leadership.count({ where }),
    };
};

// ============================================
// VOLUNTEER WORK SEARCH
// ============================================

/**
 * Search volunteer work for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchVolunteerWork = async (options = {}) => {
    const { search = '', countryCode = 'US' } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['role', 'organization', 'description', 'category']) : undefined,
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.volunteerWork.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { startDate: 'desc' },
            { displayOrder: 'asc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapVolunteerToResume(item, countryCode)),
        total: await prisma.volunteerWork.count({ where }),
    };
};

// ============================================
// REFERENCES SEARCH
// ============================================

/**
 * Search references for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchReferences = async (options = {}) => {
    const { search = '', consentOnly = false } = options;

    const where = {
        ...buildPublishedWhere(options),
        OR: search ? buildSearchConditions(search, ['name', 'title', 'company', 'relationship']) : undefined,
        ...(consentOnly && { hasConsent: true }),
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.reference.findMany({
        where,
        orderBy: [
            { isFeatured: 'desc' },
            { displayOrder: 'asc' },
        ],
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapReferenceToResume(item)),
        total: await prisma.reference.count({ where }),
    };
};

// ============================================
// LANGUAGES SEARCH
// ============================================

/**
 * Search language proficiencies for resume
 * @param {object} options - Search options
 * @returns {Promise<object>} Search results
 */
const searchLanguages = async (options = {}) => {
    const { search = '' } = options;

    const where = {
        isPublished: true,
        OR: search ? buildSearchConditions(search, ['language', 'level']) : undefined,
    };

    if (!where.OR?.length) delete where.OR;

    const items = await prisma.languageProficiency.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        ...buildPagination(options),
    });

    return {
        items: items.map(item => resumeUtils.mapLanguageToResume(item)),
        total: await prisma.languageProficiency.count({ where }),
    };
};

// ============================================
// UNIFIED SEARCH
// ============================================

/**
 * Search all content types at once
 * @param {object} options - Search options
 * @returns {Promise<object>} Combined search results
 */
const searchAllContent = async (options = {}) => {
    const { search = '', types = [], countryCode = 'US' } = options;

    const searchOptions = { ...options, search, countryCode };

    // Default to all types if none specified
    const searchTypes = types.length > 0 ? types : [
        'experience', 'education', 'certifications', 'awards',
        'projects', 'skills', 'publications', 'leadership',
        'volunteer', 'references', 'languages'
    ];

    const results = {};

    const searchFunctions = {
        experience: searchWorkExperiences,
        education: searchEducation,
        certifications: searchCertifications,
        awards: searchAwards,
        projects: searchProjects,
        skills: searchSkills,
        publications: searchPublications,
        leadership: searchLeadership,
        volunteer: searchVolunteerWork,
        references: searchReferences,
        languages: searchLanguages,
    };

    // Execute searches in parallel
    await Promise.all(
        searchTypes.map(async (type) => {
            if (searchFunctions[type]) {
                results[type] = await searchFunctions[type](searchOptions);
            }
        })
    );

    return results;
};

// ============================================
// GET BY IDs (For populating resume)
// ============================================

/**
 * Get multiple items by IDs
 * @param {string} model - Model name
 * @param {string[]} ids - Array of IDs
 * @returns {Promise<object[]>} Items
 */
const getItemsByIds = async (model, ids) => {
    if (!ids || !ids.length) return [];

    const modelMap = {
        workExperience: prisma.workExperience,
        education: prisma.education,
        certification: prisma.certification,
        award: prisma.award,
        work: prisma.work,
        skill: prisma.skill,
        publication: prisma.publication,
        leadership: prisma.leadership,
        volunteerWork: prisma.volunteerWork,
        reference: prisma.reference,
        languageProficiency: prisma.languageProficiency,
    };

    const prismaModel = modelMap[model];
    if (!prismaModel) return [];

    return prismaModel.findMany({
        where: {
            id: { in: ids },
            deletedAt: null,
        },
    });
};

/**
 * Get all linked content for a resume
 * @param {object} resume - Resume with linked* fields
 * @param {string} countryCode - Country code for date formatting
 * @returns {Promise<object>} Populated content
 */
const getLinkedContent = async (resume, countryCode = 'US') => {
    const parseIds = (jsonString) => resumeUtils.safeParseJSON(jsonString, []);

    const [
        experiences,
        education,
        projects,
        awards,
        publications,
        leadership,
        skills,
        certifications,
        references,
        volunteer,
        languages,
    ] = await Promise.all([
        getItemsByIds('workExperience', parseIds(resume.linkedExperiences)),
        getItemsByIds('education', parseIds(resume.linkedEducation)),
        getItemsByIds('work', parseIds(resume.linkedProjects)),
        getItemsByIds('award', parseIds(resume.linkedAwards)),
        getItemsByIds('publication', parseIds(resume.linkedPublications)),
        getItemsByIds('leadership', parseIds(resume.linkedLeadership)),
        getItemsByIds('skill', parseIds(resume.linkedSkills)),
        getItemsByIds('certification', parseIds(resume.linkedCertifications)),
        getItemsByIds('reference', parseIds(resume.linkedReferences)),
        getItemsByIds('volunteerWork', parseIds(resume.linkedVolunteer)),
        getItemsByIds('languageProficiency', parseIds(resume.linkedLanguages)),
    ]);

    return {
        experiences: experiences.map(e => resumeUtils.mapWorkExperienceToResume(e, countryCode)),
        education: education.map(e => resumeUtils.mapEducationToResume(e, countryCode)),
        projects: projects.map(p => resumeUtils.mapProjectToResume(p)),
        awards: awards.map(a => resumeUtils.mapAwardToResume(a, countryCode)),
        publications: publications.map(p => resumeUtils.mapPublicationToResume(p)),
        leadership: leadership.map(l => resumeUtils.mapLeadershipToResume(l, countryCode)),
        skills: skills.map(s => resumeUtils.mapSkillToResume(s)),
        certifications: certifications.map(c => resumeUtils.mapCertificationToResume(c, countryCode)),
        references: references.map(r => resumeUtils.mapReferenceToResume(r)),
        volunteer: volunteer.map(v => resumeUtils.mapVolunteerToResume(v, countryCode)),
        languages: languages.map(l => resumeUtils.mapLanguageToResume(l)),
    };
};

module.exports = {
    // Individual searches
    searchWorkExperiences,
    searchEducation,
    searchCertifications,
    searchAwards,
    searchProjects,
    searchSkills,
    searchPublications,
    searchLeadership,
    searchVolunteerWork,
    searchReferences,
    searchLanguages,

    // Unified search
    searchAllContent,

    // Get by IDs
    getItemsByIds,
    getLinkedContent,
};
