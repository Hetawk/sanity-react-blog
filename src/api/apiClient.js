/**
 * Enhanced API Client with Full CRUD Operations
 * Follows DRY principles with reusable methods
 * Supports all new backend features: filtering, sorting, pagination, etc.
 */

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '' // Use relative URLs in production (same domain)
    : (process.env.REACT_APP_API_URL || 'http://localhost:5001');

/**
 * Build query string from params object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
const buildQueryString = (params) => {
    if (!params || Object.keys(params).length === 0) return '';

    const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return filteredParams ? `?${filteredParams}` : '';
};

/**
 * Base API Client Class
 */
class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Generic request handler with error handling
     */
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
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Basic HTTP methods
    async get(endpoint, params = {}) {
        const queryString = buildQueryString(params);
        return this.request(`${endpoint}${queryString}`, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Upload file (multipart/form-data)
     */
    async upload(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);

        // Add additional fields
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header, let browser set it with boundary
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }
}

/**
 * Resource API Factory
 * Creates a standard CRUD API for a resource
 */
const createResourceAPI = (resourcePath) => {
    const client = new APIClient();

    return {
        /**
         * Get all items with filtering, sorting, pagination
         * @param {Object} params - Query parameters
         * @returns {Promise} API response
         */
        getAll: (params = {}) => client.get(`/api/${resourcePath}`, params),

        /**
         * Get single item by ID
         * @param {string} id - Item ID
         * @param {Object} params - Additional params (e.g., incrementViews)
         * @returns {Promise} API response
         */
        getOne: (id, params = {}) => client.get(`/api/${resourcePath}/${id}`, params),

        /**
         * Create new item
         * @param {Object} data - Item data
         * @returns {Promise} API response
         */
        create: (data) => client.post(`/api/${resourcePath}`, data),

        /**
         * Update item
         * @param {string} id - Item ID
         * @param {Object} data - Updated data
         * @returns {Promise} API response
         */
        update: (id, data) => client.put(`/api/${resourcePath}/${id}`, data),

        /**
         * Partial update item
         * @param {string} id - Item ID
         * @param {Object} data - Partial data
         * @returns {Promise} API response
         */
        partialUpdate: (id, data) => client.patch(`/api/${resourcePath}/${id}`, data),

        /**
         * Delete item (soft delete)
         * @param {string} id - Item ID
         * @returns {Promise} API response
         */
        delete: (id) => client.delete(`/api/${resourcePath}/${id}`),

        /**
         * Restore deleted item
         * @param {string} id - Item ID
         * @returns {Promise} API response
         */
        restore: (id) => client.post(`/api/${resourcePath}/${id}/restore`),

        /**
         * Toggle featured status
         * @param {string} id - Item ID
         * @returns {Promise} API response
         */
        toggleFeatured: (id) => client.post(`/api/${resourcePath}/${id}/toggle-featured`),

        /**
         * Toggle published status
         * @param {string} id - Item ID
         * @returns {Promise} API response
         */
        togglePublished: (id) => client.post(`/api/${resourcePath}/${id}/toggle-published`),

        /**
         * Reorder items
         * @param {Array} items - Array of {id, displayOrder}
         * @returns {Promise} API response
         */
        reorder: (items) => client.post(`/api/${resourcePath}/reorder`, { items }),

        /**
         * Get statistics
         * @returns {Promise} API response
         */
        getStats: () => client.get(`/api/${resourcePath}/stats/overview`),
    };
};

/**
 * Create upload-enabled resource API
 */
const createUploadResourceAPI = (resourcePath, uploadEndpoints = []) => {
    const baseAPI = createResourceAPI(resourcePath);
    const client = new APIClient();

    const uploadMethods = {};
    uploadEndpoints.forEach(endpoint => {
        uploadMethods[`upload${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`] =
            (file, additionalData) => client.upload(`/api/${resourcePath}/upload-${endpoint}`, file, additionalData);
    });

    return {
        ...baseAPI,
        ...uploadMethods,
    };
};

// ============================================
// API Exports - All Resources
// ============================================

