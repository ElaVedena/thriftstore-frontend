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
                            <button onClick={() => window.print()} className="print-order-btn">
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