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
};

export default api;
