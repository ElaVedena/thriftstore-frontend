import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../components/css/LoginForm.css';

function LoginForm({ onSubmit, isLoading, error, initialEmail = '' }) {
    const [formData, setFormData] = useState({
        email: initialEmail || '',
        password: '',
        rememberMe: false
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Update email when initialEmail changes 
    useEffect(() => {
        if (initialEmail) {
            setFormData(prev => ({ ...prev, email: initialEmail }));
        }
    }, [initialEmail]);

    const validateForm = () => {
        const errors = {};
        
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
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
            onSubmit(formData.email, formData.password, formData.rememberMe);
        }
    };

    // Handle paste for email 
    const handleEmailPaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        setFormData(prev => ({ ...prev, email: pastedText }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-form-container">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">
                {initialEmail ? 'Complete your login' : 'Sign in to your account'}
            </p>
            
            {error && (
                <div className="auth-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}
            
            {initialEmail && (
                <div className="auth-info">
                    <i className="fas fa-info-circle"></i>
                    <span>Account created! Please log in with your credentials.</span>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
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
                        onPaste={handleEmailPaste}
                        placeholder="Enter your email"
                        className={validationErrors.email ? 'error' : ''}
                        disabled={isLoading}
                        autoComplete="email"
                        autoFocus={!initialEmail} 
                    />
                    {validationErrors.email && (
                        <span className="field-error">{validationErrors.email}</span>
                    )}
                </div>

                <div className="form-group password-group">
                    <label htmlFor="password">
                        <i className="fas fa-lock"></i>
                        Password
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className={validationErrors.password ? 'error' : ''}
                            disabled={isLoading}
                            autoComplete="current-password"
                            autoFocus={!!initialEmail} 
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                            tabIndex="-1"
                        >
                            <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                        </button>
                    </div>
                    {validationErrors.password && (
                        <span className="field-error">{validationErrors.password}</span>
                    )}
                </div>

                <div className="form-options">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <span>Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="forgot-link">
                        Forgot Password?
                    </Link>
                </div>

                <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="auth-divider">
                <span>New to VedaThrifts?</span>
            </div>

            <p className="auth-redirect">
                <Link to="/register" className="register-link">
                    Create an account
                </Link>
            </p>
        </div>
    );
}

export default LoginForm;