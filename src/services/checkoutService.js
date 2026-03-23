import api from './api';

export const checkoutService = {
    // Initiate checkout and payment
    initiateCheckout: async (checkoutData) => {
        try {
            console.log('Initiating checkout with data:', checkoutData);
            const response = await api.post('/checkout/initiate', checkoutData);
            console.log('Checkout response:', response.data);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Checkout error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to initiate checkout',
                error: error.response?.data || error.message
            };
        }
    },

    // Check order status
    getOrderStatus: async (orderNumber) => {
        try {
            console.log('Fetching order status for:', orderNumber);
            const response = await api.get(`/checkout/status/${orderNumber}`);
            console.log('Order status response:', response.data);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get order status error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            // Special handling for 404 
            if (error.response?.status === 404) {
                return {
                    success: false,
                    notFound: true,
                    message: 'Order not found or still processing'
                };
            }
            
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get order status',
                error: error.response?.data || error.message
            };
        }
    },

    // Get order by checkout request ID
    getOrderByCheckoutId: async (checkoutRequestId) => {
        try {
            console.log('Fetching order for checkout ID:', checkoutRequestId);
            const response = await api.get(`/checkout/checkout-status/${checkoutRequestId}`);
            console.log('Order by checkout ID response:', response.data);
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get order by checkout ID error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get order',
                error: error.response?.data || error.message
            };
        }
    }
};