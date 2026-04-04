import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useNotification } from '../../hooks/useNotification';
import '../../components/css/ProfileInfo.css';

function ProfileInfo({ user, onEdit }) {
    const { user: authUser } = useAuth();
    const { showError } = useNotification();
    const [userStats, setUserStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        wishlistCount: 0,
        reviewsCount: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    // Use user prop or authUser as fallback
    const currentUser = user || authUser;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'N/A';
        }
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
            
            // Fetch orders
            const ordersResponse = await userService.getOrders();
            if (ordersResponse.success) {
                const orders = ordersResponse.data || [];
                const totalOrders = orders.length;
                const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
                
                setUserStats(prev => ({
                    ...prev,
                    totalOrders,
                    totalSpent
                }));
            } else if (ordersResponse.message) {
                console.log('Orders fetch:', ordersResponse.message);
            }

            // Fetch wishlist
            const wishlistResponse = await userService.getWishlist();
            if (wishlistResponse.success) {
                const wishlist = wishlistResponse.data || [];
                setUserStats(prev => ({
                    ...prev,
                    wishlistCount: wishlist.length
                }));
            } else if (wishlistResponse.message) {
                console.log('Wishlist fetch:', wishlistResponse.message);
                // Fallback to localStorage wishlist
                const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                setUserStats(prev => ({
                    ...prev,
                    wishlistCount: localWishlist.length
                }));
            }

            // Fetch reviews
            const reviewsResponse = await userService.getUserReviews();
            if (reviewsResponse.success) {
                const reviews = reviewsResponse.data || [];
                setUserStats(prev => ({
                    ...prev,
                    reviewsCount: reviews.length
                }));
            } else if (reviewsResponse.message) {
                console.log('Reviews fetch:', reviewsResponse.message);
            }

            setIsLoading(false);
        };

        if (currentUser?.id) {
            fetchUserStats();
        } else {
            setIsLoading(false);
        }
    }, [currentUser?.id]);

    return (
        <div className="profile-info-card">
            <div className="profile-header">
                <div className="profile-avatar">
                    <i className="fas fa-user-circle"></i>
                </div>
                <div className="profile-title">
                    <h2>{currentUser?.name || 'User'}</h2>
                    <p className="profile-email">{currentUser?.email}</p>
                    {currentUser?.phone && (
                        <p className="profile-phone">
                            <i className="fas fa-phone-alt"></i> {currentUser?.phone}
                        </p>
                    )}
                    {currentUser?.role === 'ADMIN' && (
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
                            <span className="detail-value">{currentUser?.name || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Email Address</span>
                            <span className="detail-value">{currentUser?.email || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Phone Number</span>
                            <span className="detail-value">{currentUser?.phone || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Member Since</span>
                            <span className="detail-value">{formatDate(currentUser?.createdAt)}</span>
                        </div>
                        {currentUser?.role && (
                            <div className="detail-item">
                                <span className="detail-label">Account Type</span>
                                <span className="detail-value">{currentUser?.role || 'Customer'}</span>
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