import axios from 'axios';

// When running through Vite dev proxy or same origin, relative path works directly.
// In direct cross-origin scenarios, fall back to localhost:5000.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'API request failed';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
