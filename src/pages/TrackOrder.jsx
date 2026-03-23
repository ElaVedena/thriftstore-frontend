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
            if (response.success) {
                setOrder(response.order || response.data);
            } else {
                setError('Failed to load order');
            }
        } catch (error) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    }, [orderId]); 

    useEffect(() => {
        loadOrder();
    }, [loadOrder]); 

    const formatPrice = (price) => `KSh ${(price || 0).toFixed(2)}`;

    const getStatusProgress = (status) => {
        const statuses = ['pending', 'processing', 'shipped', 'delivered'];
        const currentIndex = statuses.indexOf(status?.toLowerCase() || 'pending');
        return (currentIndex + 1) * 25; 
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
                        <div className={`step ${order.status?.toLowerCase() === 'pending' ? 'active' : ''}`}>
                            <i className="fas fa-clock"></i>
                            <span>Pending</span>
                        </div>
                        <div className={`step ${order.status?.toLowerCase() === 'processing' ? 'active' : ''}`}>
                            <i className="fas fa-cog"></i>
                            <span>Processing</span>
                        </div>
                        <div className={`step ${order.status?.toLowerCase() === 'shipped' ? 'active' : ''}`}>
                            <i className="fas fa-truck"></i>
                            <span>Shipped</span>
                        </div>
                        <div className={`step ${order.status?.toLowerCase() === 'delivered' ? 'active' : ''}`}>
                            <i className="fas fa-check-circle"></i>
                            <span>Delivered</span>
                        </div>
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
                        {order.items?.map((item, index) => (
                            <div key={index} className="tracking-item">
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