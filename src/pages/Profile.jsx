import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { useNotification } from '../hooks/useNotification';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileForm from '../components/profile/ProfileForm';
import '../components/css/Profile.css';

function Profile() {
    const { user, updateUser } = useAuth();
    const { showSuccess, showError, showInfo } = useNotification();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
        showInfo('You can edit your profile information', { 
            duration: 2000,
            title: 'Edit Mode'
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        showInfo('Edit cancelled', { duration: 2000 });
    };

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            const result = await userService.updateProfile({
                name: formData.name,
                phone: formData.phone
            });
            
            if (result.success) {
                // Update user in context
                updateUser({
                    ...user,
                    name: formData.name,
                    phone: formData.phone
                });
                
                showSuccess('Profile updated successfully!', {
                    title: 'Changes Saved',
                    duration: 3000
                });
                setIsEditing(false);
            } else {
                showError(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            showError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (passwordData) => {
        try {
            // Validate passwords match
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                showError('New passwords do not match');
                return;
            }

            if (passwordData.newPassword.length < 6) {
                showError('Password must be at least 6 characters long');
                return;
            }

            const result = await userService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );
            
            if (result.success) {
                showSuccess('Password changed successfully!', { 
                    duration: 3000,
                    title: 'Security Update'
                });
            } else {
                showError(result.message || 'Failed to change password');
            }
        } catch (error) {
            showError('Failed to change password');
        }
    };

    // Fetch real user stats from backend 
    const enhancedUser = {
        ...user,
        totalOrders: 12, 
        totalSpent: 24500,
        wishlistCount: 8,
        reviewsCount: 5,
        createdAt: user?.createdAt || '2024-01-15T10:30:00Z'
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>My Profile</h1>
            </div>

            {isEditing ? (
                <ProfileForm
                    user={enhancedUser}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    onPasswordChange={handlePasswordChange}
                    isLoading={loading}
                />
            ) : (
                <ProfileInfo
                    user={enhancedUser}
                    onEdit={handleEdit}
                />
            )}
        </div>
    );
}

export default Profile;