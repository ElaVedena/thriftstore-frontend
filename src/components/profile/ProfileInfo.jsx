import '../../components/css/ProfileInfo.css';

function ProfileInfo({ user, onEdit }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="profile-info-card">
            <div className="profile-header">
                <div className="profile-avatar">
                    <i className="fas fa-user-circle"></i>
                </div>
                <div className="profile-title">
                    <h2>{user?.name || 'User'}</h2>
                    <p className="profile-email">{user?.email}</p>
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
                    </div>
                </div>

                <div className="detail-group">
                    <h3>Stats</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-value">{user?.totalOrders || 0}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{user?.totalSpent || 0}</span>
                            <span className="stat-label">Total Spent (KSh)</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{user?.wishlistCount || 0}</span>
                            <span className="stat-label">Wishlist Items</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{user?.reviewsCount || 0}</span>
                            <span className="stat-label">Reviews</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileInfo;