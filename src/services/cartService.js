import api from './api';

export const cartService = {
    // Get current user's cart
    getCart: async () => {
        try {
            console.log('Fetching cart from backend...');
            const response = await api.get('/cart');
            console.log('Cart response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get cart error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch cart',
                data: { items: [], totalItems: 0, totalPrice: 0 }
            };
        }
    },

    // Add item to cart
    addToCart: async (item) => {
        try {
            console.log('Adding to cart with data:', item);
            
            // Ensure the data matches what backend expects
            const cartItem = {
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity || 1,
                size: item.size || 'One Size',
                imageUrl: item.imageUrl
            };
            
            console.log('Sending to backend:', cartItem);
            
            const response = await api.post('/cart/items', cartItem);
            console.log('Add to cart response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Add to cart error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add item to cart'
            };
        }
    },

    // Update item quantity
    updateItemQuantity: async (productId, size, quantity) => {
        try {
            const updateData = {
                productId: productId,
                size: size || 'One Size',
                quantity: quantity
            };
            
            console.log('Updating quantity with data:', updateData);
            
            const response = await api.put('/cart/items', updateData);
            console.log('Update quantity response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Update quantity error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update cart'
            };
        }
    },

    // Remove item from cart
    removeFromCart: async (productId, size) => {
        try {
            const removeData = {
                productId: productId,
                size: size || 'One Size'
            };
            
            console.log('Removing item with data:', removeData);
            
            const response = await api.delete('/cart/items', {
                data: removeData
            });
            console.log('Remove from cart response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Remove from cart error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to remove item'
            };
        }
    },

    // Update entire cart 
    updateCart: async (items) => {
        try {
            console.log('Updating entire cart with items:', items);
            
            // Don't send empty array to clear cart unintentionally
            if (!items || items.length === 0) {
                console.log('⚠️ Skipping empty cart sync - not sending to backend');
                return { 
                    success: true, 
                    message: 'Empty cart sync skipped',
                    data: { items: [] }
                };
            }
            
            // Format items for backend
            const formattedItems = items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                imageUrl: item.imageUrl
            }));
            
            const response = await api.put('/cart', { items: formattedItems });
            console.log('Update cart response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Update cart error:', error);
            console.error('Error response:', error.response?.data);
            
            // If 405 Method Not Allowed fall back to individual updates
            if (error.response?.status === 405) {
                console.warn('Bulk cart update not supported, falling back to individual updates');
                
                // Skip if no items to update
                if (!items || items.length === 0) {
                    return { success: true, message: 'No items to update' };
                }
                
                // Update each item individually
                const results = await Promise.allSettled(
                    items.map(item => 
                        api.put('/cart/items', {
                            productId: item.productId,
                            size: item.size,
                            quantity: item.quantity
                        })
                    )
                );
                
                const failed = results.filter(r => r.status === 'rejected');
                if (failed.length > 0) {
                    console.error('Some items failed to update:', failed);
                    return {
                        success: false,
                        message: 'Some items failed to update',
                        failedCount: failed.length
                    };
                }
                
                return {
                    success: true,
                    message: 'Cart updated successfully'
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update cart'
            };
        }
    },

    // Merge guest cart with user cart
    mergeCart: async (guestItems) => {
        try {
            console.log('Merging guest items:', guestItems);
            
            const response = await api.post('/cart/merge', { items: guestItems });
            console.log('Merge cart response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Merge cart error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to merge cart'
            };
        }
    },

    // Clear cart
    clearCart: async () => {
        try {
            console.log('Clearing cart...');
            const response = await api.delete('/cart');
            console.log('Clear cart response:', response.data);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Clear cart error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to clear cart'
            };
        }
    },

    // Get cart count
    getCartCount: async () => {
        try {
            console.log('Fetching cart count...');
            const response = await api.get('/cart/count');
            console.log('Cart count response:', response.data);
            return {
                success: true,
                count: response.data?.count || 0
            };
        } catch (error) {
            console.error('Get cart count error:', error);
            console.error('Error response:', error.response?.data);
            return {
                success: false,
                count: 0,
                message: error.response?.data?.message || 'Failed to get cart count'
            };
        }
    }
};