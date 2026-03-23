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
            console.error('❌ Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch products',
                data: { content: [], totalPages: 0, totalElements: 0 }
            };
        }
    },

    // Get featured products
    getFeaturedProducts: async (limit = 4) => {
        try {
            // Try to get from featured endpoint first
            console.log(`⭐ getFeaturedProducts: limit=${limit}`);
            const response = await api.get('/products/featured', {
                params: { limit }
            });
            
            console.log('⭐ getFeaturedProducts response:', response.data);
            return { 
                success: true, 
                data: response.data 
            };
            
        } catch (error) {
            console.log('Featured endpoint not available, using random products from database');
            
           
            try {
                // Get a larger set of products and randomly select 'limit' number
                const response = await api.get('/products', {
                    params: { page: 0, size: 20 } 
                });
                
                // Extract products from response 
                let products = [];
                if (response.data?.content) {
                    products = response.data.content;
                } else if (Array.isArray(response.data)) {
                    products = response.data;
                } else {
                    products = response.data || [];
                }
                
                // If we have products, randomly select 'limit' number of them
                if (products.length > 0) {
                    // Shuffle array and take first 'limit' items
                    const shuffled = [...products].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, Math.min(limit, products.length));
                    
                    console.log(`Selected ${selected.length} random products for featured section`);
                    return {
                        success: true,
                        data: selected
                    };
                }
                
                return {
                    success: true,
                    data: [] 
                };
                
            } catch (fallbackError) {
                console.error('Failed to fetch products for featured section:', fallbackError);
                return {
                    success: false,
                    message: 'Failed to fetch products',
                    data: [] 
                };
            }
        }
    },

    // Get new arrivals
    getNewArrivals: async (limit = 4) => {
        try {
            console.log(`🆕 getNewArrivals: limit=${limit}`);
            const response = await api.get('/products/new-arrivals', {
                params: { limit }
            });
            console.log('🆕 getNewArrivals response:', response.data);
            return { 
                success: true, 
                data: response.data 
            };
        } catch (error) {
            console.log('New arrivals endpoint not available, using recent products from database');
            
            // Fallback to regular products sorted by creation date
            try {
                const response = await api.get('/products', {
                    params: { page: 0, size: limit, sortBy: 'createdAt', sortDir: 'desc' }
                });
                
                // Extract products
                let products = [];
                if (response.data?.content) {
                    products = response.data.content;
                } else if (Array.isArray(response.data)) {
                    products = response.data;
                } else {
                    products = response.data || [];
                }
                
                console.log(`🆕 Found ${products.length} recent products`);
                return {
                    success: true,
                    data: products
                };
            } catch (fallbackError) {
                console.error('Failed to fetch new arrivals:', fallbackError);
                return {
                    success: false,
                    message: 'Failed to fetch new arrivals',
                    data: []
                };
            }
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
            console.error(' Error response:', error.response?.data);
            console.error(' Error status:', error.response?.status);
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