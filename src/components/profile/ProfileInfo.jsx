import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useNotification } from '../../hooks/useNotification';
import '../../components/css/ProfileInfo.css';

function ProfileInfo({ user, onEdit }) {
    const { showError } = useNotification();
    const [userStats, setUserStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        wishlistCount: 0,
        reviewsCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format currency in KES
    const formatCurrency = (amount) => {
        if (!amount) return '0';
        return new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Fetch user stats from backend
    useEffect(() => {
        const fetchUserStats = async () => {
            setIsLoading(true);
            try {
                // Fetch orders to calculate stats
                const ordersResponse = await userService.getOrders();
                if (ordersResponse.success) {
                    const orders = ordersResponse.data || [];
                    const totalOrders = orders.length;
                    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                    
                    setUserStats(prev => ({
                        ...prev,
                        totalOrders,
                        totalSpent
                    }));
                }
            } catch (error) {
                console.error('Error fetching user stats:', error);
                // Don't show error to user for stats - they're non-critical
            }
        };

        // Fetch wishlist count
        const fetchWishlistCount = async () => {
            try {
                const wishlistResponse = await userService.getWishlist();
                if (wishlistResponse.success) {
                    const wishlist = wishlistResponse.data || [];
                    setUserStats(prev => ({
                        ...prev,
                        wishlistCount: wishlist.length
                    }));
                }
            } catch (error) {
                console.error('Error fetching wishlist:', error);
            }
        };

        // Fetch reviews count
        const fetchReviewsCount = async () => {
            try {
                const reviewsResponse = await userService.getUserReviews();
                if (reviewsResponse.success) {
                    const reviews = reviewsResponse.data || [];
                    setUserStats(prev => ({
                        ...prev,
                        reviewsCount: reviews.length
                    }));
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        if (user?.id) {
            Promise.all([
                fetchUserStats(),
                fetchWishlistCount(),
                fetchReviewsCount()
            ]).finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [user?.id]);

    return (
        <div className="profile-info-card">
            <div className="profile-header">
                <div className="profile-avatar">
                    <i className="fas fa-user-circle"></i>
                </div>
                <div className="profile-title">
                    <h2>{user?.name || 'User'}</h2>
                    <p className="profile-email">{user?.email}</p>
                    {user?.role === 'ADMIN' && (
                        <span className="admin-badge">Administrator</span>
                    )}
                </div>
                <button onClick={onEdit} className="edit-profile-btn">
                    <i className="fas fa-edit"></i>
                    Edit Profile
                </button>
            </div>

            <div className="profile-details">
                <div className="detail-group">
                    <h3>Personal Information</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="detail-label">Full Name</span>
                            <span className="detail-value">{user?.name || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Email Address</span>
                            <span className="detail-value">{user?.email || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Phone Number</span>
                            <span className="detail-value">{user?.phone || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Member Since</span>
                            <span className="detail-value">{formatDate(user?.createdAt)}</span>
                        </div>
                        {user?.role && (
                            <div className="detail-item">
                                <span className="detail-label">Account Type</span>
                                <span className="detail-value">{user?.role || 'Customer'}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="detail-group">
                    <h3>Stats</h3>
                    {isLoading ? (
                        <div className="stats-loading">
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Loading stats...</span>
                        </div>
                    ) : (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-value">{userStats.totalOrders}</span>
                                <span className="stat-label">Total Orders</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">KES {formatCurrency(userStats.totalSpent)}</span>
                                <span className="stat-label">Total Spent</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{userStats.wishlistCount}</span>
                                <span className="stat-label">Wishlist Items</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{userStats.reviewsCount}</span>
                                <span className="stat-label">Reviews</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileInfo;