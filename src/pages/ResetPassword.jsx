import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../hooks/useNotification';
import '../components/css/Auth.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const { showError, showSuccess, showInfo } = useNotification();

    // Validate token on component mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setValidating(false);
                return;
            }

            try {
                const response = await api.get('/auth/validate-reset-token', {
                    params: { token }
                });

                if (response.data.success) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                    showError(response.data.message || 'Invalid or expired token');
                }
            } catch (error) {
                setTokenValid(false);
                showError('Failed to validate reset token');
                console.error('Token validation error:', error);
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token, showError]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password strength
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        if (!/[A-Z]/.test(password)) {
            showError('Password must contain at least one uppercase letter');
            return;
        }

        if (!/[0-9]/.test(password)) {
            showError('Password must contain at least one number');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/reset-password', null, {
                params: { token, newPassword: password }
            });

            if (response.data.success) {
                showSuccess(
                    <div>
                        <p><strong>Password reset successfully!</strong></p>
                        <p>You can now log in with your new password.</p>
                    </div>,
                    { duration: 5000 }
                );
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login', { 
                        state: { 
                            message: 'Password reset successful! Please log in.',
                            email: '' 
                        }
                    });
                }, 2000);
            } else {
                showError(response.data.message || 'Failed to reset password');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reset password. Please try again.';
            showError(message);
            console.error('Reset password error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestNewLink = () => {
        navigate('/forgot-password');
    };

    // Show loading state
    if (validating) {
        return (
            <div className="auth-page">
                <div className="auth-form-container">
                    <div className="loading-container">
                        <i className="fas fa-spinner fa-spin fa-3x"></i>
                        <p>Validating your reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show invalid token state
    if (!token || !tokenValid) {
        return (
            <div className="auth-page">
                <div className="auth-form-container">
                    <div className="error-container">
                        <div className="error-icon">
                            <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <h2>Invalid or Expired Link</h2>
                        <p className="error-message">
                            This password reset link is invalid, expired, or has already been used.
                        </p>
                        
                        <div className="action-buttons">
                            <button 
                                onClick={handleRequestNewLink}
                                className="request-new-btn"
                            >
                                <i className="fas fa-redo-alt"></i>
                                Request New Link
                            </button>
                            
                            <Link to="/login" className="back-to-login-btn">
                                <i className="fas fa-arrow-left"></i>
                                Back to Login
                            </Link>
                        </div>

                        <div className="security-note">
                            <i className="fas fa-shield-alt"></i>
                            <p>For security, password reset links expire after 24 hours and can only be used once.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-form-container">
                <h2>Set New Password</h2>
                <p className="auth-subtitle">
                    Enter your new password below. Make sure it's strong and unique.
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="password">
                            <i className="fas fa-lock"></i>
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            minLength="6"
                            autoComplete="new-password"
                        />
                        <div className="password-requirements">
                            <small>
                                Password must contain:
                                <span className={password.length >= 6 ? 'valid' : 'invalid'}>
                                    {password.length >= 6 ? ' ✓' : ' ✗'} 6+ characters
                                </span>
                                <span className={/[A-Z]/.test(password) ? 'valid' : 'invalid'}>
                                    {/[A-Z]/.test(password) ? ' ✓' : ' ✗'} Uppercase letter
                                </span>
                                <span className={/[0-9]/.test(password) ? 'valid' : 'invalid'}>
                                    {/[0-9]/.test(password) ? ' ✓' : ' ✗'} Number
                                </span>
                            </small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            <i className="fas fa-lock"></i>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            minLength="6"
                            autoComplete="new-password"
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <small className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                Passwords do not match
                            </small>
                        )}
                        {confirmPassword && password === confirmPassword && (
                            <small className="success-message">
                                <i className="fas fa-check-circle"></i>
                                Passwords match
                            </small>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="auth-submit-btn" 
                        disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Resetting Password...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/login" className="back-link">
                        <i className="fas fa-arrow-left"></i>
                        Back to Login
                    </Link>
                    <Link to="/forgot-password" className="forgot-link">
                        Request new link
                    </Link>
                </div>

                <div className="security-note">
                    <i className="fas fa-shield-alt"></i>
                    <p>For your security, choose a strong password that you don't use elsewhere.</p>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;