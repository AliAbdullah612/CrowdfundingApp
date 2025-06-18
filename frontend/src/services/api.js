import axios from 'axios';
import API_CONFIG, { ENDPOINTS } from '../config/api.config';

// Create axios instance
const api = axios.create({
    ...API_CONFIG,
    withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: (credentials) => api.post(ENDPOINTS.AUTH.LOGIN, credentials),
    register: (userData) => api.post(ENDPOINTS.AUTH.REGISTER, userData),
    adminLogin: (credentials) => api.post(ENDPOINTS.AUTH.ADMIN_LOGIN, credentials),
    forgotPassword: (email) => api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
    resetPassword: (token, password) => api.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
    getProfile: () => api.get('/auth/profile')
};

// Property API calls
export const propertyAPI = {
    getAll: (params) => api.get(ENDPOINTS.PROPERTIES.BASE, { params }),
    getById: (id) => api.get(ENDPOINTS.PROPERTIES.BY_ID(id)),
    create: (propertyData) => {
        const formData = new FormData();
        Object.keys(propertyData).forEach(key => {
            if (key === 'images') {
                propertyData[key].forEach(image => formData.append('images', image));
            } else if (key === 'location') {
                formData.append(key, JSON.stringify(propertyData[key]));
            } else {
                formData.append(key, propertyData[key]);
            }
        });
        return api.post(ENDPOINTS.PROPERTIES.BASE, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    update: (id, propertyData) => {
        const formData = new FormData();
        Object.keys(propertyData).forEach(key => {
            if (key === 'images') {
                propertyData[key].forEach(image => formData.append('images', image));
            } else if (key === 'location') {
                formData.append(key, JSON.stringify(propertyData[key]));
            } else {
                formData.append(key, propertyData[key]);
            }
        });
        return api.put(ENDPOINTS.PROPERTIES.BY_ID(id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    delete: (id) => api.delete(ENDPOINTS.PROPERTIES.BY_ID(id)),
    getByStatus: (status) => api.get(ENDPOINTS.PROPERTIES.BY_STATUS(status)),
    getAdminProperties: () => api.get(ENDPOINTS.PROPERTIES.ADMIN)
};

// Crowdfunding API calls
export const crowdfundingAPI = {
    getAll: () => api.get(ENDPOINTS.CROWDFUNDING.BASE),
    getById: (id) => api.get(ENDPOINTS.CROWDFUNDING.BY_ID(id)),
    create: (data) => api.post(ENDPOINTS.CROWDFUNDING.BASE, data),
    update: (id, data) => api.put(ENDPOINTS.CROWDFUNDING.BY_ID(id), data),
    delete: (id) => api.delete(ENDPOINTS.CROWDFUNDING.BY_ID(id)),
    getByProperty: (propertyId) => api.get(ENDPOINTS.CROWDFUNDING.BY_PROPERTY(propertyId))
};

// Payment API calls
export const paymentAPI = {
    createIntent: (data) => api.post('/payments/create-intent', data),
    confirmPayment: (data) => api.post('/payments/confirm', data),
    getHistory: () => api.get('/payments/history'),
    getByCampaign: (campaignId) => api.get(`/payments/campaign/${campaignId}`)
};

// Voting API calls
export const votingAPI = {
    getAll: () => api.get(ENDPOINTS.VOTING.BASE),
    getById: (id) => api.get(ENDPOINTS.VOTING.BY_ID(id)),
    create: (data) => api.post(ENDPOINTS.VOTING.BASE, data),
    castVote: (id, vote) => api.post(ENDPOINTS.VOTING.VOTE(id), { vote }),
    endVoting: (id) => api.post(ENDPOINTS.VOTING.END(id)),
    getByCampaign: (campaignId) => api.get(ENDPOINTS.VOTING.BY_CAMPAIGN(campaignId))
};

// Profile API calls
export const profileAPI = {
    getUserProfile: (userId) => api.get(`${ENDPOINTS.PROFILE.USER}/${userId}`),
    updateUserProfile: (userId, data) => api.put(`${ENDPOINTS.PROFILE.USER}/${userId}`, data),
    getAdminProfile: () => api.get(ENDPOINTS.PROFILE.ADMIN),
    getAdminStatistics: () => api.get(ENDPOINTS.PROFILE.STATISTICS),
    getInvestments: () => api.get(ENDPOINTS.PROFILE.INVESTMENTS),
    getTransactions: () => api.get(ENDPOINTS.PROFILE.TRANSACTIONS)
};

export default api; 