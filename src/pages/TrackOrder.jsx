import { useState, useEffect, useCallback } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import CloudinaryImage from '../components/common/CloudinaryImage';
import '../components/css/TrackOrder.css';

function TrackOrder() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Wrap loadOrder in useCallback
    const loadOrder = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await orderService.getOrderById(orderId);
            console.log('Order response:', response);
            
            if (response.success) {
                // Extract order data from different possible response structures
                let orderData = response.order || response.data || response;
                
                // If order is nested inside a 'data' property
                if (orderData.data && !orderData.orderNumber) {
                    orderData = orderData.data;
                }
                
                console.log('Extracted order data:', orderData);
                setOrder(orderData);
            } else {
                setError(response.message || 'Failed to load order');
            }
        } catch (error) {
            console.error('Error loading order:', error);
            setError(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        loadOrder();
    }, [loadOrder]);

    const formatPrice = (price) => `KSh ${(price || 0).toFixed(2)}`;

    // Helper function to get normalized status (lowercase for display)
    const getNormalizedStatus = (status) => {
        if (!status) return 'pending';
        return status.toLowerCase();
    };

    // Helper function to check if order status matches a given status
    const isStatus = (statusToCheck) => {
        const currentStatus = getNormalizedStatus(order?.status);
        return currentStatus === statusToCheck.toLowerCase();
    };

    // Get status for progress bar (mapping backend statuses to progress steps)
    const getStatusProgress = (status) => {
        const statusMap = {
            'pending': 25,
            'pending_payment': 25,
            'paid': 50,
            'processing': 50,
            'shipped': 75,
            'delivered': 100,
            'cancelled': 0
        };
        
        const normalizedStatus = getNormalizedStatus(status);
        return statusMap[normalizedStatus] || 25;
    };

    // Determine if a step is active based on order status
    const isStepActive = (stepName) => {
        const status = getNormalizedStatus(order?.status);
        const stepMap = {
            'pending': status === 'pending' || status === 'pending_payment',
            'processing': status === 'paid' || status === 'processing',
            'shipped': status === 'shipped',
            'delivered': status === 'delivered'
        };
        return stepMap[stepName] || false;
    };

    // Determine if a step is completed (passed this stage)
    const isStepCompleted = (stepName) => {
        const status = getNormalizedStatus(order?.status);
        const completedMap = {
            'pending': status !== 'pending' && status !== 'pending_payment',
            'processing': status === 'shipped' || status === 'delivered',
            'shipped': status === 'delivered',
            'delivered': false
        };
        return completedMap[stepName] || false;
    };

    if (loading) {
        return (
            <div className="track-order-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading tracking information...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="track-order-error">
                <i className="fas fa-exclamation-circle"></i>
                <p>{error || 'Order not found'}</p>
                <Link to="/orders" className="back-btn">Back to Orders</Link>
            </div>
        );
    }

    return (
        <div className="track-order-page">
            <div className="track-order-header">
                <h1>Track Your Order</h1>
                <p>Order #{order.orderNumber || order.id}</p>
            </div>

            <div className="track-order-container">
                {/* Progress Bar */}
                <div className="tracking-progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${getStatusProgress(order.status)}%` }}
                        ></div>
                    </div>
                    <div className="progress-steps">
                        <div className={`step ${isStepActive('pending') ? 'active' : ''} ${isStepCompleted('pending') ? 'completed' : ''}`}>
                            <i className="fas fa-clock"></i>
                            <span>Pending</span>
                        </div>
                        <div className={`step ${isStepActive('processing') ? 'active' : ''} ${isStepCompleted('processing') ? 'completed' : ''}`}>
                            <i className="fas fa-cog"></i>
                            <span>Processing</span>
                        </div>
                        <div className={`step ${isStepActive('shipped') ? 'active' : ''} ${isStepCompleted('shipped') ? 'completed' : ''}`}>
                            <i className="fas fa-truck"></i>
                            <span>Shipped</span>
                        </div>
                        <div className={`step ${isStepActive('delivered') ? 'active' : ''} ${isStepCompleted('delivered') ? 'completed' : ''}`}>
                            <i className="fas fa-check-circle"></i>
                            <span>Delivered</span>
                        </div>
                    </div>
                </div>

                {/* Current Status Message */}
                <div className="status-message-card">
                    <i className={`fas ${
                        order.status?.toLowerCase() === 'delivered' ? 'fa-check-circle' :
                        order.status?.toLowerCase() === 'shipped' ? 'fa-truck' :
                        order.status?.toLowerCase() === 'processing' || order.status?.toLowerCase() === 'paid' ? 'fa-cog fa-spin' :
                        'fa-clock'
                    }`}></i>
                    <div className="status-message-content">
                        <h3>Current Status: {order.status || 'Processing'}</h3>
                        <p>
                            {order.status?.toLowerCase() === 'delivered' && 'Your order has been delivered. Thank you for shopping with us!'}
                            {order.status?.toLowerCase() === 'shipped' && 'Your order is on the way! Track your package using the tracking number.'}
                            {(order.status?.toLowerCase() === 'processing' || order.status?.toLowerCase() === 'paid') && 'Your order is being processed. We\'ll notify you when it ships.'}
                            {(order.status?.toLowerCase() === 'pending' || order.status?.toLowerCase() === 'pending_payment') && 'Your order has been received. Awaiting payment confirmation.'}
                            {order.status?.toLowerCase() === 'cancelled' && 'This order has been cancelled.'}
                        </p>
                    </div>
                </div>

                {/* Order Details */}
                <div className="tracking-details">
                    <h2>Order Details</h2>
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="label">Order Date:</span>
                            <span className="value">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Order Status:</span>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="detail-item">
                            <span className="label">Payment Method:</span>
                            <span className="value">{order.paymentMethod || 'M-Pesa'}</span>
                        </div>
                        {order.mpesaReceiptNumber && (
                            <div className="detail-item">
                                <span className="label">M-Pesa Receipt:</span>
                                <span className="value">{order.mpesaReceiptNumber}</span>
                            </div>
                        )}
                        <div className="detail-item">
                            <span className="label">Subtotal:</span>
                            <span className="value">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Shipping Cost:</span>
                            <span className="value">{formatPrice(order.shippingCost)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Total Amount:</span>
                            <span className="value total">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                    <div className="tracking-address">
                        <h2>Shipping Address</h2>
                        <p>
                            {order.shippingAddress}<br />
                            {order.city}, {order.county}<br />
                            Phone: {order.phone}
                        </p>
                    </div>
                )}

                {/* Order Items */}
                <div className="tracking-items">
                    <h2>Items in this Order</h2>
                    <div className="items-list">
                        {(order.items || []).map((item, index) => (
                            <div key={item.id || index} className="tracking-item">
                                <div className="item-image">
                                    <CloudinaryImage 
                                        src={item.imageUrl || item.product?.images?.[0]}
                                        alt={item.productName || item.name}
                                        width={80}
                                        height={80}
                                    />
                                </div>
                                <div className="item-info">
                                    <h3>{item.productName || item.name}</h3>
                                    {(item.size || item.selectedSize) && (
                                        <p>Size: {item.size || item.selectedSize}</p>
                                    )}
                                    <p className="item-price">{formatPrice(item.price)} x {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="tracking-actions">
                    <Link to="/orders" className="back-to-orders">
                        <i className="fas fa-arrow-left"></i>
                        Back to Orders
                    </Link>
                    {order.status?.toLowerCase() === 'delivered' && (
                        <button className="review-order-btn">
                            <i className="fas fa-star"></i>
                            Write a Review
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TrackOrder;