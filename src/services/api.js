import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple redirects
let isRedirecting = false;

// Request interceptor
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

// Response interceptor - just redirect on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isLoginPage = window.location.pathname === '/login';
            const isRegisterPage = window.location.pathname === '/register';
            
            if (!isRedirecting && !isLoginPage && !isRegisterPage) {
                isRedirecting = true;
                
                // Clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Redirect to login
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Reset redirect flag on page load
window.addEventListener('load', () => {
    isRedirecting = false;
});

export default api;