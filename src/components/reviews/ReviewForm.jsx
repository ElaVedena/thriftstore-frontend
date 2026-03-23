import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import { orderService } from '../../services/orderService';
import '../../components/css/ReviewForm.css';

function ReviewForm({ productId, onReviewSubmitted }) {
    const { user, isAuthenticated } = useAuth();
    const [canReview, setCanReview] = useState(false);
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [hasExistingReview, setHasExistingReview] = useState(false);
    const [eligibilityError, setEligibilityError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const checkReviewEligibility = async () => {
            if (!isAuthenticated || !user) {
                setCheckingEligibility(false);
                return;
            }

            if (!productId) {
                setEligibilityError('Product ID is missing');
                setCheckingEligibility(false);
                return;
            }

            try {
                const userReviews = await reviewService.getUserReviews(user.id);
                const alreadyReviewed = userReviews.reviews?.some(r => r.productId === productId);
                setHasExistingReview(alreadyReviewed);

                if (alreadyReviewed) {
                    setCheckingEligibility(false);
                    return;
                }

                const purchaseCheck = await orderService.hasPurchasedProduct(user.id, productId);
                setCanReview(purchaseCheck.delivered);
                
                if (!purchaseCheck.delivered) {
                    if (purchaseCheck.purchased) {
                        setEligibilityError('You have purchased this product but it hasn\'t been delivered yet. Please wait for delivery to review.');
                    } else {
                        setEligibilityError('You need to purchase this product before reviewing');
                    }
                }

            } catch (error) {
                setEligibilityError('Error checking eligibility. Please try again.');
                setCanReview(false);
            } finally {
                setCheckingEligibility(false);
            }
        };

        checkReviewEligibility();
    }, [isAuthenticated, user, productId]);

    const validateForm = () => {
        const newErrors = {};

        if (rating === 0) {
            newErrors.rating = 'Please select a rating';
        }

        if (!title.trim()) {
            newErrors.title = 'Please enter a review title';
        } else if (title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (title.length > 100) {
            newErrors.title = 'Title must be less than 100 characters';
        }

        if (!comment.trim()) {
            newErrors.comment = 'Please enter your review';
        } else if (comment.length < 10) {
            newErrors.comment = 'Review must be at least 10 characters';
        } else if (comment.length > 1000) {
            newErrors.comment = 'Review must be less than 1000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        if (images.length + files.length > 5) {
            alert('You can only upload up to 5 images');
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large. Max size is 5MB`);
                return false;
            }
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image`);
                return false;
            }
            return true;
        });

        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setImages([...images, ...newImages]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(images[index].preview);
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('Please login to write a review');
            return;
        }

        if (!canReview) {
            alert('You can only review products you have purchased and received');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrls = [];
            if (images.length > 0) {
                const uploadResponse = await reviewService.uploadImages(images.map(img => img.file));
                if (uploadResponse.success) {
                    imageUrls = uploadResponse.data;
                }
            }

            const reviewData = {
                productId,
                rating,
                title,
                comment,
                images: imageUrls
            };

            const response = await reviewService.addReview(reviewData);

            if (response.success) {
                setRating(0);
                setTitle('');
                setComment('');
                setImages([]);
                setErrors({});
                
                if (onReviewSubmitted) {
                    onReviewSubmitted(response.review);
                }

                alert('Thank you for your review!');
            } else {
                alert(response.message || 'Failed to submit review');
            }
        } catch (error) {
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (checkingEligibility) {
        return (
            <div className="review-form-container">
                <div className="review-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Checking eligibility...</p>
                </div>
            </div>
        );
    }

    if (eligibilityError) {
        return (
            <div className="review-form-container">
                <div className="review-error-state">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{eligibilityError}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="review-login-prompt">
                <i className="fas fa-lock"></i>
                <p>Please <a href="/login">login</a> to write a review</p>
            </div>
        );
    }

    if (hasExistingReview) {
        return (
            <div className="review-already-exists">
                <i className="fas fa-check-circle"></i>
                <p>You have already reviewed this product</p>
            </div>
        );
    }

    if (!canReview) {
        return (
            <div className="review-not-eligible">
                <i className="fas fa-info-circle"></i>
                <p>You can only review products after purchasing and receiving them</p>
                <p className="eligibility-note">
                    <a href="/orders">View your orders</a> to see products eligible for review
                </p>
            </div>
        );
    }

    return (
        <div className="review-form-container">
            <h3>Write a Review</h3>
            <p className="verified-purchase-badge">
                <i className="fas fa-check-circle"></i>
                Verified Purchase
            </p>
            
            <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                    <label>Your Rating *</label>
                    <div className="rating-input">
                        {[1, 2, 3, 4, 5].map(star => (
                            <i
                                key={star}
                                className={`fa${star <= (hoverRating || rating) ? 's' : 'r'} fa-star`}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                            ></i>
                        ))}
                    </div>
                    {errors.rating && <span className="error-message">{errors.rating}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="title">Review Title *</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your review"
                        maxLength="100"
                        className={errors.title ? 'error' : ''}
                    />
                    <div className="character-count">
                        {title.length}/100
                    </div>
                    {errors.title && <span className="error-message">{errors.title}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="comment">Your Review *</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you like or dislike? What about the fit, quality, etc.?"
                        rows="5"
                        maxLength="1000"
                        className={errors.comment ? 'error' : ''}
                    />
                    <div className="character-count">
                        {comment.length}/1000
                    </div>
                    {errors.comment && <span className="error-message">{errors.comment}</span>}
                </div>

                <div className="form-group">
                    <label>Add Photos (Optional - Max 5)</label>
                    
                    {images.length > 0 && (
                        <div className="image-preview-grid">
                            {images.map((img, index) => (
                                <div key={index} className="image-preview">
                                    <img src={img.preview} alt={`Preview ${index + 1}`} />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() => removeImage(index)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {images.length < 5 && (
                        <button
                            type="button"
                            className="upload-btn"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <i className="fas fa-camera"></i>
                            Upload Photos
                        </button>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                    />
                    
                    <p className="upload-hint">
                        Accepted formats: JPG, PNG, GIF. Max size: 5MB per image.
                    </p>
                </div>

                <button 
                    type="submit" 
                    className="submit-review-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Submitting...
                        </>
                    ) : (
                        'Submit Review'
                    )}
                </button>
            </form>
        </div>
    );
}

export default ReviewForm;