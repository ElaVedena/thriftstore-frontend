import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor with logging
api.interceptors.request.use(
    (config) => {
        // Log the request for debugging
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) {
            console.log('Request data:', config.data);
        }
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Token attached to request');
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with logging
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        if (response.data) {
            console.log('Response data:', response.data);
        }
        return response;
    },
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`);
            console.error('Error data:', error.response.data);
            console.error('Error headers:', error.response.headers);
            
            if (error.response?.status === 401) {
                console.warn('🔒 Unauthorized - Redirecting to login');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else if (error.response?.status === 400) {
                console.warn('⚠️ Bad Request - Check your input data');
                // Log the validation errors
                if (error.response.data?.errors) {
                    console.error('Validation errors:', error.response.data.errors);
                }
            } else if (error.response?.status === 500) {
                console.error('💥 Server error - Contact support');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('❌ No response received from server');
            console.error('Request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('❌ Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;