export const api = {
    // Works
    works: {
        ...createUploadResourceAPI('works', ['image']),
        like: (id) => new APIClient().post(`/api/works/${id}/like`),
    },

    // About
    abouts: {
        ...createUploadResourceAPI('abouts', ['image']),
    },

    // Skills
    skills: {
        ...createUploadResourceAPI('skills', ['icon']),
        endorse: (id) => new APIClient().post(`/api/skills/${id}/endorse`),
        getStatsByCategory: () => new APIClient().get('/api/skills/stats/by-category'),
    },

    // Research (Unified)
    research: {
        // Research Statements
        statements: {
            ...createUploadResourceAPI('research', ['pdf']),
            trackDownload: (id) => new APIClient().post(`/api/research/statement/${id}/download`),
        },

        // Publications
        publications: {
            getAll: (params = {}) => new APIClient().get('/api/research/publications', params),
            getOne: (id, params = {}) => new APIClient().get(`/api/research/publications/${id}`, params),
            create: (data) => new APIClient().post('/api/research/publications', data),
            update: (id, data) => new APIClient().put(`/api/research/publications/${id}`, data),
            delete: (id) => new APIClient().delete(`/api/research/publications/${id}`),
            restore: (id) => new APIClient().post(`/api/research/publications/${id}/restore`),
            toggleFeatured: (id) => new APIClient().post(`/api/research/publications/${id}/toggle-featured`),
            togglePublished: (id) => new APIClient().post(`/api/research/publications/${id}/toggle-published`),
            uploadPdf: (file, additionalData) => new APIClient().upload('/api/research/publications/upload-pdf', file, additionalData),
            trackDownload: (id) => new APIClient().post(`/api/research/publications/${id}/download`),
            updateCitations: (id, citations) => new APIClient().put(`/api/research/publications/${id}/citations`, { citations }),
            reorder: (items) => new APIClient().post('/api/research/publications/reorder', { items }),
            getTimeline: () => new APIClient().get('/api/research/publications/timeline'),
        },

        // Combined Research Stats
        getStats: () => new APIClient().get('/api/research/stats/overview'),
        getFeatured: () => new APIClient().get('/api/research/featured'),
    },

    // Testimonials
    testimonials: {
        ...createUploadResourceAPI('testimonials', ['avatar', 'logo']),
    },

    // Leadership
    leadership: {
        ...createUploadResourceAPI('leadership', ['image', 'logo']),
    },

    // Experience
    experiences: {
        ...createResourceAPI('experiences'),
        getTimeline: () => new APIClient().get('/api/experiences/timeline'),
    },

    // Work Experience
    workExperiences: {
        ...createUploadResourceAPI('work-experiences', ['logo']),
        getTimeline: () => new APIClient().get('/api/work-experiences/timeline'),
    },

    // Brands
    brands: {
        ...createUploadResourceAPI('brands', ['logo']),
    },

    // Awards
    awards: {
        ...createUploadResourceAPI('awards', ['image', 'logo']),
        getTimeline: () => new APIClient().get('/api/awards/timeline'),
    },

    // Contacts
    contacts: {
        getAll: (params = {}) => new APIClient().get('/api/contacts', params),
        getOne: (id) => new APIClient().get(`/api/contacts/${id}`),
        create: (data) => new APIClient().post('/api/contacts', data),
        update: (id, data) => new APIClient().put(`/api/contacts/${id}`, data),
        delete: (id) => new APIClient().delete(`/api/contacts/${id}`),
        markRead: (id) => new APIClient().post(`/api/contacts/${id}/mark-read`),
        markUnread: (id) => new APIClient().post(`/api/contacts/${id}/mark-unread`),
        reply: (id, reply) => new APIClient().post(`/api/contacts/${id}/reply`, { reply }),
        getStats: () => new APIClient().get('/api/contacts/stats/overview'),
    },

    // Resumes
    resumes: {
        ...createResourceAPI('resumes'),
        upload: (file, additionalData) => new APIClient().upload('/api/resumes/upload', file, additionalData),
        setActive: (id) => new APIClient().post(`/api/resumes/${id}/set-active`),
        trackDownload: (id) => new APIClient().post(`/api/resumes/${id}/download`),
        getActive: () => new APIClient().get('/api/resumes/active/current'),
    },
};

// Export API client instance for custom requests
export const apiClient = new APIClient();

export default api;
