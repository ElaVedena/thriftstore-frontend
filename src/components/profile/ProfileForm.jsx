import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { userService } from '../../services/userService';
import '../../components/css/ProfileForm.css';

function ProfileForm({ user, onSubmit, onCancel }) {
    const { updateUserProfile } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const [errors, setErrors] = useState({});
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Update form when user data changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.phone && !/^0[17]\d{8}$/.test(formData.phone)) {
            newErrors.phone = 'Enter a valid Kenyan phone number (e.g., 0712345678)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePassword = () => {
        const newErrors = {};

        if (!passwordData.oldPassword) {
            newErrors.oldPassword = 'Current password is required';
        }

        if (passwordData.newPassword && passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await userService.updateProfile(formData);
            
            if (response.success) {
                // Update auth context with new user data
                if (updateUserProfile) {
                    updateUserProfile(formData);
                }
                showSuccess('Profile updated successfully!');
                if (onSubmit) onSubmit(formData);
            } else {
                showError(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            showError(error.response?.data?.message || 'An error occurred while updating profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!validatePassword()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await userService.changePassword(
                passwordData.oldPassword,
                passwordData.newPassword
            );

            if (response.success) {
                showSuccess('Password changed successfully!');
                setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordFields(false);
            } else {
                showError(response.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Password change error:', error);
            showError(error.response?.data?.message || 'An error occurred while changing password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="profile-form-card">
            <h2>Edit Profile</h2>
            
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                        placeholder="Enter your full name"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'error' : ''}
                        placeholder="your@email.com"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0712345678"
                        className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                    <small className="form-hint">Enter a valid Kenyan phone number (e.g., 0712345678)</small>
                </div>

                <div className="password-toggle">
                    <button
                        type="button"
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                        className="toggle-password-btn"
                    >
                        <i className={`fas fa-chevron-${showPasswordFields ? 'up' : 'down'}`}></i>
                        {showPasswordFields ? 'Cancel' : 'Change'} Password
                    </button>
                </div>

                {showPasswordFields && (
                    <div className="password-fields">
                        <div className="form-group">
                            <label htmlFor="oldPassword">Current Password *</label>
                            <input
                                type="password"
                                id="oldPassword"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                className={errors.oldPassword ? 'error' : ''}
                                placeholder="Enter current password"
                            />
                            {errors.oldPassword && (
                                <span className="error-message">{errors.oldPassword}</span>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className={errors.newPassword ? 'error' : ''}
                                    placeholder="Min. 6 characters"
                                />
                                {errors.newPassword && (
                                    <span className="error-message">{errors.newPassword}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className={errors.confirmPassword ? 'error' : ''}
                                    placeholder="Re-enter new password"
                                />
                                {errors.confirmPassword && (
                                    <span className="error-message">{errors.confirmPassword}</span>
                                )}
                            </div>
                        </div>

                        <div className="password-actions">
                            <button
                                type="button"
                                onClick={handlePasswordSubmit}
                                className="save-password-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" className="save-btn" disabled={isLoading}>
                        {isLoading ? (
                            <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileForm;