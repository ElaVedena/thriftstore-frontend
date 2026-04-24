import { Link } from 'react-router-dom';
import { useState } from 'react';
import { formatShortDate, getRelativeTime } from '../../utils/dateUtils';
import OrderStatusBadge from './OrderStatusBadge';
import CloudinaryImage from '../common/CloudinaryImage';
import ReviewModal from '../reviews/ReviewModal';
import '../../components/css/OrderCard.css';

function OrderCard({ order }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const formatPrice = (price) => `KSh ${(price || 0).toLocaleString('en-KE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;

    const getDisplayStatus = (status) => {
        if (!status) return 'pending';
        return status.toLowerCase();
    };

    // Check if order is paid/completed (not pending)
    const isOrderPaid = () => {
        const status = order.status?.toUpperCase();
        return status !== 'PENDING' && 
               status !== 'PENDING_PAYMENT' && 
               status !== 'FAILED' &&
               status !== 'CANCELLED';
    };

    // Helper to get the correct image source from different possible field names
    const getItemImageSrc = (item) => {
        const possibleFields = [
            item.imageUrl,
            item.image,
            item.productImage,
            item.mainImage,
            item.images?.[0],
            item.product?.images?.[0],
            item.product?.imageUrl,
            item.product?.image
        ];
        
        const imageSrc = possibleFields.find(field => field != null && field !== '');
        
        if (imageSrc && imageSrc.startsWith('/')) {
            const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';
            return baseUrl + imageSrc;
        }
        
        return imageSrc || null;
    };

    // Helper to extract product ID from different possible field names
    const getProductId = (item) => {
        const possibleIdFields = [
            item.productId,
            item.product?.id,
            item.id,
            item.product_id,
            item.productID,
            item.product?.productId
        ];
        
        return possibleIdFields.find(id => id != null);
    };

    const handleReviewClick = (item) => {
        const productId = getProductId(item);
        
        if (!productId) {
            console.error('No product ID found for item:', item);
            alert('Cannot review this item: Product ID not found');
            return;
        }
        
        const selectedProduct = {
            productId: productId,
            productName: item.productName || item.name || 'Product',
            productImage: getItemImageSrc(item)
        };
        
        setSelectedProduct(selectedProduct);
        setShowReviewModal(true);
    };

    const handleReviewSubmitted = (review) => {
        setShowReviewModal(false);
        setSelectedProduct(null);
    };

    const handleCloseModal = () => {
        setShowReviewModal(false);
        setSelectedProduct(null);
    };

    // Custom print receipt function - only prints order details, not entire page
    const handlePrintReceipt = () => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Receipt - ${order.orderNumber || order.id}</title>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        padding: 40px 20px;
                        background: white;
                        color: #333;
                        margin: 0;
                    }
                    .receipt {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                    }
                    .receipt-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #CEABB1;
                    }
                    .receipt-header h1 {
                        font-size: 28px;
                        color: #2d2d2d;
                        margin: 0 0 5px 0;
                    }
                    .receipt-header p {
                        color: #666;
                        font-size: 14px;
                        margin: 0;
                    }
                    .order-info {
                        margin-bottom: 30px;
                        padding: 15px;
                        background: #f8f5f6;
                        border-radius: 8px;
                    }
                    .order-info h3 {
                        font-size: 16px;
                        margin: 0 0 10px 0;
                        color: #2d2d2d;
                    }
                    .order-info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        font-size: 14px;
                    }
                    .order-info-row .label {
                        color: #666;
                    }
                    .order-info-row .value {
                        font-weight: 600;
                        color: #2d2d2d;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .items-table th {
                        text-align: left;
                        padding: 12px;
                        background: #f0f0f0;
                        font-size: 14px;
                        font-weight: 600;
                        color: #2d2d2d;
                        border-bottom: 1px solid #ddd;
                    }
                    .items-table td {
                        padding: 12px;
                        font-size: 13px;
                        color: #666;
                        border-bottom: 1px solid #eee;
                    }
                    .items-table .item-name {
                        font-weight: 500;
                        color: #2d2d2d;
                    }
                    .summary {
                        margin-top: 20px;
                        padding-top: 20px;
                        border-top: 1px solid #e0e0e0;
                        text-align: right;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: flex-end;
                        margin-bottom: 8px;
                        font-size: 14px;
                    }
                    .summary-row .label {
                        width: 150px;
                        color: #666;
                    }
                    .summary-row .value {
                        width: 120px;
                        text-align: right;
                        font-weight: 500;
                        color: #2d2d2d;
                    }
                    .summary-row.total {
                        font-size: 18px;
                        font-weight: bold;
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top: 2px solid #CEABB1;
                    }
                    .summary-row.total .value {
                        color: #CEABB1;
                        font-weight: bold;
                    }
                    .payment-info {
                        margin-top: 30px;
                        padding: 15px;
                        background: #f9f9f9;
                        border-radius: 8px;
                    }
                    .payment-info h3 {
                        font-size: 14px;
                        margin: 0 0 10px 0;
                        color: #2d2d2d;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e0e0e0;
                        font-size: 11px;
                        color: #999;
                    }
                    @media print {
                        body {
                            padding: 0;
                            margin: 0;
                        }
                        .receipt {
                            border: none;
                            padding: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="receipt-header">
                        <h1>VedaThrifts</h1>
                        <p>Order Receipt</p>
                    </div>
                    
                    <div class="order-info">
                        <h3>Order Information</h3>
                        <div class="order-info-row">
                            <span class="label">Order Number:</span>
                            <span class="value">${order.orderNumber || order.id}</span>
                        </div>
                        <div class="order-info-row">
                            <span class="label">Order Date:</span>
                            <span class="value">${formatShortDate(order.createdAt || order.orderDate)}</span>
                        </div>
                        <div class="order-info-row">
                            <span class="label">Order Status:</span>
                            <span class="value">${order.status || 'Processing'}</span>
                        </div>
                    </div>

                    <h3 style="margin-bottom: 10px; font-size: 16px;">Items Ordered</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Size</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(order.items || []).map(item => `
                                <tr>
                                    <td class="item-name">${item.productName || item.name || 'Product'}</td>
                                    <td>${item.size || item.selectedSize || '-'}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatPrice(item.price)}</td>
                                    <td>${formatPrice((item.price || 0) * (item.quantity || 1))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="summary">
                        <div class="summary-row">
                            <span class="label">Subtotal:</span>
                            <span class="value">${formatPrice(order.subtotal)}</span>
                        </div>
                        <div class="summary-row">
                            <span class="label">Shipping:</span>
                            <span class="value">${formatPrice(order.shippingCost || 0)}</span>
                        </div>
                        <div class="summary-row total">
                            <span class="label">Total:</span>
                            <span class="value">${formatPrice(order.total)}</span>
                        </div>
                    </div>

                    <div class="payment-info">
                        <h3>Payment Information</h3>
                        <div class="order-info-row">
                            <span class="label">Payment Method:</span>
                            <span class="value">${order.paymentMethod || 'M-PESA'}</span>
                        </div>
                        ${order.mpesaReceiptNumber ? `
                        <div class="order-info-row">
                            <span class="label">M-Pesa Receipt:</span>
                            <span class="value">${order.mpesaReceiptNumber}</span>
                        </div>
                        ` : ''}
                    </div>

                    ${order.shippingAddress ? `
                    <div class="payment-info">
                        <h3>Shipping Address</h3>
                        <div class="order-info-row">
                            <span class="label">Address:</span>
                            <span class="value">${order.shippingAddress}</span>
                        </div>
                        <div class="order-info-row">
                            <span class="label">City:</span>
                            <span class="value">${order.city || ''} ${order.county ? ', ' + order.county : ''}</span>
                        </div>
                        <div class="order-info-row">
                            <span class="label">Phone:</span>
                            <span class="value">${order.phone || 'N/A'}</span>
                        </div>
                    </div>
                    ` : ''}

                    <div class="footer">
                        <p>Thank you for shopping with VedaThrifts!</p>
                        <p>For any inquiries, please contact us at support@vedathrifts.com</p>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
    };

    // Get delivered items for review
    const deliveredItems = getDisplayStatus(order.status) === 'delivered' && order.items ? order.items : [];

    return (
        <>
            <div className="order-card">
                <div className="order-card-header">
                    <div className="order-info">
                        <div className="order-number">
                            <span className="label">Order Number:</span>
                            <Link to={`/orders/${order.id}`} className="value">
                                {order.orderNumber || order.id}
                            </Link>
                        </div>
                        <div className="order-date">
                            <span className="label">Placed on:</span>
                            <span className="value">{formatShortDate(order.createdAt || order.orderDate)}</span>
                            <span className="relative-date">({getRelativeTime(order.createdAt || order.orderDate)})</span>
                        </div>
                    </div>
                    <OrderStatusBadge status={getDisplayStatus(order.status)} />
                </div>

                <div className="order-card-items">
                    {order.items && order.items.map((item, index) => (
                        <div key={index} className="order-item-preview">
                            <div className="item-image">
                                <CloudinaryImage 
                                    src={getItemImageSrc(item)}
                                    alt={item.productName || item.name || 'Product'}
                                    width={100}
                                    height={100}
                                    crop="scale"
                                    quality="auto"
                                    format="auto"
                                    className="order-item-img"
                                    fallback="/placeholder-image.jpg"
                                    responsive={true}
                                    mobileWidth={80}
                                    mobileHeight={80}
                                />
                                {item.quantity > 1 && (
                                    <span className="item-quantity">{item.quantity}</span>
                                )}
                            </div>
                            <div className="item-details">
                                <h4>{item.productName || item.name}</h4>
                                {(item.size || item.selectedSize) && (
                                    <span className="item-size">Size: {item.size || item.selectedSize}</span>
                                )}
                                {item.condition && (
                                    <span className="item-condition">Condition: {item.condition}</span>
                                )}
                                <span className="item-price">{formatPrice(item.price)}</span>
                            </div>
                        </div>
                    ))}
                    
                    {(!order.items || order.items.length === 0) && (
                        <div className="no-items">
                            <span>No items in this order</span>
                        </div>
                    )}
                </div>

                <div className="order-card-footer">
                    <div className="order-total">
                        <span className="label">Total:</span>
                        <span className="value">{formatPrice(order.total)}</span>
                    </div>
                    
                    <div className="order-actions">
                        <Link to={`/orders/${order.id}`} className="view-order-btn">
                            View Details
                        </Link>
                        
                        {/* Print Receipt - Only show for paid/completed orders */}
                        {isOrderPaid() && (
                            <button onClick={handlePrintReceipt} className="print-order-btn">
                                <i className="fas fa-print"></i>
                                Print Receipt
                            </button>
                        )}
                        
                        {deliveredItems.length > 0 && (
                            <button 
                                className="review-all-btn"
                                onClick={() => handleReviewClick(deliveredItems[0])}
                            >
                                <i className="fas fa-star"></i>
                                Write a Review
                            </button>
                        )}
                        
                        {(getDisplayStatus(order.status) === 'processing' ||
                          getDisplayStatus(order.status) === 'shipped') && (
                            <Link to={`/track/${order.id}`} className="track-order-btn">
                                <i className="fas fa-truck"></i>
                                Track
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedProduct && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={handleCloseModal}
                    productId={selectedProduct.productId}
                    productName={selectedProduct.productName}
                    productImage={selectedProduct.productImage}
                    onReviewSubmitted={handleReviewSubmitted}
                />
            )}
        </>
    );
}

export default OrderCard;