import api from './api';

export const wishlistService = {
    // Get user's wishlist with product details (including stock)
    getWishlist: async () => {
        try {
            const response = await api.get('/wishlist');
            
            let wishlistItems = [];
            
            // Extract wishlist items from response
            if (response.data && response.data.data !== undefined) {
                wishlistItems = response.data.data || [];
            } else if (Array.isArray(response.data)) {
                wishlistItems = response.data;
            }
            
            // For each wishlist item, fetch product details to get real stock status
            const itemsWithStock = await Promise.all(
                wishlistItems.map(async (item) => {
                    const productId = item.productId || item.id;
                    if (!productId) return item;
                    
                    try {
                        // Fetch product details to get stock information
                        const productResponse = await api.get(`/products/${productId}`);
                        const productData = productResponse.data?.data || productResponse.data;
                        
                        return {
                            ...item,
                            // Stock information from product data
                            stock: productData?.stock || 0,
                            inStock: (productData?.stock || 0) > 0,
                            quantity: productData?.quantity || productData?.stock || 0,
                            available: productData?.available !== undefined ? productData.available : (productData?.stock || 0) > 0,
                            // Also update price in case it changed
                            price: productData?.price || item.price,
                            originalPrice: productData?.originalPrice || item.originalPrice,
                            // Update name in case it changed
                            name: productData?.name || item.name,
                            // Update image in case it changed
                            imageUrl: productData?.images?.[0] || item.imageUrl || item.image,
                            // Update brand
                            brand: productData?.brand || item.brand,
                            // Update condition
                            condition: productData?.condition || item.condition,
                            // Update size
                            size: productData?.size || item.size
                        };
                    } catch (productError) {
                        console.error(`Failed to fetch product ${productId}:`, productError);
                        // Return original item with out of stock status
                        return {
                            ...item,
                            stock: 0,
                            inStock: false,
                            available: false
                        };
                    }
                })
            );
            
            return {
                success: true,
                data: itemsWithStock
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

    // Add item to wishlist
    addToWishlist: async (productId, productDetails = {}) => {
        try {
            const payload = {
                productId,
                ...productDetails
            };
            
            const response = await api.post('/wishlist/items', payload);
            
            if (response.data && response.data.success !== undefined) {
                return {
                    success: response.data.success,
                    message: response.data.message,
                    data: response.data.data
                };
            }
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Add to wishlist error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add to wishlist'
            };
        }
    },

    // Remove item from wishlist
    removeFromWishlist: async (productId) => {
        try {
            const response = await api.delete(`/wishlist/items/${productId}`);
            
            if (response.data && response.data.success !== undefined) {
                return {
                    success: response.data.success,
                    message: response.data.message,
                    data: response.data.data
                };
            }
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to remove from wishlist'
            };
        }
    },

    // Clear entire wishlist
    clearWishlist: async () => {
        try {
            const response = await api.delete('/wishlist');
            
            if (response.data && response.data.success !== undefined) {
                return {
                    success: response.data.success,
                    message: response.data.message,
                    data: response.data.data
                };
            }
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Clear wishlist error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to clear wishlist'
            };
        }
    },

    // Check if item is in wishlist
    checkInWishlist: async (productId) => {
        try {
            const response = await api.get(`/wishlist/check/${productId}`);
            
            if (response.data && response.data.data !== undefined) {
                return {
                    success: true,
                    inWishlist: response.data.data
                };
            } else if (typeof response.data === 'boolean') {
                return {
                    success: true,
                    inWishlist: response.data
                };
            } else if (response.data && response.data.success !== undefined) {
                return {
                    success: response.data.success,
                    inWishlist: response.data.data || false
                };
            }
            
            return {
                success: true,
                inWishlist: false
            };
        } catch (error) {
            console.error('Check wishlist error:', error);
            return {
                success: false,
                inWishlist: false,
                message: error.response?.data?.message || 'Failed to check wishlist'
            };
        }
    },

    // Get wishlist count
    getWishlistCount: async () => {
        try {
            const response = await api.get('/wishlist/count');
            
            if (response.data && response.data.data !== undefined) {
                return {
                    success: true,
                    count: response.data.data || 0
                };
            } else if (typeof response.data === 'number') {
                return {
                    success: true,
                    count: response.data
                };
            } else if (response.data && response.data.count !== undefined) {
                return {
                    success: true,
                    count: response.data.count
                };
            }
            
            return {
                success: true,
                count: 0
            };
        } catch (error) {
            console.error('Get wishlist count error:', error);
            return {
                success: false,
                count: 0,s
                message: error.response?.data?.message || 'Failed to get wishlist count'
            };
        }
    }
};