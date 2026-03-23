import '../../components/css/ReviewStats.css';

function ReviewStats({ stats }) {
    const { averageRating, totalReviews, ratingCounts } = stats;

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <i
                key={index}
                className={`fa${index < Math.floor(rating) ? 's' : 
                          (index === Math.floor(rating) && rating % 1 !== 0) ? 'fas fa-star-half-alt' : 'r'} fa-star`}
            ></i>
        ));
    };

    const calculatePercentage = (count) => {
        if (totalReviews === 0) return 0;
        return (count / totalReviews) * 100;
    };

    return (
        <div className="review-stats">
            <div className="stats-overview">
                <div className="average-rating">
                    <span className="big-rating">{averageRating.toFixed(1)}</span>
                    <div className="stars">
                        {renderStars(averageRating)}
                    </div>
                    <span className="total-reviews">Based on {totalReviews} reviews</span>
                </div>
            </div>

            <div className="rating-bars">
                {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="rating-bar-item">
                        <span className="rating-label">{rating} ★</span>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${calculatePercentage(ratingCounts[rating])}%` }}
                            ></div>
                        </div>
                        <span className="rating-count">{ratingCounts[rating]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ReviewStats;