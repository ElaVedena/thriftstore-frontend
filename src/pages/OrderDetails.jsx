import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import OrderTimeline from '../components/orders/OrderTimeline';
import CloudinaryImage from '../components/common/CloudinaryImage';
import { formatDate } from '../utils/dateUtils';
import '../components/css/OrderDetails.css';

function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [itemsWithImages, setItemsWithImages] = useState([]);

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    // Helper function to get image URL for an item by fetching product details
    const fetchProductImage = async (productId) => {
        if (!productId) return null;
        
        try {
            const response = await productService.getProductById(productId);
            if (response.success) {
                const product = response.data;
                // Check multiple possible image fields
                const imageUrl = product?.images?.[0] || 
                                product?.imageUrl || 
                                product?.image ||
                                product?.mainImage;
                return imageUrl || null;
            }
        } catch (error) {
            console.error(`Failed to fetch image for product ${productId}:`, error);
        }
        return null;
    };

    const loadOrderDetails = async () => {
        setLoading(true);
        try {
            const orderRes = await orderService.getOrderById(orderId);
            
            if (orderRes.success) {
                const orderData = orderRes.data?.data || orderRes.data;
                setOrder(orderData);
                
                // Fetch images for each item
                if (orderData?.items && orderData.items.length > 0) {
                    const itemsWithImagesPromises = orderData.items.map(async (item) => {
                        const productId = item.productId || item.id;
                        let imageUrl = item.imageUrl || item.image || item.productImage;
                        
                        // If no image URL in order item, fetch from product
                        if (!imageUrl && productId) {
                            imageUrl = await fetchProductImage(productId);
                        }
                        
                        return {
                            ...item,
                            imageUrl: imageUrl
                        };
                    });
                    
                    const enrichedItems = await Promise.all(itemsWithImagesPromises);
                    setItemsWithImages(enrichedItems);
                }
                
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

    const generateTimeline = (orderData) => {
        const timelineEvents = [];
        
        if (orderData.createdAt) {
            timelineEvents.push({
                status: 'Order Placed',
                date: orderData.createdAt,
                completed: true,
                icon: 'fas fa-shopping-cart',
                description: 'Your order has been placed successfully.'
            });
        }
        
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
        
        if (orderData.status === 'PROCESSING' || orderData.status === 'SHIPPED' || orderData.status === 'DELIVERED') {
            timelineEvents.push({
                status: 'Processing',
                date: orderData.updatedAt || orderData.createdAt,
                completed: true,
                icon: 'fas fa-cog',
                description: 'Your order is being prepared for shipping.'
            });
        }
        
        if (orderData.status === 'SHIPPED' || orderData.status === 'DELIVERED') {
            timelineEvents.push({
                status: 'Shipped',
                date: orderData.updatedAt || orderData.createdAt,
                completed: true,
                icon: 'fas fa-truck',
                description: 'Your order has been shipped.'
            });
        }
        
        if (orderData.status === 'DELIVERED') {
            timelineEvents.push({
                status: 'Delivered',
                date: orderData.updatedAt || orderData.createdAt,
                completed: true,
                icon: 'fas fa-check-double',
                description: 'Your order has been delivered.'
            });
        }
        
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

    const formatPrice = (price) => `KSh ${(price || 0).toLocaleString('en-KE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;

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

    const displayItems = itemsWithImages.length > 0 ? itemsWithImages : (order.items || []);

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
                    <div className="order-section">
                        <h2>Order Status</h2>
                        <OrderTimeline timeline={timeline} currentStatus={order.status} />
                    </div>

                    <div className="order-section">
                        <h2>Order Items</h2>
                        <div className="order-items-list">
                            {displayItems.length > 0 ? (
                                displayItems.map((item, index) => {
                                    const imageUrl = item.imageUrl || item.image || item.productImage;
                                    
                                    return (
                                        <div key={index} className="order-item-detail">
                                            <div className="item-image">
                                                {imageUrl ? (
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={item.productName || 'Product'}
                                                        className="order-item-img"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="image-placeholder">
                                                        <i className="fas fa-image"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="item-details">
                                                <h3>{item.productName || 'Product'}</h3>
                                                {(item.size || item.selectedSize) && (
                                                    <p className="item-size">Size: {item.size || item.selectedSize}</p>
                                                )}
                                                {item.condition && (
                                                    <p className="item-condition">Condition: {item.condition}</p>
                                                )}
                                                <p className="item-price">{formatPrice(item.price)}</p>
                                            </div>
                                            <div className="item-quantity">
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                            <div className="item-total">
                                                <span>{formatPrice((item.price || 0) * (item.quantity || 1))}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-items">No items found in this order</div>
                            )}
                        </div>
                    </div>

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
                    <div className="sidebar-section">
                        <h3>Shipping Information</h3>
                        <div className="shipping-details">
                            <p className="address">{order.shippingAddress || 'N/A'}</p>
                            <p className="city">{order.city || 'N/A'}, {order.county || 'N/A'}</p>
                            <p className="phone">Phone: {order.phone || 'N/A'}</p>
                        </div>
                    </div>

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