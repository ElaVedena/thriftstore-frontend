import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../components/css/RegisterForm.css';

function RegisterForm({ onSubmit, isLoading, error }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });
    const [validationErrors, setValidationErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name) {
            errors.name = 'Full name is required';
        }
        
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }
        
        if (!formData.phone) {
            errors.phone = 'Phone number is required';
        } else if (!/^0[17]\d{8}$/.test(formData.phone)) {
            errors.phone = 'Enter a valid Kenyan phone number (e.g., 0712345678)';
        }
        
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.acceptTerms) {
            errors.acceptTerms = 'You must accept the terms and conditions';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const { confirmPassword, acceptTerms, ...userData } = formData;
            onSubmit(userData);
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join VedaThrifts today</p>
            
            {error && (
                <div className="auth-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="name">
                        <i className="fas fa-user"></i>
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={validationErrors.name ? 'error' : ''}
                    />
                    {validationErrors.name && (
                        <span className="field-error">{validationErrors.name}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="email">
                        <i className="fas fa-envelope"></i>
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={validationErrors.email ? 'error' : ''}
                    />
                    {validationErrors.email && (
                        <span className="field-error">{validationErrors.email}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">
                        <i className="fas fa-phone"></i>
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0712345678"
                        className={validationErrors.phone ? 'error' : ''}
                    />
                    {validationErrors.phone && (
                        <span className="field-error">{validationErrors.phone}</span>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="password">
                            <i className="fas fa-lock"></i>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className={validationErrors.password ? 'error' : ''}
                        />
                        {validationErrors.password && (
                            <span className="field-error">{validationErrors.password}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            <i className="fas fa-lock"></i>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className={validationErrors.confirmPassword ? 'error' : ''}
                        />
                        {validationErrors.confirmPassword && (
                            <span className="field-error">{validationErrors.confirmPassword}</span>
                        )}
                    </div>
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                        />
                        <span>
                            I accept the <Link to="/terms">Terms of Service</Link> and{' '}
                            <Link to="/privacy">Privacy Policy</Link>
                        </span>
                    </label>
                    {validationErrors.acceptTerms && (
                        <span className="field-error">{validationErrors.acceptTerms}</span>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Creating Account...
                        </>
                    ) : (
                        'Sign Up'
                    )}
                </button>
            </form>

            <p className="auth-redirect">
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
            </p>
        </div>
    );
}

export default RegisterForm;