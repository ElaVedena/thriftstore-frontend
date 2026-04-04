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

    // Get user's orders - using the working endpoint /orders/my-orders
    getOrders: async () => {
        try {
            const response = await api.get('/orders/my-orders', {
                params: { page: 0, size: 100 }
            });
            
            // Extract orders from the response structure
            let orders = [];
            if (response.data && response.data.content) {
                orders = response.data.content;
            } else if (response.data && response.data.data && response.data.data.content) {
                orders = response.data.data.content;
            } else if (Array.isArray(response.data)) {
                orders = response.data;
            } else if (response.data && response.data.orders) {
                orders = response.data.orders;
            }
            
            return {
                success: true,
                data: orders,
                rawData: response.data
            };
        } catch (error) {
            console.error('Get orders error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch orders',
                data: []
            };
        }
    },

    // Get user's wishlist - using the working endpoint
    getWishlist: async () => {
        try {
            const response = await api.get('/wishlist');
            
            let wishlist = [];
            if (response.data && response.data.data !== undefined) {
                wishlist = response.data.data || [];
            } else if (Array.isArray(response.data)) {
                wishlist = response.data;
            }
            
            return {
                success: true,
                data: wishlist
            };
        } catch (error) {
            console.error('Get wishlist error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch wishlist',
                data: []
            };
        }
    },

    // Get user's reviews - requires userId parameter
    getUserReviews: async (userId) => {
        try {
            if (!userId) {
                return {
                    success: false,
                    message: 'User ID is required',
                    data: []
                };
            }
            
            const response = await api.get(`/reviews/user/${userId}`);
            
            let reviews = [];
            if (response.data && response.data.content) {
                reviews = response.data.content;
            } else if (Array.isArray(response.data)) {
                reviews = response.data;
            } else if (response.data && response.data.data && response.data.data.content) {
                reviews = response.data.data.content;
            }
            
            return {
                success: true,
                data: reviews
            };
        } catch (error) {
            console.error('Get user reviews error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch reviews',
                data: []
            };
        }
    },

    // Get single order details
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
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