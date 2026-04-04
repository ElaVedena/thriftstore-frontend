import api from './api';

export const productService = {
    // Get all products with pagination
    getProducts: async (page = 0, size = 12, sortBy = 'id', sortDir = 'desc') => {
        try {
            console.log(`📋 getProducts: page=${page}, size=${size}, sortBy=${sortBy}, sortDir=${sortDir}`);
            const response = await api.get('/products', {
                params: { page, size, sortBy, sortDir }
            });
            console.log('📋 getProducts response:', response.data);
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch products',
                data: { content: [], totalPages: 0, totalElements: 0 }
            };
        }
    },

    // Get featured products - using main products endpoint
    getFeaturedProducts: async (limit = 4) => {
        try {
            console.log(`⭐ getFeaturedProducts: limit=${limit}`);
            
            // Get products directly from main endpoint
            const response = await api.get('/products', {
                params: { page: 0, size: limit, sortBy: 'id', sortDir: 'desc' }
            });
            
            // Extract products from response
            let products = [];
            if (response.data?.content) {
                products = response.data.content;
            } else if (Array.isArray(response.data)) {
                products = response.data;
            } else if (response.data?.data) {
                products = response.data.data;
            } else {
                products = response.data || [];
            }
            
            console.log(`⭐ Found ${products.length} products for featured section`);
            return {
                success: true,
                data: products
            };
            
        } catch (error) {
            console.error('Failed to fetch featured products:', error);
            return {
                success: false,
                message: 'Failed to fetch products',
                data: []
            };
        }
    },

    // Get new arrivals - using main products endpoint with createdAt sorting
    getNewArrivals: async (limit = 4) => {
        try {
            console.log(`🆕 getNewArrivals: limit=${limit}`);
            
            // Get products sorted by creation date (newest first)
            const response = await api.get('/products', {
                params: { page: 0, size: limit, sortBy: 'createdAt', sortDir: 'desc' }
            });
            
            // Extract products
            let products = [];
            if (response.data?.content) {
                products = response.data.content;
            } else if (Array.isArray(response.data)) {
                products = response.data;
            } else if (response.data?.data) {
                products = response.data.data;
            } else {
                products = response.data || [];
            }
            
            console.log(`🆕 Found ${products.length} new arrivals`);
            return {
                success: true,
                data: products
            };
            
        } catch (error) {
            console.error('Failed to fetch new arrivals:', error);
            return {
                success: false,
                message: 'Failed to fetch new arrivals',
                data: []
            };
        }
    },

    // Get product by ID
    getProductById: async (id) => {
        try {
            console.log(`🔍 getProductById: id=${id}`);
            const response = await api.get(`/products/${id}`);
            console.log('🔍 getProductById response:', response.data);
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error('Error fetching product:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch product'
            };
        }
    },

    // Search products
    searchProducts: async (query, page = 0, size = 12) => {
        try {
            console.log(`🔎 searchProducts: query=${query}, page=${page}, size=${size}`);
            const response = await api.get('/products/search', {
                params: { q: query, page, size }
            });
            console.log('🔎 searchProducts response:', response.data);
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error('Error searching products:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Search failed',
                data: { content: [], totalPages: 0 }
            };
        }
    },

    // Filter products
    filterProducts: async (filters, page = 0, size = 12) => {
        try {
            console.log('🎯 filterProducts called with:', { filters, page, size });
            
            const params = { ...filters, page, size };
            console.log('📤 Sending params to backend:', params);
            
            const response = await api.get('/products/filter', {
                params: params
            });
            
            console.log('📥 filterProducts response status:', response.status);
            console.log('📥 filterProducts response data:', response.data);
            
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error(' Error filtering products:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Filter failed',
                data: { content: [], totalPages: 0 }
            };
        }
    },

    // Get products by category
    getProductsByCategory: async (category, page = 0, size = 12) => {
        try {
            console.log(`📁 getProductsByCategory: category=${category}, page=${page}, size=${size}`);
            const response = await api.get('/products/filter', {
                params: { category, page, size }
            });
            console.log('📁 getProductsByCategory response:', response.data);
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.error('Error fetching products by category:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch products',
                data: { content: [], totalPages: 0 }
            };
        }
    }
};