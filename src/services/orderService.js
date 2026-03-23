import api from './api';

export const orderService = {
    // Create new order
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create order'
            };
        }
    },

    // Get user's orders
    getMyOrders: async (page = 0, size = 10) => {
        try {
            const response = await api.get('/orders/my-orders', {
                params: { page, size }
            });
            
            // Handle different response structures
            let orders = [];
            if (response.data && response.data.content) {
                orders = response.data.content;
            } else if (Array.isArray(response.data)) {
                orders = response.data;
            } else if (response.data && response.data.orders) {
                orders = response.data.orders;
            } else if (response.data && response.data.data && response.data.data.content) {
                orders = response.data.data.content;
            }

            return {
                success: true,
                data: response.data,
                orders: orders
            };
        } catch (error) {
            console.error('Get my orders error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch orders',
                orders: []
            };
        }
    },

    // Get single order by ID
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return {
                success: true,
                data: response.data,
                order: response.data
            };
        } catch (error) {
            console.error('Get order error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch order'
            };
        }
    },

    // Get user orders 
    getUserOrders: async (userId) => {
        try {
            console.log('Fetching orders for user:', userId);
            
            const response = await api.get('/orders/my-orders', {
                params: { page: 0, size: 100 }
            });
            
            console.log('Orders API response:', response.data);
            
            // Handle different response structures
            let orders = [];
            
            // Check for nested data structure 
            if (response.data && response.data.data && response.data.data.content) {
                orders = response.data.data.content;
                console.log('Found orders in data.content:', orders);
            } 
            // Check for direct content
            else if (response.data && response.data.content) {
                orders = response.data.content;
                console.log('Found orders in content:', orders);
            } 
            // Check for orders array directly
            else if (Array.isArray(response.data)) {
                orders = response.data;
                console.log('Found orders as array:', orders);
            } 
            // Check for orders property
            else if (response.data && response.data.orders) {
                orders = response.data.orders;
                console.log('Found orders in orders field:', orders);
            } 
            // Check for data property that might be an array
            else if (response.data && response.data.data) {
                if (Array.isArray(response.data.data)) {
                    orders = response.data.data;
                } else if (response.data.data.content) {
                    orders = response.data.data.content;
                }
                console.log('Found orders in data field:', orders);
            }
            
            
            if (!Array.isArray(orders)) {
                console.error('Orders is not an array, converting to empty array:', orders);
                orders = [];
            }
            
            console.log('Final orders array:', orders);
            return orders;
        } catch (error) {
            console.error('Get user orders error:', error);
            console.error('Error response:', error.response?.data);
            return [];
        }
    },

    // Check if user has purchased a specific product
    hasPurchasedProduct: async (userId, productId) => {
        try {
            console.log('Checking purchase for user:', userId, 'product:', productId);
            
            const orders = await orderService.getUserOrders(userId);
            console.log('Orders for purchase check:', orders);
            
            // Ensure orders is an array
            if (!Array.isArray(orders)) {
                console.error('Orders is not an array:', orders);
                return {
                    success: false,
                    purchased: false,
                    delivered: false,
                    error: 'Invalid orders data'
                };
            }

            // Log each order for debugging
            orders.forEach((order, index) => {
                console.log(`Order ${index}:`, {
                    id: order.id,
                    status: order.status,
                    items: order.items?.map(i => ({
                        productId: i.productId || i.product?.id || i.id,
                        name: i.productName || i.name
                    }))
                });
            });
            
            // Check if any DELIVERED order contains this product
            const hasDeliveredOrder = orders.some(order => {
                const orderStatus = order.status?.toUpperCase();
                
                const isDelivered = orderStatus === 'DELIVERED' || 
                                    orderStatus === 'DELIVERD' || 
                                    orderStatus === 'COMPLETED';
                
                if (!isDelivered) return false;
                
                return order.items?.some(item => {
                    const itemProductId = item.productId || item.product?.id || item.id;
                    // Use strict equality and convert both to same type
                    return String(itemProductId) === String(productId);
                });
            });

            // Check if any order contains this product
            const hasPurchased = orders.some(order => 
                order.items?.some(item => {
                    const itemProductId = item.productId || item.product?.id || item.id;
                    return String(itemProductId) === String(productId);
                })
            );

            console.log('Has purchased:', hasPurchased, 'Has delivered:', hasDeliveredOrder);

            return {
                success: true,
                purchased: hasPurchased,
                delivered: hasDeliveredOrder
            };
        } catch (error) {
            console.error('Check purchase error:', error);
            return {
                success: false,
                purchased: false,
                delivered: false,
                error: error.message
            };
        }
    },

    // Get all products eligible for review 
    getEligibleForReview: async (userId) => {
        try {
            const orders = await orderService.getUserOrders(userId);

            // Ensure orders is an array
            if (!Array.isArray(orders)) {
                console.error('Orders is not an array:', orders);
                return {
                    success: false,
                    eligibleProducts: []
                };
            }

            // Extract unique product IDs from delivered orders
            const eligibleProducts = new Map();
            
            orders.forEach(order => {
                const orderStatus = order.status?.toUpperCase();
                const isDelivered = orderStatus === 'DELIVERED' || 
                                   orderStatus === 'DELIVERD' || 
                                   orderStatus === 'COMPLETED';
                
                if (isDelivered && order.items) {
                    order.items.forEach(item => {
                        const productId = item.productId || item.product?.id || item.id;
                        const productName = item.productName || item.product?.name || 'Product';
                        const productImage = item.imageUrl || item.product?.images?.[0];
                        
                        if (productId && !eligibleProducts.has(productId)) {
                            eligibleProducts.set(productId, {
                                productId,
                                productName,
                                productImage,
                                orderDate: order.deliveredAt || order.updatedAt || order.createdAt
                            });
                        }
                    });
                }
            });

            return {
                success: true,
                eligibleProducts: Array.from(eligibleProducts.values())
            };
        } catch (error) {
            console.error('Get eligible products error:', error);
            return {
                success: false,
                eligibleProducts: []
            };
        }
    },

    // Admin Get all orders
    getAllOrders: async (page = 0, size = 20, status = null) => {
        try {
            const params = { page, size };
            if (status) params.status = status;
            
            const response = await api.get('/orders/admin/all', { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Get all orders error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch orders'
            };
        }
    },

    // Admin Update order status
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.put(`/orders/admin/${orderId}/status`, null, {
                params: { status }
            });
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Update order status error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update order status'
            };
        }
    }
};