import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import OrderTimeline from '../components/orders/OrderTimeline';
import { formatDate } from '../utils/dateUtils';
import '../components/css/OrderDetails.css';

function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        
        return `http://localhost:8080${url.startsWith('/') ? url : '/' + url}`;
    };

    const loadOrderDetails = async () => {
        setLoading(true);
        try {
            const orderRes = await orderService.getOrderById(orderId);

            console.log('========== ORDER DETAILS DEBUG ==========');
            console.log('Raw order response:', orderRes);
            
            if (orderRes.success) {
                // Handle nested response structure
                const orderData = orderRes.data?.data || orderRes.data;
                console.log('Order data:', orderData);
                
                // Log items specifically
                if (orderData.items) {
                    console.log('Order items count:', orderData.items.length);
                    orderData.items.forEach((item, index) => {
                        console.log(`Item ${index}:`, {
                            productName: item.productName,
                            imageUrl: item.imageUrl,
                            allKeys: Object.keys(item),
                            fullItem: item
                        });
                    });
                } else {
                    console.log('No items found in order');
                }
                
                setOrder(orderData);
                
                if (orderData) {
                    generateTimeline(orderData);
                }
            }
        } catch (error) {
            console.error('Failed to load order details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate timeline from order data
    const generateTimeline = (orderData) => {
        const timelineEvents = [];
        
        // Order placed
        if (orderData.createdAt) {
            timelineEvents.push({
                status: 'Order Placed',
                date: orderData.createdAt,
                completed: true,
                icon: 'fas fa-shopping-cart',
                description: 'Your order has been placed successfully.'
            });
        }
        
        // Payment confirmed
        if (orderData.status === 'PAID' || orderData.status === 'PROCESSING' || 
            orderData.status === 'SHIPPED' || orderData.status === 'DELIVERED') {
            timelineEvents.push({
                status: 'Payment Confirmed',
                date: orderData.updatedAt || orderData.createdAt,
                completed: true,
                icon: 'fas fa-check-circle',
                description: 'Payment has been received and confirmed.',
                metadata: orderData.mpesaReceiptNumber ? {
                    receipt: orderData.mpesaReceiptNumber
                } : null
            });
        }
        
        // Processing
        if (orderData.status === 'PROCESSING' || orderData.status === 'SHIPPED' || orderData.status === 'DELIVERED') {
            timelineEvents.push({
                status: 'Processing',
                date: orderData.updatedAt || orderData.createdAt,
                completed: true,
                icon: 'fas fa-cog',
                description: 'Your order is being prepared for shipping.'
            });
        }
        
        // Shipped
        if (orderData.status === 'SHIPPED' || orderData.status === 'DELIVERED') {
            timelineEvents.push({
                status: 'Shipped',
                date: orderData.updatedAt || orderData.createdAt,
                completed: true,
                icon: 'fas fa-truck',
                description: 'Your order has been shipped.'
            });
        }
        
        // Delivered
        if (orderData.status === 'DELIVERED') {
            timelineEvents.push({
                status: 'Delivered',
                date: orderData.updatedAt || orderData.createdAt,
                completed: true,
                icon: 'fas fa-check-double',
                description: 'Your order has been delivered.'
            });
        }
        
        // Cancelled or failed
        if (orderData.status === 'CANCELLED' || orderData.status === 'PAYMENT_FAILED') {
            timelineEvents.push({
                status: orderData.status === 'CANCELLED' ? 'Cancelled' : 'Payment Failed',
                date: orderData.updatedAt || orderData.createdAt,
                completed: false,
                failed: true,
                icon: orderData.status === 'CANCELLED' ? 'fas fa-times-circle' : 'fas fa-exclamation-circle',
                description: orderData.paymentFailureReason || 'Your order could not be processed.'
            });
        }
        
        // Mark the last event as active
        if (timelineEvents.length > 0) {
            timelineEvents[timelineEvents.length - 1].active = true;
        }
        
        setTimeline(timelineEvents);
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        setCancelling(true);
        try {
            alert('Order cancellation requires admin approval. Please contact support.');
        } catch (error) {
            console.error('Failed to cancel order:', error);
            alert('Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const handleTrackOrder = async () => {
        alert('Tracking information will be available once your order has been shipped.');
    };

    const handleImageError = (e, item) => {
        console.log('Image failed to load:', {
            src: e.target.src,
            item: item?.productName,
            imageUrl: item?.imageUrl
        });
        e.target.onerror = null;
        // Try different fallback strategies
        if (!e.target.src.includes('placekitten')) {
            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
        } else {
            e.target.src = '/placeholder-image.jpg';
        }
    };

    const formatPrice = (price) => `KSh ${(price || 0).toFixed(2)}`;

    if (loading) {
        return (
            <div className="order-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-not-found">
                <i className="fas fa-exclamation-circle"></i>
                <h2>Order Not Found</h2>
                <p>The order you're looking for doesn't exist.</p>
                <Link to="/orders" className="back-to-orders-btn">
                    Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="order-details-page">
            <div className="order-details-header">
                <div className="header-left">
                    <Link to="/orders" className="back-link">
                        <i className="fas fa-arrow-left"></i>
                        Back to Orders
                    </Link>
                    <h1>Order #{order.orderNumber || order.id}</h1>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <div className="order-details-grid">
                <div className="order-main">
                    {/* Order Timeline */}
                    <div className="order-section">
                        <h2>Order Status</h2>
                        <OrderTimeline timeline={timeline} currentStatus={order.status} />
                    </div>

                    {/* Order Items */}
                    <div className="order-section">
                        <h2>Order Items</h2>
                        <div className="order-items-list">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => {
                                    console.log(`Rendering item ${index}:`, {
                                        name: item.productName,
                                        imageUrl: item.imageUrl,
                                        fullImageUrl: getFullImageUrl(item.imageUrl)
                                    });
                                    
                                    return (
                                        <div key={index} className="order-item-detail">
                                            <div className="item-image">
                                                {item.imageUrl ? (
                                                    <img 
                                                        src={getFullImageUrl(item.imageUrl)} 
                                                        alt={item.productName || 'Product'}
                                                        onError={(e) => handleImageError(e, item)}
                                                        onLoad={() => console.log('Image loaded:', item.imageUrl)}
                                                    />
                                                ) : (
                                                    <div className="placeholder-image">
                                                        <i className="fas fa-image"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="item-details">
                                                <h3>{item.productName || 'Product'}</h3>
                                                {item.size && (
                                                    <p className="item-size">Size: {item.size}</p>
                                                )}
                                                <p className="item-price">{formatPrice(item.price)}</p>
                                            </div>
                                            <div className="item-quantity">
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                            <div className="item-total">
                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-items">No items found in this order</div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-section">
                        <h2>Order Summary</h2>
                        <div className="order-summary-details">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{formatPrice(order.shippingCost || 0)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="order-actions-section">
                        {(order.status === 'PENDING' || order.status === 'PENDING_PAYMENT' || order.status === 'PROCESSING') && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="cancel-order-btn"
                            >
                                {cancelling ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-times"></i>
                                        Request Cancellation
                                    </>
                                )}
                            </button>
                        )}
                        {order.status === 'SHIPPED' && (
                            <button onClick={handleTrackOrder} className="track-order-btn">
                                <i className="fas fa-truck"></i>
                                Track Order
                            </button>
                        )}
                        {order.status === 'DELIVERED' && (
                            <button className="review-order-btn">
                                <i className="fas fa-star"></i>
                                Write a Review
                            </button>
                        )}
                        <button onClick={() => window.print()} className="print-order-btn">
                            <i className="fas fa-print"></i>
                            Print Receipt
                        </button>
                    </div>
                </div>

                <div className="order-sidebar">
                    {/* Shipping Information */}
                    <div className="sidebar-section">
                        <h3>Shipping Information</h3>
                        <div className="shipping-details">
                            <p className="address">{order.shippingAddress || 'N/A'}</p>
                            <p className="city">{order.city || 'N/A'}, {order.county || 'N/A'}</p>
                            <p className="phone">Phone: {order.phone || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="sidebar-section">
                        <h3>Payment Information</h3>
                        <div className="payment-details">
                            <p>
                                <span className="label">Method:</span>
                                <span className="value">{order.paymentMethod || 'M-PESA'}</span>
                            </p>
                            {order.mpesaReceiptNumber && (
                                <p>
                                    <span className="label">Receipt No:</span>
                                    <span className="value">{order.mpesaReceiptNumber}</span>
                                </p>
                            )}
                            <p>
                                <span className="label">Order Date:</span>
                                <span className="value">{formatDate(order.createdAt)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Need Help? */}
                    <div className="sidebar-section help-section">
                        <h3>Need Help?</h3>
                        <p>If you have any questions about your order, contact our support team.</p>
                        <Link to="/contact" className="contact-support-btn">
                            <i className="fas fa-headset"></i>
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;