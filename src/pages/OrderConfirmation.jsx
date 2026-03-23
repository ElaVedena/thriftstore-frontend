import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../components/css/OrderConfirmation.css';

function OrderConfirmation() {
    const location = useLocation();
    const [orderData, setOrderData] = useState(location.state?.orderData || location.state?.orderDetails);

    useEffect(() => {
        if (!orderData) {
            const savedOrder = localStorage.getItem('lastOrder');
            if (savedOrder) {
                try {
                    setOrderData(JSON.parse(savedOrder));
                } catch (e) {
                    console.error('Failed to parse saved order:', e);
                }
            }
        }
    }, [orderData]);

    const handlePrint = () => {
        if (!orderData) return;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Order Receipt - VedaThrifts</title>
                    <link rel="stylesheet" href="/print.css">
                </head>
                <body>
                    <div class="receipt-content">
                        <div class="receipt-header">
                            <h1>VedaThrifts</h1>
                            <p>Order Receipt</p>
                        </div>
                        <div class="order-info">
                            <div><strong>Order Number:</strong> ${orderData.orderNumber || orderData.id || 'N/A'}</div>
                            <div><strong>Date:</strong> ${formatDate(orderData.orderDate || orderData.createdAt)}</div>
                        </div>
                        <div class="order-details">
                            <h3>Items</h3>
                            ${(orderData.items || []).map(item => {
                                const itemName = item.productName || item.name;
                                const itemPrice = item.price || 0;
                                const itemQuantity = item.quantity || 1;
                                const itemSize = item.size || item.selectedSize;
                                return `
                                    <div class="order-item">
                                        <div class="item-info">
                                            <div>
                                                <h4>${itemName}</h4>
                                                ${itemSize ? `<span class="item-size">Size: ${itemSize}</span>` : ''}
                                            </div>
                                        </div>
                                        <div class="item-quantity-price">
                                            <div>${itemQuantity} x ${formatPrice(itemPrice)}</div>
                                            <strong>${formatPrice(itemPrice * itemQuantity)}</strong>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                            <div class="total-row">
                                <span>Subtotal:</span>
                                <span>${formatPrice(orderData.subtotal || 0)}</span>
                            </div>
                            <div class="total-row">
                                <span>Shipping:</span>
                                <span>${formatPrice(orderData.shippingCost || orderData.shipping || 0)}</span>
                            </div>
                            <div class="total-row grand-total">
                                <span>Total:</span>
                                <span>${formatPrice(orderData.total || 0)}</span>
                            </div>
                        </div>
                        <div class="delivery-info">
                            <h3>Delivery Information</h3>
                            <div class="info-grid">
                                <div><strong>Name:</strong> ${orderData.shipping?.fullName || orderData.shipping?.name || 'N/A'}</div>
                                <div><strong>Phone:</strong> ${orderData.shipping?.phone || 'N/A'}</div>
                                <div><strong>Email:</strong> ${orderData.shipping?.email || orderData.email || 'N/A'}</div>
                                <div><strong>Address:</strong> ${orderData.shipping?.address || ''}, ${orderData.shipping?.city || ''}, ${orderData.shipping?.county || ''}</div>
                            </div>
                        </div>
                        <div class="payment-info">
                            <h3>Payment Information</h3>
                            <div><strong>Method:</strong> M-Pesa</div>
                            <div><strong>Transaction Code:</strong> ${orderData.payment?.code || orderData.paymentCode || 'N/A'}</div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const formatPrice = (price) => {
        const num = Number(price) || 0;
        return `KSh ${num.toFixed(2)}`;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('en-KE');
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!orderData) {
        return (
            <div className="confirmation-page error">
                <i className="fas fa-exclamation-circle"></i>
                <h2>No Order Found</h2>
                <p>We couldn't find your order information.</p>
                <Link to="/shop" className="shop-btn">Continue Shopping</Link>
            </div>
        );
    }

    // Safely extract data with fallbacks
    const items = orderData.items || [];
    const shippingInfo = orderData.shipping || {};
    const paymentInfo = orderData.payment || {};
    const orderNumber = orderData.orderNumber || orderData.id || 'N/A';
    const orderDate = orderData.orderDate || orderData.createdAt || new Date().toISOString();
    const subtotal = orderData.subtotal || 0;
    const shipping = orderData.shippingCost || orderData.shipping || 0;
    const total = orderData.total || 0;
    const customerEmail = shippingInfo.email || orderData.email || 'your email';

    return (
        <div className="confirmation-page">
            <div className="confirmation-header">
                <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                </div>
                <h1>Thank You for Your Order!</h1>
                <p>Your order has been placed successfully.</p>
                <p className="email-confirm">
                    <i className="fas fa-envelope"></i>
                    A confirmation email has been sent to <strong>{customerEmail}</strong>
                </p>
            </div>

            {/* Printable receipt content */}
            <div className="receipt-content">
                <div className="receipt-header">
                    <h1>VedaThrifts</h1>
                    <p>Order Receipt</p>
                </div>

                <div className="order-info">
                    <div>
                        <strong>Order Number:</strong> {orderNumber}
                    </div>
                    <div>
                        <strong>Date:</strong> {formatDate(orderDate)}
                    </div>
                </div>

                <div className="order-details">
                    <h3>Items</h3>
                    {items.length > 0 ? (
                        items.map((item, index) => {
                            const itemName = item.productName || item.name || 'Product';
                            const itemPrice = item.price || 0;
                            const itemQuantity = item.quantity || 1;
                            const itemSize = item.size || item.selectedSize;
                            return (
                                <div key={index} className="order-item">
                                    <div className="item-info">
                                        {item.imageUrl && (
                                            <img 
                                                src={item.imageUrl} 
                                                alt={itemName}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <div>
                                            <h4>{itemName}</h4>
                                            {itemSize && (
                                                <span className="item-size">Size: {itemSize}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-quantity-price">
                                        <div>{itemQuantity} x {formatPrice(itemPrice)}</div>
                                        <strong>{formatPrice(itemPrice * itemQuantity)}</strong>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="no-items">No items in order</p>
                    )}

                    <div className="total-row">
                        <span>Subtotal:</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="total-row">
                        <span>Shipping:</span>
                        <span>{formatPrice(shipping)}</span>
                    </div>
                    <div className="total-row grand-total">
                        <span>Total:</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>

                <div className="delivery-info">
                    <h3>Delivery Information</h3>
                    <div className="info-grid">
                        <div><strong>Name:</strong> {shippingInfo.fullName || shippingInfo.name || 'N/A'}</div>
                        <div><strong>Phone:</strong> {shippingInfo.phone || 'N/A'}</div>
                        <div><strong>Email:</strong> {shippingInfo.email || orderData.email || 'N/A'}</div>
                        <div><strong>Address:</strong> {shippingInfo.address || ''}, {shippingInfo.city || ''}, {shippingInfo.county || ''}</div>
                    </div>
                </div>

                <div className="payment-info">
                    <h3>Payment Information</h3>
                    <div><strong>Method:</strong> M-Pesa</div>
                    <div><strong>Transaction Code:</strong> {paymentInfo.code || orderData.paymentCode || 'N/A'}</div>
                </div>
            </div>

            <div className="confirmation-actions">
                <Link to="/shop" className="continue-shopping-btn">
                    Continue Shopping
                </Link>
                <button onClick={handlePrint} className="print-btn">
                    <i className="fas fa-print"></i>
                    Print Receipt
                </button>
            </div>
        </div>
    );
}

export default OrderConfirmation;