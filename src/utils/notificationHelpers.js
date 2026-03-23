export const NOTIFICATION_MESSAGES = {
    // Auth messages
    LOGIN_SUCCESS: 'Successfully logged in!',
    LOGIN_ERROR: 'Failed to log in. Please check your credentials.',
    REGISTER_SUCCESS: 'Account created successfully!',
    REGISTER_ERROR: 'Failed to create account. Please try again.',
    LOGOUT_SUCCESS: 'Successfully logged out.',
    
    // Cart messages
    ADD_TO_CART_SUCCESS: 'Item added to cart successfully!',
    ADD_TO_CART_ERROR: 'Failed to add item to cart.',
    REMOVE_FROM_CART_SUCCESS: 'Item removed from cart.',
    UPDATE_CART_SUCCESS: 'Cart updated successfully.',
    CLEAR_CART_SUCCESS: 'Cart cleared successfully.',
    
    // Wishlist messages
    ADD_TO_WISHLIST_SUCCESS: 'Item added to wishlist!',
    REMOVE_FROM_WISHLIST_SUCCESS: 'Item removed from wishlist.',
    
    // Order messages
    ORDER_PLACED_SUCCESS: 'Order placed successfully!',
    ORDER_CANCELLED_SUCCESS: 'Order cancelled successfully.',
    
    // Payment messages
    PAYMENT_SUCCESS: 'Payment completed successfully!',
    PAYMENT_ERROR: 'Payment failed. Please try again.',
    
    // Profile messages
    PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
    PROFILE_UPDATE_ERROR: 'Failed to update profile.',
    
    // Review messages
    REVIEW_SUBMITTED_SUCCESS: 'Review submitted successfully!',
    REVIEW_SUBMITTED_ERROR: 'Failed to submit review.',
    
    // General messages
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.'
};

export const createNotificationAction = (label, onClick) => ({
    label,
    onClick
});

export const withNotification = (fn, notificationFn, message) => {
    return async (...args) => {
        try {
            const result = await fn(...args);
            if (result?.success !== false) {
                notificationFn.success(message?.success || 'Operation successful');
            } else {
                notificationFn.error(result?.message || message?.error || 'Operation failed');
            }
            return result;
        } catch (error) {
            notificationFn.error(error?.message || 'An unexpected error occurred');
            throw error;
        }
    };
};