import api from './api';

export const authService = {
    // Login
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            if (response.data) {
                const userData = {
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role
                };
                
                // Store token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                return {
                    success: true,
                    data: {
                        token: response.data.token,
                        user: userData
                    }
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    },

    // Register
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            
            return {
                success: true,
                message: response.data.message || 'Registration successful'
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                return JSON.parse(userStr);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
        return null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Check if user is admin
    isAdmin: () => {
        const user = authService.getCurrentUser();
        return user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';
    }
};