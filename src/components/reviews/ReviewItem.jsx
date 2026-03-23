import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import ReviewImages from './ReviewImages';
import '../../components/css/ReviewItem.css';

function ReviewItem({ review, onHelpful, onReport }) {
    const { user } = useAuth();
    const [helpfulCount, setHelpfulCount] = useState(review.helpful);
    const [notHelpfulCount, setNotHelpfulCount] = useState(review.notHelpful);
    const [userAction, setUserAction] = useState(null);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const isOwner = user?.id === review.userId;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <i
                key={index}
                className={`fa${index < rating ? 's' : 'r'} fa-star`}
            ></i>
        ));
    };

    const handleHelpful = async () => {
        if (userAction === 'helpful') return;
        
        try {
            await reviewService.markHelpful(review.id, true);
            setHelpfulCount(prev => prev + 1);
            if (userAction === 'notHelpful') {
                setNotHelpfulCount(prev => prev - 1);
            }
            setUserAction('helpful');
            if (onHelpful) onHelpful(review.id);
        } catch (error) {
            console.error('Failed to mark as helpful:', error);
        }
    };

    const handleNotHelpful = async () => {
        if (userAction === 'notHelpful') return;
        
        try {
            await reviewService.markHelpful(review.id, false);
            setNotHelpfulCount(prev => prev + 1);
            if (userAction === 'helpful') {
                setHelpfulCount(prev => prev - 1);
            }
            setUserAction('notHelpful');
        } catch (error) {
            console.error('Failed to mark as not helpful:', error);
        }
    };

    const handleReport = async () => {
        if (!reportReason.trim()) return;
        
        try {
            await reviewService.reportReview(review.id, reportReason);
            setShowReportDialog(false);
            setReportReason('');
            alert('Thank you for reporting. Our team will review this review.');
            if (onReport) onReport(review.id);
        } catch (error) {
            console.error('Failed to report review:', error);
        }
    };

    return (
        <div className="review-item">
            <div className="review-header">
                <div className="reviewer-info">
                    <div className="reviewer-avatar">
                        {review.userAvatar ? (
                            <img src={review.userAvatar} alt={review.userName} />
                        ) : (
                            <i className="fas fa-user-circle"></i>
                        )}
                    </div>
                    <div>
                        <span className="reviewer-name">{review.userName}</span>
                        {review.verified && (
                            <span className="verified-badge">
                                <i className="fas fa-check-circle"></i>
                                Verified Purchase
                            </span>
                        )}
                    </div>
                </div>
                <div className="review-date">{formatDate(review.date)}</div>
            </div>

            <div className="review-rating">
                {renderStars(review.rating)}
            </div>

            {review.title && (
                <h4 className="review-title">{review.title}</h4>
            )}

            <p className="review-comment">{review.comment}</p>

            <ReviewImages images={review.images} />

            <div className="review-actions">
                <div className="helpful-actions">
                    <button 
                        className={`helpful-btn ${userAction === 'helpful' ? 'active' : ''}`}
                        onClick={handleHelpful}
                    >
                        <i className="fas fa-thumbs-up"></i>
                        Helpful ({helpfulCount})
                    </button>
                    <button 
                        className={`helpful-btn ${userAction === 'notHelpful' ? 'active' : ''}`}
                        onClick={handleNotHelpful}
                    >
                        <i className="fas fa-thumbs-down"></i>
                    </button>
                </div>

                {!isOwner && (
                    <button 
                        className="report-btn"
                        onClick={() => setShowReportDialog(true)}
                    >
                        <i className="fas fa-flag"></i>
                        Report
                    </button>
                )}
            </div>

            {showReportDialog && (
                <div className="report-dialog">
                    <textarea
                        placeholder="Please tell us why you're reporting this review..."
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        rows="3"
                    />
                    <div className="dialog-actions">
                        <button onClick={() => setShowReportDialog(false)}>
                            Cancel
                        </button>
                        <button onClick={handleReport} disabled={!reportReason.trim()}>
                            Submit Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewItem;