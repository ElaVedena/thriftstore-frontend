import { useState, useEffect, useCallback } from 'react';
import ReviewItem from './ReviewItem';
import ReviewStats from './ReviewStats';
import { reviewService } from '../../services/reviewService';
import '../../components/css/ReviewList.css';

function ReviewList({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('recent');
    const [filterBy, setFilterBy] = useState('all');

    // Wrap loadReviews in useCallback to prevent unnecessary re-renders
    const loadReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [reviewsRes, statsRes] = await Promise.all([
                reviewService.getProductReviews(productId),
                reviewService.getReviewStats(productId)
            ]);

            if (reviewsRes.success) {
                setReviews(reviewsRes.reviews || []);
            } else {
                setError(reviewsRes.message || 'Failed to load reviews');
            }
            
            if (statsRes.success) {
                setStats(statsRes.stats || null);
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
            setError('Failed to load reviews. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [productId]); // Add productId as dependency

    useEffect(() => {
        if (productId) {
            loadReviews();
        }
    }, [productId, loadReviews]); // Add loadReviews to dependencies

    const sortAndFilterReviews = useCallback(() => {
        // Ensure reviews is an array
        const reviewsArray = Array.isArray(reviews) ? reviews : [];
        let filtered = [...reviewsArray];

        // Filter by rating
        if (filterBy !== 'all') {
            filtered = filtered.filter(r => r.rating === parseInt(filterBy));
        }

        // Sort
        switch (sortBy) {
            case 'recent':
                filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
                break;
            case 'helpful':
                filtered.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
                break;
            case 'highest':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                filtered.sort((a, b) => a.rating - b.rating);
                break;
            default:
                break;
        }

        return filtered;
    }, [reviews, sortBy, filterBy]);

    const handleHelpful = async (reviewId) => {
        try {
            await reviewService.markHelpful(reviewId);
            // Reload reviews to get updated helpful counts
            loadReviews();
        } catch (error) {
            console.error('Failed to mark review as helpful:', error);
        }
    };

    const displayedReviews = sortAndFilterReviews();

    if (loading) {
        return (
            <div className="reviews-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading reviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reviews-error">
                <i className="fas fa-exclamation-circle"></i>
                <p>{error}</p>
                <button onClick={loadReviews} className="retry-btn">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="reviews-container">
            {stats && <ReviewStats stats={stats} />}

            <div className="reviews-header">
                <h3>Customer Reviews</h3>
                <div className="reviews-controls">
                    <select 
                        value={filterBy} 
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Ratings</option>
                        <option value="5">5 ★</option>
                        <option value="4">4 ★</option>
                        <option value="3">3 ★</option>
                        <option value="2">2 ★</option>
                        <option value="1">1 ★</option>
                    </select>

                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>
            </div>

            {displayedReviews.length === 0 ? (
                <div className="no-reviews">
                    <i className="fas fa-comment-slash"></i>
                    <p>No reviews match your criteria</p>
                </div>
            ) : (
                <div className="reviews-list">
                    {displayedReviews.map(review => (
                        <ReviewItem 
                            key={review.id} 
                            review={review}
                            onHelpful={() => handleHelpful(review.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReviewList;