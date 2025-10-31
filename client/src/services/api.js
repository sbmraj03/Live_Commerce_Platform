import axios from 'axios';

// Base API client used across the app
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// --- AI Recommendations Admin API ---
export const generateProductRecommendations = (productId) =>
  api.post(`/api/admin/products/${productId}/generate-recommendations`);

export const getAIRecommendationsSetting = () =>
  api.get('/api/admin/settings/ai-recommendations');

export const toggleAIRecommendations = (enabled) =>
  api.post('/api/admin/settings/ai-recommendations/toggle', { enabled });

export default api;