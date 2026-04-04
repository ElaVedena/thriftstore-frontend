import { useState, useEffect } from 'react';
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
    const [fullUserData, setFullUserData] = useState(null);

    // Fetch full user data from backend
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await userService.getProfile();
                if (response.success) {
                    setFullUserData(response.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    // Use fetched data or fallback to auth user
    const currentUser = fullUserData || user;

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
                email: formData.email,
                phone: formData.phone
            });
            
            if (result.success) {
                // Update user in context
                updateUser({
                    ...currentUser,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                });
                
                showSuccess('Profile updated successfully!', {
                    title: 'Changes Saved',
                    duration: 3000
                });
                setIsEditing(false);
                
                // Refresh user data
                const refreshResponse = await userService.getProfile();
                if (refreshResponse.success) {
                    setFullUserData(refreshResponse.data);
                }
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

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h1>My Profile</h1>
            </div>

            {isEditing ? (
                <ProfileForm
                    user={currentUser}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    onPasswordChange={handlePasswordChange}
                    isLoading={loading}
                />
            ) : (
                <ProfileInfo
                    user={currentUser}
                    onEdit={handleEdit}
                />
            )}
        </div>
    );
}

export default Profile;