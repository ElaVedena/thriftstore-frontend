import { useState } from 'react';
import '../../components/css/ProfileForm.css';

function ProfileForm({ user, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.phone && !/^0[17]\d{8}$/.test(formData.phone)) {
            newErrors.phone = 'Enter a valid Kenyan phone number';
        }

        if (showPasswordFields) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required';
            }

            if (formData.newPassword && formData.newPassword.length < 6) {
                newErrors.newPassword = 'Password must be at least 6 characters';
            }

            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Remove empty password fields if not changing password
            const submitData = { ...formData };
            if (!showPasswordFields) {
                delete submitData.currentPassword;
                delete submitData.newPassword;
                delete submitData.confirmPassword;
            }
            onSubmit(submitData);
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
                </div>

                <div className="password-toggle">
                    <button
                        type="button"
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                        className="toggle-password-btn"
                    >
                        <i className={`fas fa-chevron-${showPasswordFields ? 'up' : 'down'}`}></i>
                        {showPasswordFields ? 'Hide' : 'Change'} Password
                    </button>
                </div>

                {showPasswordFields && (
                    <div className="password-fields">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password *</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className={errors.currentPassword ? 'error' : ''}
                            />
                            {errors.currentPassword && (
                                <span className="error-message">{errors.currentPassword}</span>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className={errors.newPassword ? 'error' : ''}
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
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={errors.confirmPassword ? 'error' : ''}
                                />
                                {errors.confirmPassword && (
                                    <span className="error-message">{errors.confirmPassword}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" className="save-btn">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileForm;