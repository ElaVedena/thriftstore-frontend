import api from './api';

export const userService = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch profile'
            };
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/profile', profileData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update profile'
            };
        }
    },

    // Change password
    changePassword: async (oldPassword, newPassword) => {
        try {
            const response = await api.put('/users/change-password', null, {
                params: { oldPassword, newPassword }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to change password'
            };
        }
    },

    // Get user's orders
    getOrders: async () => {
        try {
            const response = await api.get('/users/orders');
            return {
                success: true,
                data: response.data || []
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch orders'
            };
        }
    },

    // Get user's wishlist
    getWishlist: async () => {
        try {
            const response = await api.get('/wishlist');
            return {
                success: true,
                data: response.data || []
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch wishlist'
            };
        }
    },

    // Get user's reviews
    getUserReviews: async () => {
        try {
            const response = await api.get('/users/reviews');
            return {
                success: true,
                data: response.data || []
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch reviews'
            };
        }
    },

    // Get single order details
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/users/orders/${orderId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch order details'
            };
        }
    },

    // Admin: Get all users
    getAllUsers: async (page = 0, size = 20, role = null) => {
        try {
            const params = { page, size };
            if (role) params.role = role;
            
            const response = await api.get('/users/admin/all', { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch users'
            };
        }
    },

    // Admin: Update user role
    updateUserRole: async (userId, role) => {
        try {
            const response = await api.put(`/users/admin/${userId}/role`, null, {
                params: { role }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update user role'
            };
        }
    },

    // Admin: Delete user
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/users/admin/${userId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete user'
            };
        }
    }
};