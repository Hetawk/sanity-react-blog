// API Configuration
// In production, API is on the same domain (unified app)
// In development, API runs on localhost:5001
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '' // Use relative URLs in production (same domain)
    : (process.env.REACT_APP_API_URL || 'http://localhost:5001');

// API Client with error handling and retry logic
class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const text = await response.text();

            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('API Parse Error:', parseError.message);
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error.message);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    // PUT request
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    // PATCH request
    async patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Create API client instance
const apiClient = new APIClient();

// Export the apiClient for direct usage
export { apiClient };

// API Endpoints
export const api = {
    // Homepage - Combined endpoint for faster initial load
    homepage: {
        getAll: () => apiClient.get('/api/homepage'),
        invalidateCache: () => apiClient.post('/api/homepage/invalidate'),
    },

    // Works
    works: {
        getAll: (params = {}) => {
            const queryParams = new URLSearchParams();
            if (params.includeUnpublished) queryParams.append('includeUnpublished', 'true');
            if (params.category) queryParams.append('category', params.category);
            if (params.featured) queryParams.append('featured', 'true');
            const queryString = queryParams.toString();
            return apiClient.get(`/api/works${queryString ? `?${queryString}` : ''}`);
        },
        getById: (id) => apiClient.get(`/api/works/${id}`),
        getByTag: (tag) => apiClient.get(`/api/works/tag/${tag}`),
        create: (data) => apiClient.post('/api/works', data),
        update: (id, data) => apiClient.put(`/api/works/${id}`, data),
        delete: (id) => apiClient.delete(`/api/works/${id}`),
        togglePublished: (id) => apiClient.post(`/api/works/${id}/toggle-published`),
        uploadImage: async (file) => {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${API_BASE_URL}/api/works/upload-image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to upload image');
            }

            return await response.json();
        },
    },

    // Abouts
    abouts: {
        getAll: (includeUnpublished = false) => apiClient.get(`/api/abouts${includeUnpublished ? '?includeUnpublished=true' : ''}`),
        getById: (id) => apiClient.get(`/api/abouts/${id}`),
        create: (data) => apiClient.post('/api/abouts', data),
        update: (id, data) => apiClient.put(`/api/abouts/${id}`, data),
        delete: (id) => apiClient.delete(`/api/abouts/${id}`),
        togglePublished: (id) => apiClient.post(`/api/abouts/${id}/toggle-published`),
    },

    // Skills
    skills: {
        getAll: (includeUnpublished = false) => apiClient.get(`/api/skills${includeUnpublished ? '?includeUnpublished=true' : ''}`),
        getById: (id) => apiClient.get(`/api/skills/${id}`),
        togglePublished: (id) => apiClient.post(`/api/skills/${id}/toggle-published`),
    },

    // Experiences (Timeline)
    experiences: {
        getAll: (params = {}) => {
            const queryParams = new URLSearchParams();
            if (params.includeUnpublished) queryParams.append('includeUnpublished', 'true');
            if (params.featured) queryParams.append('featured', 'true');
            const queryString = queryParams.toString();
            return apiClient.get(`/api/experiences${queryString ? `?${queryString}` : ''}`);
        },
        getById: (id) => apiClient.get(`/api/experiences/${id}`),
        togglePublished: (id) => apiClient.post(`/api/experiences/${id}/toggle-published`),
        toggleFeatured: (id) => apiClient.post(`/api/experiences/${id}/toggle-featured`),
    },
    // Leadership (Leadership, Volunteer, and Organizational roles)
    leadership: {
        getAll: (params = {}) => {
            const queryParams = new URLSearchParams();
            if (params.includeUnpublished) queryParams.append('includeUnpublished', 'true');
            if (params.type) queryParams.append('type', params.type); // 'leadership', 'volunteer', 'work'
            if (params.category) queryParams.append('category', params.category);
            if (params.featured) queryParams.append('featured', 'true');
            const queryString = queryParams.toString();
            return apiClient.get(`/api/leadership${queryString ? `?${queryString}` : ''}`);
        },
        getById: (id) => apiClient.get(`/api/leadership/${id}`),
        togglePublished: (id) => apiClient.post(`/api/leadership/${id}/toggle-published`),
        toggleFeatured: (id) => apiClient.post(`/api/leadership/${id}/toggle-featured`),
    },
    // Work Experiences (Professional Summary)
    workExperiences: {
        getAll: (params = {}) => {
            const queryParams = new URLSearchParams();
            if (params.includeUnpublished) queryParams.append('includeUnpublished', 'true');
            if (params.featured) queryParams.append('featured', 'true');
            const queryString = queryParams.toString();
            return apiClient.get(`/api/work-experiences${queryString ? `?${queryString}` : ''}`);
        },
        getFeatured: () => apiClient.get('/api/work-experiences?featured=true'),
        getById: (id) => apiClient.get(`/api/work-experiences/${id}`),
        togglePublished: (id) => apiClient.post(`/api/work-experiences/${id}/toggle-published`),
        toggleFeatured: (id) => apiClient.post(`/api/work-experiences/${id}/toggle-featured`),
    },

    // Brands
    brands: {
        getAll: (includeUnpublished = false) => apiClient.get(`/api/brands${includeUnpublished ? '?includeUnpublished=true' : ''}`),
        getById: (id) => apiClient.get(`/api/brands/${id}`),
        togglePublished: (id) => apiClient.post(`/api/brands/${id}/toggle-published`),
    },

    // Awards
    awards: {
        getAll: (params = {}) => {
            const queryParams = new URLSearchParams();
            if (params.year) queryParams.append('year', params.year);
            if (params.includeUnpublished) queryParams.append('includeUnpublished', 'true');
            const queryString = queryParams.toString();
            return apiClient.get(`/api/awards${queryString ? `?${queryString}` : ''}`);
        },
        getById: (id) => apiClient.get(`/api/awards/${id}`),
        getByYear: () => apiClient.get('/api/awards/stats/by-year'),
        togglePublished: (id) => apiClient.post(`/api/awards/${id}/toggle-published`),
        create: (data) => apiClient.post('/api/awards', data),
        update: (id, data) => apiClient.put(`/api/awards/${id}`, data),
        delete: (id) => apiClient.delete(`/api/awards/${id}`),
    },

    // Contacts
    contacts: {
        create: (data) => apiClient.post('/api/contacts', data),
        getAll: (includeUnpublished = false) => apiClient.get(`/api/contacts${includeUnpublished ? '?includeUnpublished=true' : ''}`),
        delete: (id) => apiClient.delete(`/api/contacts/${id}`),
        togglePublished: (id) => apiClient.post(`/api/contacts/${id}/toggle-published`),
    },

    // Resumes
    resumes: {
        getAll: (includeUnpublished = false) => apiClient.get(`/api/resumes${includeUnpublished ? '?includeUnpublished=true' : ''}`),
        getById: (id) => apiClient.get(`/api/resumes/${id}`),
        togglePublished: (id) => apiClient.post(`/api/resumes/${id}/toggle-published`),
    },

    // Resumes V2 (New system with templates and countries)
    resumesV2: {
        // Countries
        countries: {
            getAll: (activeOnly = false) => apiClient.get(`/api/resumes-v2/countries${activeOnly ? '?activeOnly=true' : ''}`),
            getByCode: (code) => apiClient.get(`/api/resumes-v2/countries/${code}`),
            create: (data) => apiClient.post('/api/resumes-v2/countries', data),
            update: (id, data) => apiClient.put(`/api/resumes-v2/countries/${id}`, data),
        },

        // Resume Types
        types: {
            getAll: () => apiClient.get('/api/resumes-v2/types'),
            create: (data) => apiClient.post('/api/resumes-v2/types', data),
        },

        // Templates
        templates: {
            getAll: (params = {}) => {
                const queryParams = new URLSearchParams();
                if (params.countryId) queryParams.append('countryId', params.countryId);
                if (params.typeId) queryParams.append('typeId', params.typeId);
                if (params.featured) queryParams.append('featured', 'true');
                if (params.activeOnly !== undefined) queryParams.append('activeOnly', params.activeOnly);
                if (params.skip) queryParams.append('skip', params.skip);
                if (params.take) queryParams.append('take', params.take);
                const queryString = queryParams.toString();
                return apiClient.get(`/api/resumes-v2/templates${queryString ? `?${queryString}` : ''}`);
            },
            getById: (id) => apiClient.get(`/api/resumes-v2/templates/${id}`),
            create: (data) => apiClient.post('/api/resumes-v2/templates', data),
            update: (id, data) => apiClient.patch(`/api/resumes-v2/templates/${id}`, data),
            delete: (id) => apiClient.delete(`/api/resumes-v2/templates/${id}`),
        },

        // Resume Content
        getAll: (params = {}) => {
            const queryParams = new URLSearchParams();
            if (params.countryId) queryParams.append('countryId', params.countryId);
            if (params.typeId) queryParams.append('typeId', params.typeId);
            if (params.templateId) queryParams.append('templateId', params.templateId);
            if (params.isPublished) queryParams.append('isPublished', 'true');
            if (params.isPublic) queryParams.append('isPublic', 'true');
            if (params.skip) queryParams.append('skip', params.skip);
            if (params.take) queryParams.append('take', params.take);
            const queryString = queryParams.toString();
            return apiClient.get(`/api/resumes-v2${queryString ? `?${queryString}` : ''}`);
        },
        getById: (id) => apiClient.get(`/api/resumes-v2/${id}`),
        viewPdf: (id) => apiClient.get(`/api/resumes-v2/${id}/view-pdf`),
        downloadPdf: (id) => apiClient.get(`/api/resumes-v2/${id}/download-pdf`),
        getBySlug: (slug, password = null) => {
            const queryParams = new URLSearchParams();
            if (password) queryParams.append('password', password);
            const queryString = queryParams.toString();
            return apiClient.get(`/api/resumes-v2/public/${slug}${queryString ? `?${queryString}` : ''}`);
        },
        getByShareableLink: (shareableLink, password = null) => {
            const queryParams = new URLSearchParams();
            if (password) queryParams.append('password', password);
            const queryString = queryParams.toString();
            return apiClient.get(`/api/resumes-v2/share/${shareableLink}${queryString ? `?${queryString}` : ''}`);
        },
        create: (data) => apiClient.post('/api/resumes-v2', data),
        update: (id, data) => apiClient.patch(`/api/resumes-v2/${id}`, data),
        fullUpdate: (id, data) => apiClient.put(`/api/resumes-v2/${id}`, data),
        delete: (id) => apiClient.delete(`/api/resumes-v2/${id}`),
        restore: (id) => apiClient.post(`/api/resumes-v2/${id}/restore`, {}),
        clone: (id, newTitle = null) => apiClient.post(`/api/resumes-v2/${id}/clone`, { newTitle }),
        publish: (id) => apiClient.post(`/api/resumes-v2/${id}/publish`, {}),
        unpublish: (id) => apiClient.post(`/api/resumes-v2/${id}/unpublish`, {}),
        toggleFeatured: (id) => apiClient.post(`/api/resumes-v2/${id}/toggle-featured`, {}),
        setActive: (id) => apiClient.post(`/api/resumes-v2/${id}/set-active`, {}),
        makePublic: (id) => apiClient.post(`/api/resumes-v2/${id}/make-public`, {}),
        makePrivate: (id) => apiClient.post(`/api/resumes-v2/${id}/make-private`, {}),
        recordDownload: (id) => apiClient.post(`/api/resumes-v2/${id}/download`, {}),
        recordShare: (id) => apiClient.post(`/api/resumes-v2/${id}/share`, {}),
        getStats: () => apiClient.get('/api/resumes-v2/stats/overview'),
    },

    // GitHub Sync
    githubSync: {
        // Trigger full sync of all repositories
        sync: () => apiClient.post('/api/github-sync', {}),

        // Get sync status and statistics
        getStatus: () => apiClient.get('/api/github-sync/status'),

        // Get all GitHub projects with filtering
        getProjects: (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return apiClient.get(`/api/github-sync/projects${queryString ? `?${queryString}` : ''}`);
        },

        // Publish a GitHub project
        publishProject: (id) => apiClient.post(`/api/github-sync/projects/${id}/publish`, {}),

        // Update a GitHub project
        updateProject: (id, data) => apiClient.put(`/api/github-sync/projects/${id}`, data),
    },

    // Journey (Professional Summary Sections)
    journey: {
        getAll: (params = {}) => {
            const queryParams = new URLSearchParams();
            if (params.includeUnpublished) queryParams.append('includeUnpublished', 'true');
            if (params.featured) queryParams.append('featured', 'true');
            if (params.category) queryParams.append('category', params.category);
            if (params.partNumber) queryParams.append('partNumber', params.partNumber);
            const queryString = queryParams.toString();
            return apiClient.get(`/api/journey${queryString ? `?${queryString}` : ''}`);
        },
        getById: (id) => apiClient.get(`/api/journey/${id}`),
        getCategories: () => apiClient.get('/api/journey/meta/categories'),
        create: (data) => apiClient.post('/api/journey', data),
        update: (id, data) => apiClient.put(`/api/journey/${id}`, data),
        delete: (id) => apiClient.delete(`/api/journey/${id}`),
        togglePublished: (id) => apiClient.post(`/api/journey/${id}/toggle-published`),
        toggleFeatured: (id) => apiClient.post(`/api/journey/${id}/toggle-featured`),
        bulkImport: (sections, clearExisting = false) =>
            apiClient.post('/api/journey/bulk-import', { sections, clearExisting }),
    },
};

export default api;
