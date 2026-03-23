import { useEffect } from 'react';
import ReviewForm from './ReviewForm';
import '../../components/css/ReviewModal.css';

function ReviewModal({ isOpen, onClose, productId, productName, productImage, onReviewSubmitted }) {
    console.log('ReviewModal - isOpen:', isOpen, 'productId:', productId, 'productName:', productName);

    // Prevent scrolling when modal is open
    useEffect(() => {
        console.log('ReviewModal useEffect - isOpen:', isOpen);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) {
        console.log('ReviewModal - not open, returning null');
        return null;
    }

    console.log('ReviewModal - rendering modal content');

    const handleReviewSubmitted = (review) => {
        console.log('Review submitted in modal:', review);
        if (onReviewSubmitted) {
            onReviewSubmitted(review);
        }
        // Close modal after successful submission
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="review-modal-close" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                
                <div className="review-modal-header">
                    <h2>Write a Review</h2>
                    {productName && (
                        <div className="review-product-info">
                            {productImage && (
                                <img src={productImage} alt={productName} className="review-product-image" />
                            )}
                            <span className="review-product-name">{productName}</span>
                        </div>
                    )}
                </div>

                {productId ? (
                    <ReviewForm 
                        productId={productId}
                        onReviewSubmitted={handleReviewSubmitted}
                    />
                ) : (
                    <div className="review-error">
                        <p>Error: Product ID is missing</p>
                        <button onClick={onClose} className="close-error-btn">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReviewModal;