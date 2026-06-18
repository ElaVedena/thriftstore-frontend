// src/pages/Admin/Orders/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useNotification } from '../../../hooks/useNotification';
import Sidebar from '../../../components/admin/Sidebar';
import '../Admin.css';

function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError, showSuccess } = useNotification();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    // Add class to body to hide global header and footer
    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => {
            document.body.classList.remove('admin-page');
        };
    }, []);

    useEffect(() => {
        loadOrderDetail();
    }, [id]);

    const loadOrderDetail = async () => {
        setLoading(true);
        try {
            const response = await adminService.getOrderById(id);
            if (response.success) {
                const orderData = response.data;
                
                // Ensure items array exists and has proper data
                if (orderData && orderData.items) {
                    // Log items for debugging
                    console.log('Order items:', orderData.items);
                    
                    // Ensure each item has a size field
                    orderData.items = orderData.items.map(item => ({
                        ...item,
                        // Try to get size from various possible fields
                        size: item.size || item.selectedSize || item.productSize || item.sizeName || '-'
                    }));
                }
                
                setOrder(orderData);
            } else {
                showError(response.message || 'Failed to load order details');
            }
        } catch (error) {
            console.error('Failed to load order details:', error);
            showError('An error occurred while loading order details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (order.status === newStatus) return;
        
        setUpdating(true);
        try {
            const response = await adminService.updateOrderStatus(order.id, newStatus);
            if (response.success) {
                showSuccess(`Order ${order.orderNumber} status updated to ${newStatus}`);
                setOrder({ ...order, status: newStatus });
            } else {
                showError(response.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
            showError('An error occurred while updating order status');
        } finally {
            setUpdating(false);
        }
    };

    const handleImageError = (itemId) => {
        setImageErrors(prev => ({ ...prev, [itemId]: true }));
    };

    const getItemImage = (item) => {
        // Try multiple possible image fields
        const possibleImages = [
            item.imageUrl,
            item.image,
            item.productImage,
            item.mainImage,
            item.images?.[0],
            item.product?.images?.[0],
            item.product?.imageUrl,
            item.product?.image
        ];
        
        // Return the first valid image URL
        for (const img of possibleImages) {
            if (img && typeof img === 'string' && img.trim() !== '') {
                return img;
            }
        }
        
        return '/placeholder-image.jpg';
    };

    const formatPrice = (price) => `KSh ${Number(price).toLocaleString()}`;
    const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';
    const formatDateTime = (date) => date ? new Date(date).toLocaleString() : '-';

    const normalizeStatus = (status) => {
        if (!status) return 'processing';
        return status.toLowerCase();
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    <div className="admin-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading order details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    <div className="order-not-found">
                        <i className="fas fa-exclamation-circle"></i>
                        <h2>Order Not Found</h2>
                        <p>The order you're looking for doesn't exist.</p>
                        <Link to="/admin/orders" className="back-btn">Back to Orders</Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            
            <main className="admin-main">
                <div className="admin-header">
                    <div className="header-left">
                        <Link to="/admin/orders" className="back-link">
                            <i className="fas fa-arrow-left"></i> Back to Orders
                        </Link>
                        <h1>Order #{order.orderNumber || order.id}</h1>
                    </div>
                    <div className="header-actions">
                        <div className="status-control">
                            <span className="label">Status:</span>
                            <select
                                value={normalizeStatus(order.status)}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={`status-select status-${normalizeStatus(order.status)}`}
                                disabled={updating}
                            >
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {updating && <i className="fas fa-spinner fa-spin"></i>}
                        </div>
                    </div>
                </div>

                <div className="order-detail-grid">
                    {/* Order Information */}
                    <div className="detail-section">
                        <h2>Order Information</h2>
                        <div className="detail-row">
                            <span className="label">Order Number:</span>
                            <span className="value">{order.orderNumber || order.id}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Order Date:</span>
                            <span className="value">{formatDateTime(order.createdAt)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Order Status:</span>
                            <span className={`status-badge ${normalizeStatus(order.status)}`}>
                                {order.status || 'Processing'}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Payment Method:</span>
                            <span className="value">{order.paymentMethod || 'M-PESA'}</span>
                        </div>
                        {order.mpesaReceiptNumber && (
                            <div className="detail-row">
                                <span className="label">M-Pesa Receipt:</span>
                                <span className="value">{order.mpesaReceiptNumber}</span>
                            </div>
                        )}
                    </div>

                    {/* Customer Information */}
                    <div className="detail-section">
                        <h2>Customer Information</h2>
                        <div className="detail-row">
                            <span className="label">Customer Name:</span>
                            <span className="value">{order.user?.name || order.userName || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Email:</span>
                            <span className="value">{order.user?.email || order.userEmail || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Phone:</span>
                            <span className="value">{order.user?.phone || order.userPhone || order.phone || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="detail-section">
                        <h2>Shipping Information</h2>
                        <div className="detail-row">
                            <span className="label">Shipping Address:</span>
                            <span className="value">{order.shippingAddress || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">City:</span>
                            <span className="value">{order.city || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">County:</span>
                            <span className="value">{order.county || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="detail-section">
                        <h2>Order Summary</h2>
                        <div className="detail-row">
                            <span className="label">Subtotal:</span>
                            <span className="value">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Shipping Cost:</span>
                            <span className="value">{formatPrice(order.shippingCost || 0)}</span>
                        </div>
                        <div className="detail-row total">
                            <span className="label">Total:</span>
                            <span className="value">{formatPrice(order.total)}</span>
                        </div>
                    </div>

                    {/* Order Items - FIXED: Shows size and image properly */}
                    <div className="detail-section full-width">
                        <h2>Order Items</h2>
                        <div className="items-table-container">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Product</th>
                                        <th>Size</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.items || []).map((item, index) => {
                                        const imageUrl = getItemImage(item);
                                        const hasError = imageErrors[item.id || index];
                                        const itemSize = item.size || item.selectedSize || item.productSize || '-';
                                        
                                        return (
                                            <tr key={item.id || index}>
                                                <td>
                                                    {!hasError && imageUrl ? (
                                                        <img 
                                                            src={imageUrl} 
                                                            alt={item.productName || item.name || 'Product'}
                                                            className="item-thumb"
                                                            onError={() => handleImageError(item.id || index)}
                                                        />
                                                    ) : (
                                                        <div className="item-thumb-placeholder">
                                                            <i className="fas fa-image"></i>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="product-name-cell">
                                                    {item.productName || item.name || 'Product'}
                                                    {item.brand && <span className="product-brand">({item.brand})</span>}
                                                </td>
                                                <td className="size-cell">
                                                    <span className="size-badge">{itemSize}</span>
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>{formatPrice(item.price)}</td>
                                                <td className="item-total-cell">{formatPrice((item.price || 0) * (item.quantity || 1))}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="order-actions-bottom">
                    <Link to="/admin/orders" className="btn-secondary">
                        <i className="fas fa-arrow-left"></i> Back to Orders
                    </Link>
                    <button onClick={() => window.print()} className="btn-secondary">
                        <i className="fas fa-print"></i> Print Order
                    </button>
                </div>
            </main>
        </div>
    );
}

export default OrderDetail;