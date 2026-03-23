import { useState } from 'react';
import '../../css/ProductReviews.css';

function ProductReviews({ reviews = [], averageRating }) {
    const [sortBy, setSortBy] = useState('recent');

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <i
                key={index}
                className={`fa${index < rating ? 's' : 'r'} fa-star`}
            ></i>
        ));
    };

    return (
        <div className="product-reviews">
            <h3>Customer Reviews</h3>
            
            <div className="reviews-summary">
                <div className="average-rating">
                    <span className="big-rating">{averageRating}</span>
                    <div className="stars">
                        {renderStars(Math.round(averageRating))}
                    </div>
                    <span className="total-reviews">Based on {reviews.length} reviews</span>
                </div>
                
                <div className="reviews-filter">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>
            </div>

            <div className="reviews-list">
                {reviews.map((review, index) => (
                    <div key={index} className="review-item">
                        <div className="review-header">
                            <div className="reviewer-info">
                                <span className="reviewer-name">{review.userName}</span>
                                <span className="review-date">{review.date}</span>
                            </div>
                            <div className="review-rating">
                                {renderStars(review.rating)}
                            </div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        
                        {review.images && review.images.length > 0 && (
                            <div className="review-images">
                                {review.images.map((img, idx) => (
                                    <img key={idx} src={img} alt="Review" />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}

export default ProductReviews;