import api from './api';

export const cartService = {
    // Get current user's cart
    getCart: async () => {
        const token = localStorage.getItem('token');
        
        if (token) {
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
        } else {
            // Guest - get from localStorage
            return cartService.getGuestCart();
        }
    },

    // Get guest cart from localStorage
    getGuestCart: () => {
        try {
            const savedCart = localStorage.getItem('cart');
            const cartItems = localStorage.getItem('cartItems');
            
            if (cartItems) {
                const items = JSON.parse(cartItems);
                return {
                    success: true,
                    data: {
                        items: items,
                        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
                        totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    }
                };
            }
            
            if (savedCart) {
                const cart = JSON.parse(savedCart);
                const items = cart.items || [];
                return {
                    success: true,
                    data: {
                        items: items,
                        totalItems: cart.totalItems || items.reduce((sum, item) => sum + item.quantity, 0),
                        totalPrice: cart.totalPrice || items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    }
                };
            }
            
            return {
                success: true,
                data: { items: [], totalItems: 0, totalPrice: 0 }
            };
        } catch (error) {
            console.error('Error reading guest cart:', error);
            return {
                success: true,
                data: { items: [], totalItems: 0, totalPrice: 0 }
            };
        }
    },

    // Save guest cart to localStorage
    saveGuestCart: (items) => {
        try {
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            localStorage.setItem('cartItems', JSON.stringify(items));
            localStorage.setItem('cart', JSON.stringify({
                items: items,
                totalItems: totalItems,
                totalPrice: totalPrice
            }));
            console.log('✅ Guest cart saved to localStorage');
        } catch (error) {
            console.error('Failed to save guest cart:', error);
        }
    },

    // Clear guest cart from localStorage
    clearGuestCart: () => {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartItems');
        console.log('🗑️ Guest cart cleared');
    },

    // Merge guest cart with user cart (called after login)
    mergeGuestCart: async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('No token found, cannot merge cart');
            return { success: false, message: 'User not logged in' };
        }
        
        // Get guest cart from localStorage
        const guestCartResult = cartService.getGuestCart();
        const guestItems = guestCartResult.data?.items || [];
        
        if (guestItems.length === 0) {
            console.log('No guest cart to merge');
            return { success: true, message: 'No guest cart to merge' };
        }
        
        console.log('🔄 Merging guest cart with user cart:', guestItems);
        
        try {
            // Send guest items to backend to merge
            const response = await api.post('/cart/merge', { items: guestItems });
            
            if (response.data.success) {
                // Clear guest cart after successful merge
                cartService.clearGuestCart();
                console.log('✅ Guest cart merged and cleared');
                return { success: true, message: 'Cart merged successfully' };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Failed to merge cart:', error);
            
            // Fallback: If merge endpoint doesn't exist or fails, add items one by one
            let successCount = 0;
            for (const item of guestItems) {
                try {
                    await api.post('/cart/items', {
                        productId: item.productId,
                        productName: item.productName,
                        price: item.price,
                        quantity: item.quantity,
                        size: item.size || 'One Size',
                        imageUrl: item.imageUrl
                    });
                    successCount++;
                } catch (err) {
                    console.error(`Failed to add item ${item.productId}:`, err);
                }
            }
            
            if (successCount > 0) {
                cartService.clearGuestCart();
                return { 
                    success: true, 
                    mergedCount: successCount, 
                    totalCount: guestItems.length,
                    message: `${successCount} of ${guestItems.length} items merged successfully`
                };
            }
            
            return { 
                success: false, 
                message: 'Failed to merge cart items' 
            };
        }
    },

    // Add item to cart
    addToCart: async (item) => {
        const token = localStorage.getItem('token');
        
        // Ensure the data matches what backend expects
        const cartItem = {
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity || 1,
            size: item.size || 'One Size',
            imageUrl: item.imageUrl
        };
        
        if (token) {
            // Logged in - add to backend
            try {
                console.log('Adding to cart with data:', cartItem);
                const response = await api.post('/cart/items', cartItem);
                console.log('Add to cart response:', response.data);
                return {
                    success: true,
                    data: response.data
                };
            } catch (error) {
                console.error('Add to cart error:', error);
                console.error('Error response:', error.response?.data);
                return {
                    success: false,
                    message: error.response?.data?.message || 'Failed to add item to cart'
                };
            }
        } else {
            // Guest - add to localStorage
            const guestCart = cartService.getGuestCart();
            const items = guestCart.data?.items || [];
            
            const existingIndex = items.findIndex(
                i => i.productId === cartItem.productId && i.size === cartItem.size
            );
            
            if (existingIndex >= 0) {
                items[existingIndex].quantity += cartItem.quantity;
            } else {
                items.push(cartItem);
            }
            
            cartService.saveGuestCart(items);
            return { 
                success: true, 
                message: 'Added to cart (guest)',
                data: { items: items }
            };
        }
    },

    // Update item quantity
    updateItemQuantity: async (productId, size, quantity) => {
        const token = localStorage.getItem('token');
        const updateData = {
            productId: productId,
            size: size || 'One Size',
            quantity: quantity
        };
        
        if (token) {
            try {
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
        } else {
            // Guest - update in localStorage
            const guestCart = cartService.getGuestCart();
            const items = guestCart.data?.items || [];
            
            const item = items.find(i => i.productId === productId && i.size === size);
            if (item) {
                item.quantity = quantity;
                cartService.saveGuestCart(items);
            }
            
            return { success: true, message: 'Quantity updated (guest)' };
        }
    },

    // Remove item from cart
    removeFromCart: async (productId, size) => {
        const token = localStorage.getItem('token');
        const removeData = {
            productId: productId,
            size: size || 'One Size'
        };
        
        if (token) {
            try {
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
        } else {
            // Guest - remove from localStorage
            const guestCart = cartService.getGuestCart();
            let items = guestCart.data?.items || [];
            
            items = items.filter(i => !(i.productId === productId && i.size === size));
            
            cartService.saveGuestCart(items);
            return { success: true, message: 'Removed from cart (guest)' };
        }
    },

    // Update entire cart 
    updateCart: async (items) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            // Guest - save to localStorage
            cartService.saveGuestCart(items);
            return { success: true, message: 'Cart saved locally' };
        }
        
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

    // Clear cart
    clearCart: async () => {
        const token = localStorage.getItem('token');
        
        if (token) {
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
        } else {
            cartService.clearGuestCart();
            return { success: true, message: 'Guest cart cleared' };
        }
    },

    // Get cart count
    getCartCount: async () => {
        const token = localStorage.getItem('token');
        
        if (token) {
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
                const guestCart = cartService.getGuestCart();
                return {
                    success: true,
                    count: guestCart.data?.items?.length || 0
                };
            }
        } else {
            const guestCart = cartService.getGuestCart();
            return {
                success: true,
                count: guestCart.data?.items?.length || 0
            };
        }
    }
};