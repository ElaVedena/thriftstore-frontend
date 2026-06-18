import api from './api';

export const adminService = {
    getDashboardStats: async () => {
        try {
            const response = await api.get('/admin/dashboard/stats');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Dashboard stats error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch dashboard stats'
            };
        }
    },

    getRevenueStats: async (filter = 'today') => {
        try {
            const response = await api.get(`/admin/revenue/stats?filter=${filter}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Revenue stats error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch revenue stats',
                data: { totalRevenue: 0, orderCount: 0, dailyData: [] }
            };
        }
    },

    getRevenueStatsByDateRange: async (startDate, endDate) => {
        try {
            const response = await api.get(`/admin/revenue/stats?startDate=${startDate}&endDate=${endDate}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Revenue stats by date error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch revenue stats',
                data: { totalRevenue: 0, orderCount: 0, dailyData: [] }
            };
        }
    },

    uploadImages: async (files) => {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await api.post('/uploads/product-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            return {
                success: true,
                data: response.data.data || response.data
            };
        } catch (error) {
            console.error('Image upload error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to upload images'
            };
        }
    },

    getProducts: async (page = 0, size = 10, sortBy = 'id', sortDir = 'desc', includeDeleted = false) => {
        try {
            const response = await api.get('/admin/products', {
                params: { page, size, sortBy, sortDir, includeDeleted }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get products error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch products'
            };
        }
    },

    getProductById: async (id) => {
        try {
            const response = await api.get(`/products/${id}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get product by ID error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch product'
            };
        }
    },

    createProduct: async (productData) => {
        try {
            const payload = {
                ...productData,
                images: productData.images || [],
                availableSizes: productData.availableSizes || []
            };
            
            const response = await api.post('/admin/products', payload);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Create product error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create product'
            };
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/admin/products/${id}`, productData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Update product error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update product'
            };
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/admin/products/${id}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Delete product error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete product'
            };
        }
    },

    getLowStockProducts: async (page = 0, size = 10) => {
        try {
            const response = await api.get('/admin/products/low-stock', {
                params: { page, size }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Low stock products error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch low stock products'
            };
        }
    },

    getOrders: async (page = 0, size = 10, status = null) => {
        try {
            const params = { page, size };
            if (status) params.status = status;
            
            const response = await api.get('/admin/orders', { params });
            
            let ordersData = response.data;
            
            if (ordersData && ordersData.content) {
                return {
                    success: true,
                    data: ordersData
                };
            }
            else if (ordersData && ordersData.data) {
                return {
                    success: ordersData.success !== false,
                    data: ordersData.data,
                    message: ordersData.message
                };
            }
            else if (Array.isArray(ordersData)) {
                return {
                    success: true,
                    data: ordersData
                };
            }
            else {
                return {
                    success: true,
                    data: ordersData
                };
            }
        } catch (error) {
            console.error('Get orders error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch orders'
            };
        }
    },

    // FIXED: getOrderById - properly handles the response
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/admin/orders/${orderId}`);
            
            // Handle different response structures
            if (response.data && response.data.success !== undefined) {
                return {
                    success: response.data.success,
                    data: response.data.data || response.data,
                    message: response.data.message
                };
            }
            
            // If the response is directly the order data
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get order error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch order'
            };
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.put(`/admin/orders/${orderId}/status`, null, {
                params: { status }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Update order error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update order status'
            };
        }
    },

    getUsers: async (page = 0, size = 10, role = null, search = null) => {
        try {
            const params = { page, size };
            if (role) params.role = role;
            if (search) params.search = search;
            
            const response = await api.get('/admin/users', { params });
            
            if (response.data && typeof response.data === 'object') {
                return {
                    success: true,
                    data: response.data
                };
            }
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get users error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch users',
                data: { content: [], totalElements: 0, totalPages: 0 }
            };
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            const response = await api.put(`/admin/users/${userId}/role`, null, {
                params: { role }
            });
            
            if (response.data && response.data.success !== undefined) {
                return response.data;
            }
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Update user role error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update user role'
            };
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            
            if (response.data && response.data.success !== undefined) {
                return response.data;
            }
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Delete user error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete user'
            };
        }
    },

    debugRevenue: async () => {
        try {
            const response = await api.get('/admin/debug/revenue');
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Debug revenue error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch debug data'
            };
        }
    }
};