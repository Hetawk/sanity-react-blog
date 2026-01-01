const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * Resume Service - Comprehensive management of resumes with templates
 * Supports multiple countries, resume types, and templating system
 */
const resumeService = {
    // ==================== COUNTRIES ====================

    /**
     * Get all available countries
     */
    getAllCountries: async (activeOnly = false) => {
        try {
            const countries = await prisma.resumeCountry.findMany({
                where: activeOnly ? { isActive: true } : {},
                orderBy: { displayOrder: 'asc' },
                include: {
                    templates: {
                        where: { isActive: true },
                        select: { id: true, name: true, isActive: true }
                    }
                }
            });
            return countries;
        } catch (error) {
            throw new Error(`Failed to fetch countries: ${error.message}`);
        }
    },

    /**
     * Get single country by code
     */
    getCountryByCode: async (code) => {
        try {
            const country = await prisma.resumeCountry.findUnique({
                where: { code: code.toUpperCase() },
                include: {
                    templates: {
                        where: { isActive: true },
                        orderBy: { displayOrder: 'asc' }
                    }
                }
            });
            return country;
        } catch (error) {
            throw new Error(`Failed to fetch country: ${error.message}`);
        }
    },

    /**
     * Create a new country
     */
    createCountry: async (data) => {
        try {
            const country = await prisma.resumeCountry.create({
                data: {
                    code: data.code.toUpperCase(),
                    name: data.name,
                    description: data.description,
                    guidelines: data.guidelines,
                    dateFormat: data.dateFormat,
                    preferredLength: data.preferredLength,
                    keyHighlights: data.keyHighlights
                }
            });
            return country;
        } catch (error) {
            throw new Error(`Failed to create country: ${error.message}`);
        }
    },

    // ==================== RESUME TYPES ====================

    /**
     * Get all resume types
     */
    getAllResumeTypes: async () => {
        try {
            const types = await prisma.resumeType.findMany({
                where: { isActive: true },
                include: {
                    templates: {
                        select: { id: true, name: true }
                    }
                }
            });
            return types;
        } catch (error) {
            throw new Error(`Failed to fetch resume types: ${error.message}`);
        }
    },

    /**
     * Create a new resume type
     */
    createResumeType: async (data) => {
        try {
            const type = await prisma.resumeType.create({
                data: {
                    name: data.name,
                    description: data.description,
                    sections: JSON.stringify(data.sections || []),
                    guidelines: data.guidelines
                }
            });
            return type;
        } catch (error) {
            throw new Error(`Failed to create resume type: ${error.message}`);
        }
    },

    // ==================== TEMPLATES ====================

    /**
     * Get all templates with filtering
     */
    getAllTemplates: async (filters = {}) => {
        try {
            const {
                countryId,
                typeId,
                activeOnly = true,
                featured = false,
                skip = 0,
                take = 10
            } = filters;

            const where = {};
            if (activeOnly) where.isActive = true;
            if (featured) where.isFeatured = true;
            if (countryId) where.countryId = countryId;
            if (typeId) where.typeId = typeId;

            const [templates, total] = await Promise.all([
                prisma.resumeTemplate.findMany({
                    where,
                    include: {
                        country: true,
                        type: true
                    },
                    orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
                    skip: parseInt(skip),
                    take: parseInt(take)
                }),
                prisma.resumeTemplate.count({ where })
            ]);

            return {
                data: templates,
                total,
                page: Math.floor(skip / take) + 1,
                pageSize: take
            };
        } catch (error) {
            throw new Error(`Failed to fetch templates: ${error.message}`);
        }
    },

    /**
     * Get single template by ID
     */
    getTemplateById: async (id) => {
        try {
            const template = await prisma.resumeTemplate.findUnique({
                where: { id },
                include: {
                    country: true,
                    type: true,
                    resumes: {
                        select: {
                            id: true,
                            title: true,
                            isPublished: true,
                            isActive: true
                        }
                    }
                }
            });
            return template;
        } catch (error) {
            throw new Error(`Failed to fetch template: ${error.message}`);
        }
    },

    /**
     * Create a new template
     */
    createTemplate: async (data) => {
        try {
            const template = await prisma.resumeTemplate.create({
                data: {
                    name: data.name,
                    description: data.description,
                    countryId: data.countryId,
                    typeId: data.typeId,
                    layout: data.layout ? JSON.stringify(data.layout) : null,
                    colorScheme: data.colorScheme ? JSON.stringify(data.colorScheme) : null,
                    fontFamily: data.fontFamily,
                    typography: data.typography ? JSON.stringify(data.typography) : null,
                    sections: data.sections ? JSON.stringify(data.sections) : null,
                    customCSS: data.customCSS,
                    thumbnail: data.thumbnail,
                    difficulty: data.difficulty
                },
                include: {
                    country: true,
                    type: true
                }
            });
            return template;
        } catch (error) {
            throw new Error(`Failed to create template: ${error.message}`);
        }
    },

    /**
     * Update template
     */
    updateTemplate: async (id, data) => {
        try {
            const updateData = {};
            if (data.name) updateData.name = data.name;
            if (data.description) updateData.description = data.description;
            if (data.layout) updateData.layout = JSON.stringify(data.layout);
            if (data.colorScheme) updateData.colorScheme = JSON.stringify(data.colorScheme);
            if (data.fontFamily) updateData.fontFamily = data.fontFamily;
            if (data.typography) updateData.typography = JSON.stringify(data.typography);
            if (data.sections) updateData.sections = JSON.stringify(data.sections);
            if (data.customCSS) updateData.customCSS = data.customCSS;
            if (data.thumbnail) updateData.thumbnail = data.thumbnail;
            if (data.difficulty) updateData.difficulty = data.difficulty;
            if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
            if (data.isActive !== undefined) updateData.isActive = data.isActive;

            const template = await prisma.resumeTemplate.update({
                where: { id },
                data: updateData,
                include: {
                    country: true,
                    type: true
                }
            });
            return template;
        } catch (error) {
            throw new Error(`Failed to update template: ${error.message}`);
        }
    },

    /**
     * Delete template
     */
    deleteTemplate: async (id) => {
        try {
            // Check if template is in use
            const usageCount = await prisma.resumeContent.count({
                where: { templateId: id }
            });

            if (usageCount > 0) {
                throw new Error(`Cannot delete template in use by ${usageCount} resume(s)`);
            }

            await prisma.resumeTemplate.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            throw new Error(`Failed to delete template: ${error.message}`);
        }
    },

    // ==================== RESUME CONTENT ====================

    /**
     * Create a new resume
     */
    createResume: async (data) => {
        try {
            // Generate slug if not provided
            const slug = data.slug || resumeService.generateSlug(data.title);

            // Generate shareable link
            const shareableLink = `${slug}-${crypto.randomBytes(4).toString('hex')}`;

            const resume = await prisma.resumeContent.create({
                data: {
                    title: data.title,
                    description: data.description,
                    slug,
                    shareableLink,
                    templateId: data.templateId,
                    countryId: data.countryId,
                    typeId: data.typeId,
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    location: data.location,
                    city: data.city,
                    countryText: data.country || data.countryText,
                    summary: data.summary,
                    visibility: data.visibility ? JSON.stringify(data.visibility) : null,
                    linkedinUrl: data.linkedinUrl,
                    portfolioUrl: data.portfolioUrl,
                    githubUrl: data.githubUrl,
                    githubPersonalUrl: data.githubPersonalUrl,
                    orcidUrl: data.orcidUrl,
                    experience: data.experience ? JSON.stringify(data.experience) : null,
                    education: data.education ? JSON.stringify(data.education) : null,
                    skills: data.skills ? JSON.stringify(data.skills) : null,
                    certifications: data.certifications ? JSON.stringify(data.certifications) : null,
                    languages: data.languages ? JSON.stringify(data.languages) : null,
                    projects: data.projects ? JSON.stringify(data.projects) : null,
                    publications: data.publications ? JSON.stringify(data.publications) : null,
                    awards: data.awards ? JSON.stringify(data.awards) : null,
                    volunteerWork: data.volunteerWork ? JSON.stringify(data.volunteerWork) : null,
                    references: data.references ? JSON.stringify(data.references) : null,
                    customSections: data.customSections ? JSON.stringify(data.customSections) : null,
                    sectionOrder: data.sectionOrder ? JSON.stringify(data.sectionOrder) : null,

                    // Linked Portfolio Content (optional)
                    linkedExperiences: data.linkedExperiences ? JSON.stringify(data.linkedExperiences) : null,
                    linkedEducation: data.linkedEducation ? JSON.stringify(data.linkedEducation) : null,
                    linkedProjects: data.linkedProjects ? JSON.stringify(data.linkedProjects) : null,
                    linkedAwards: data.linkedAwards ? JSON.stringify(data.linkedAwards) : null,
                    linkedPublications: data.linkedPublications ? JSON.stringify(data.linkedPublications) : null,
                    linkedLeadership: data.linkedLeadership ? JSON.stringify(data.linkedLeadership) : null,
                    linkedSkills: data.linkedSkills ? JSON.stringify(data.linkedSkills) : null,
                    linkedCertifications: data.linkedCertifications ? JSON.stringify(data.linkedCertifications) : null,
                    linkedReferences: data.linkedReferences ? JSON.stringify(data.linkedReferences) : null,
                    linkedVolunteer: data.linkedVolunteer ? JSON.stringify(data.linkedVolunteer) : null,
                    linkedLanguages: data.linkedLanguages ? JSON.stringify(data.linkedLanguages) : null,

                    isDraft: data.isDraft !== false,
                    isPublic: data.isPublic || false,
                    allowDownload: data.allowDownload !== false,
                    allowShare: data.allowShare !== false,
                    viewPassword: data.viewPassword,
                    keywords: data.keywords ? JSON.stringify(data.keywords) : null,
                    metaTitle: data.metaTitle,
                    metaDesc: data.metaDesc
                },
                include: {
                    template: {
                        include: { country: true, type: true }
                    },
                    country: true,
                    type: true
                }
            });

            return resume;
        } catch (error) {
            throw new Error(`Failed to create resume: ${error.message}`);
        }
    },

    /**
     * Get all resumes with filtering
     */
    getAllResumes: async (filters = {}) => {
        try {
            const {
                countryId,
                typeId,
                templateId,
                isPublished = false,
                isActive = false,
                isPublic = false,
                skip = 0,
                take = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = filters;

            const where = {
                deletedAt: null
            };

            if (countryId) where.countryId = countryId;
            if (typeId) where.typeId = typeId;
            if (templateId) where.templateId = templateId;
            if (isPublished) where.isPublished = true;
            if (isActive) where.isActive = true;
            if (isPublic) where.isPublic = true;

            const [resumes, total] = await Promise.all([
                prisma.resumeContent.findMany({
                    where,
                    include: {
                        template: {
                            include: { country: true, type: true }
                        },
                        country: true,
                        type: true
                    },
                    orderBy: { [sortBy]: sortOrder },
                    skip: parseInt(skip),
                    take: parseInt(take)
                }),
                prisma.resumeContent.count({ where })
            ]);

            return {
                data: resumes,
                total,
                page: Math.floor(skip / take) + 1,
                pageSize: take
            };
        } catch (error) {
            throw new Error(`Failed to fetch resumes: ${error.message}`);
        }
    },

    /**
     * Get single resume by ID
     */
    getResumeById: async (id) => {
        try {
            const resume = await prisma.resumeContent.findUnique({
                where: { id },
                include: {
                    template: {
                        include: { country: true, type: true }
                    },
                    country: true,
                    type: true
                }
            });

            if (!resume) {
                throw new Error('Resume not found');
            }

            // Parse JSON fields
            return resumeService.parseResumeData(resume);
        } catch (error) {
            throw new Error(`Failed to fetch resume: ${error.message}`);
        }
    },

    /**
     * Get resume by slug (public access)
     */
    getResumeBySlug: async (slug) => {
        try {
            const resume = await prisma.resumeContent.findUnique({
                where: { slug },
                include: {
                    template: {
                        include: { country: true, type: true }
                    },
                    country: true,
                    type: true
                }
            });

            if (!resume || !resume.isPublic) {
                throw new Error('Resume not found or not public');
            }

            return resumeService.parseResumeData(resume);
        } catch (error) {
            throw new Error(`Failed to fetch resume: ${error.message}`);
        }
    },

    /**
     * Get resume by shareable link
     */
    getResumeByShareableLink: async (shareableLink, password = null) => {
        try {
            const resume = await prisma.resumeContent.findUnique({
                where: { shareableLink },
                include: {
                    template: {
                        include: { country: true, type: true }
                    },
                    country: true,
                    type: true
                }
            });

            if (!resume) {
                throw new Error('Resume not found');
            }

            // Check password protection
            if (resume.viewPassword && resume.viewPassword !== password) {
                throw new Error('Invalid password');
            }

            return resumeService.parseResumeData(resume);
        } catch (error) {
            throw new Error(`Failed to fetch resume: ${error.message}`);
        }
    },

    /**
     * Update resume
     */
    updateResume: async (id, data) => {
        try {
            const updateData = {};

            // Text fields
            const textFields = [
                'title', 'description', 'fullName', 'email', 'phone', 'location',
                'city', 'countryText', 'summary', 'linkedinUrl', 'portfolioUrl', 'githubUrl',
                'githubPersonalUrl', 'orcidUrl', 'metaTitle', 'metaDesc', 'viewPassword'
            ];

            textFields.forEach(field => {
                if (data[field] !== undefined) updateData[field] = data[field];
            });

            // Map 'country' field to 'countryText' in database
            if (data.country !== undefined) {
                updateData.countryText = data.country;
            }

            // JSON fields
            const jsonFields = [
                'experience', 'education', 'skills', 'certifications', 'languages',
                'projects', 'publications', 'awards', 'volunteerWork', 'references',
                'customSections', 'keywords', 'sectionOrder',

                // Linked Portfolio Content
                'linkedExperiences', 'linkedEducation', 'linkedProjects', 'linkedAwards',
                'linkedPublications', 'linkedLeadership', 'linkedSkills', 'linkedCertifications',
                'linkedReferences', 'linkedVolunteer', 'linkedLanguages'
            ];

            jsonFields.forEach(field => {
                if (data[field] !== undefined) {
                    updateData[field] = typeof data[field] === 'string'
                        ? data[field]
                        : JSON.stringify(data[field]);
                }
            });

            // Visibility settings (JSON object)
            if (data.visibility !== undefined) {
                updateData.visibility = typeof data.visibility === 'string'
                    ? data.visibility
                    : JSON.stringify(data.visibility);
            }

            // Boolean fields
            ['isDraft', 'isPublished', 'isFeatured', 'isActive', 'isPublic', 'allowDownload', 'allowShare'].forEach(field => {
                if (data[field] !== undefined) updateData[field] = data[field];
            });

            // Special handling for active resume
            if (data.isActive === true) {
                await prisma.resumeContent.updateMany({
                    where: {
                        isActive: true,
                        NOT: { id }
                    },
                    data: { isActive: false }
                });
            }

            const resume = await prisma.resumeContent.update({
                where: { id },
                data: updateData,
                include: {
                    template: {
                        include: { country: true, type: true }
                    },
                    country: true,
                    type: true
                }
            });

            return resumeService.parseResumeData(resume);
        } catch (error) {
            throw new Error(`Failed to update resume: ${error.message}`);
        }
    },

    /**
     * Soft delete resume
     */
    deleteResume: async (id) => {
        try {
            const resume = await prisma.resumeContent.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
            return resume;
        } catch (error) {
            throw new Error(`Failed to delete resume: ${error.message}`);
        }
    },

    /**
     * Restore deleted resume
     */
    restoreResume: async (id) => {
        try {
            const resume = await prisma.resumeContent.update({
                where: { id },
                data: { deletedAt: null },
                include: {
                    template: {
                        include: { country: true, type: true }
                    },
                    country: true,
                    type: true
                }
            });
            return resumeService.parseResumeData(resume);
        } catch (error) {
            throw new Error(`Failed to restore resume: ${error.message}`);
        }
    },

    /**
     * Clone/duplicate resume with new version
     */
    cloneResume: async (id, newTitle = null) => {
        try {
            const original = await prisma.resumeContent.findUnique({
                where: { id }
            });

            if (!original) {
                throw new Error('Original resume not found');
            }

            const cloned = await prisma.resumeContent.create({
                data: {
                    title: newTitle || `${original.title} (Copy)`,
                    description: original.description,
                    slug: resumeService.generateSlug(newTitle || `${original.title} (Copy)`),
                    shareableLink: `${resumeService.generateSlug(newTitle || `${original.title} (Copy)`)}-${crypto.randomBytes(4).toString('hex')}`,
                    templateId: original.templateId,
                    countryId: original.countryId,
                    typeId: original.typeId,
                    fullName: original.fullName,
                    email: original.email,
                    phone: original.phone,
                    location: original.location,
                    city: original.city,
                    countryText: original.countryText,
                    summary: original.summary,
                    visibility: original.visibility,
                    linkedinUrl: original.linkedinUrl,
                    portfolioUrl: original.portfolioUrl,
                    githubUrl: original.githubUrl,
                    orcidUrl: original.orcidUrl,
                    experience: original.experience,
                    education: original.education,
                    skills: original.skills,
                    certifications: original.certifications,
                    languages: original.languages,
                    projects: original.projects,
                    publications: original.publications,
                    awards: original.awards,
                    volunteerWork: original.volunteerWork,
                    customSections: original.customSections,
                    sectionOrder: original.sectionOrder,
                    isDraft: true,
                    isPublished: false,
                    isFeatured: false,
                    isActive: false,
                    isPublic: false,
                    keywords: original.keywords,
                    metaTitle: original.metaTitle,
                    metaDesc: original.metaDesc,
                    parentId: original.id,
                    version: original.version + 1
                },
                include: {
                    template: {
                        include: { country: true, type: true }
                    },
                    country: true,
                    type: true
                }
            });

            return resumeService.parseResumeData(cloned);
        } catch (error) {
            throw new Error(`Failed to clone resume: ${error.message}`);
        }
    },

    /**
     * Track resume view
     */
    recordView: async (id) => {
        try {
            await prisma.resumeContent.update({
                where: { id },
                data: { views: { increment: 1 } }
            });
        } catch (error) {
            console.error('Failed to record view:', error);
        }
    },

    /**
     * Track resume download
     */
    recordDownload: async (id) => {
        try {
            await prisma.resumeContent.update({
                where: { id },
                data: { downloads: { increment: 1 } }
            });
        } catch (error) {
            console.error('Failed to record download:', error);
        }
    },

    /**
     * Track resume share
     */
    recordShare: async (id) => {
        try {
            await prisma.resumeContent.update({
                where: { id },
                data: { shares: { increment: 1 } }
            });
        } catch (error) {
            console.error('Failed to record share:', error);
        }
    },

    // ==================== ANALYTICS & STATS ====================

    /**
     * Get resume statistics
     */
    getResumeStats: async () => {
        try {
            const [
                totalResumes,
                publishedResumes,
                featuredResumes,
                publicResumes,
                activeResumes,
                totalViews,
                totalDownloads,
                totalShares,
                byCountry,
                byType,
                byTemplate
            ] = await Promise.all([
                prisma.resumeContent.count({ where: { deletedAt: null } }),
                prisma.resumeContent.count({ where: { deletedAt: null, isPublished: true } }),
                prisma.resumeContent.count({ where: { deletedAt: null, isFeatured: true } }),
                prisma.resumeContent.count({ where: { deletedAt: null, isPublic: true } }),
                prisma.resumeContent.count({ where: { deletedAt: null, isActive: true } }),
                prisma.resumeContent.aggregate({
                    where: { deletedAt: null },
                    _sum: { views: true }
                }),
                prisma.resumeContent.aggregate({
                    where: { deletedAt: null },
                    _sum: { downloads: true }
                }),
                prisma.resumeContent.aggregate({
                    where: { deletedAt: null },
                    _sum: { shares: true }
                }),
                prisma.resumeContent.groupBy({
                    by: ['countryId'],
                    where: { deletedAt: null },
                    _count: true
                }),
                prisma.resumeContent.groupBy({
                    by: ['typeId'],
                    where: { deletedAt: null },
                    _count: true
                }),
                prisma.resumeContent.groupBy({
                    by: ['templateId'],
                    where: { deletedAt: null },
                    _count: true
                })
            ]);

            return {
                totalResumes,
                publishedResumes,
                featuredResumes,
                publicResumes,
                activeResumes,
                draftResumes: totalResumes - publishedResumes,
                totalViews: totalViews._sum.views || 0,
                totalDownloads: totalDownloads._sum.downloads || 0,
                totalShares: totalShares._sum.shares || 0,
                byCountry,
                byType,
                byTemplate
            };
        } catch (error) {
            throw new Error(`Failed to fetch statistics: ${error.message}`);
        }
    },

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Generate URL-friendly slug
     */
    generateSlug: (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    },

    /**
     * Parse resume data - convert JSON strings to objects
     */
    parseResumeData: (resume) => {
        if (!resume) return null;

        const parsed = { ...resume };
        const jsonFields = [
            'experience', 'education', 'skills', 'certifications', 'languages',
            'projects', 'publications', 'awards', 'volunteerWork', 'references',
            'customSections', 'keywords', 'visibility', 'sectionOrder',

            // Linked Portfolio Content
            'linkedExperiences', 'linkedEducation', 'linkedProjects', 'linkedAwards',
            'linkedPublications', 'linkedLeadership', 'linkedSkills', 'linkedCertifications',
            'linkedReferences', 'linkedVolunteer', 'linkedLanguages'
        ];

        jsonFields.forEach(field => {
            if (parsed[field] && typeof parsed[field] === 'string') {
                try {
                    parsed[field] = JSON.parse(parsed[field]);
                } catch (e) {
                    console.warn(`Failed to parse ${field}:`, e);
                }
            }
        });

        // Parse template JSON fields
        if (parsed.template) {
            const templateJsonFields = ['layout', 'colorScheme', 'typography', 'sections'];
            templateJsonFields.forEach(field => {
                if (parsed.template[field] && typeof parsed.template[field] === 'string') {
                    try {
                        parsed.template[field] = JSON.parse(parsed.template[field]);
                    } catch (e) {
                        console.warn(`Failed to parse template ${field}:`, e);
                    }
                }
            });
        }

        // Map countryText back to country for frontend compatibility
        // Note: parsed.country is a relation object, countryText is the string field
        if (parsed.countryText) {
            parsed.countryDisplay = parsed.countryText;
        } else if (parsed.country && typeof parsed.country === 'object' && parsed.country.name) {
            parsed.countryDisplay = parsed.country.name;
        }

        return parsed;
    },

    /**
     * Bulk parse resume data
     */
    parseResumesData: (resumes) => {
        return resumes.map(resume => resumeService.parseResumeData(resume));
    }
};

module.exports = resumeService;
