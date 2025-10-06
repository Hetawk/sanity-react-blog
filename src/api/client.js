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
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
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

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Create API client instance
const apiClient = new APIClient();

// API Endpoints
export const api = {
    // Works
    works: {
        getAll: () => apiClient.get('/api/works'),
        getById: (id) => apiClient.get(`/api/works/${id}`),
        getByTag: (tag) => apiClient.get(`/api/works/tag/${tag}`),
    },

    // Abouts
    abouts: {
        getAll: () => apiClient.get('/api/abouts'),
        getById: (id) => apiClient.get(`/api/abouts/${id}`),
        create: (data) => apiClient.post('/api/abouts', data),
        update: (id, data) => apiClient.put(`/api/abouts/${id}`, data),
        delete: (id) => apiClient.delete(`/api/abouts/${id}`),
    },

    // Skills
    skills: {
        getAll: () => apiClient.get('/api/skills'),
        getById: (id) => apiClient.get(`/api/skills/${id}`),
    },

    // Experiences
    experiences: {
        getAll: () => apiClient.get('/api/experiences'),
        getById: (id) => apiClient.get(`/api/experiences/${id}`),
    },

    // Work Experiences
    workExperiences: {
        getAll: () => apiClient.get('/api/work-experiences'),
        getById: (id) => apiClient.get(`/api/work-experiences/${id}`),
    },

    // Brands
    brands: {
        getAll: () => apiClient.get('/api/brands'),
        getById: (id) => apiClient.get(`/api/brands/${id}`),
    },

    // Awards
    awards: {
        getAll: (year) => apiClient.get(`/api/awards${year ? `?year=${year}` : ''}`),
        getById: (id) => apiClient.get(`/api/awards/${id}`),
        getByYear: () => apiClient.get('/api/awards/stats/by-year'),
    },

    // Contacts
    contacts: {
        create: (data) => apiClient.post('/api/contacts', data),
        getAll: () => apiClient.get('/api/contacts'),
        delete: (id) => apiClient.delete(`/api/contacts/${id}`),
    },

    // Resumes
    resumes: {
        getAll: () => apiClient.get('/api/resumes'),
        getById: (id) => apiClient.get(`/api/resumes/${id}`),
    },
};

export default api;
