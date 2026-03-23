import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../hooks/useNotification';
import '../components/css/Auth.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const { showError, showSuccess, showInfo } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', null, {
                params: { email }
            });

            if (response.data.success) {
                setSubmitted(true);
                showSuccess(
                    <div>
                        <p><strong>Password reset email sent!</strong></p>
                        <p>Check your inbox at <strong>{email}</strong></p>
                        <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
                            (Don't forget to check your spam folder)
                        </p>
                    </div>,
                    { duration: 6000 }
                );
            } else {
                showError(response.data.message);
            }
        } catch (error) {
            showError('Failed to send reset email. Please try again.');
            console.error('Forgot password error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setResending(true);
        
        try {
            const response = await api.post('/auth/forgot-password', null, {
                params: { email }
            });

            if (response.data.success) {
                showSuccess(
                    <div>
                        <p>Password reset email resent!</p>
                        <p>Please check <strong>{email}</strong></p>
                    </div>,
                    { duration: 4000 }
                );
            } else {
                showError(response.data.message);
            }
        } catch (error) {
            showError('Failed to resend email. Please try again.');
        } finally {
            setResending(false);
        }
    };

    if (submitted) {
        return (
            <div className="auth-page">
                <div className="auth-form-container">
                    <div className="email-sent-container">
                        <div className="success-icon">
                            <i className="fas fa-envelope-open-text"></i>
                        </div>
                        <h2>Check Your Email</h2>
                        
                        <div className="email-info">
                            <p>We've sent a password reset link to:</p>
                            <div className="email-highlight">{email}</div>
                            
                            <div className="email-tips">
                                <p>📧 Check your inbox (and spam folder)</p>
                                <p>⏱️ The link will expire in <strong>24 hours</strong></p>
                                <p>🔐 The link can only be used once</p>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button 
                                onClick={handleResendEmail} 
                                className="resend-btn"
                                disabled={resending}
                            >
                                {resending ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Resending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-redo-alt"></i>
                                        Resend Email
                                    </>
                                )}
                            </button>

                            <Link to="/login" className="back-to-login-btn">
                                <i className="fas fa-arrow-left"></i>
                                Back to Login
                            </Link>
                        </div>

                        <p className="need-help">
                            Didn't receive the email? 
                            <button 
                                onClick={() => {
                                    setSubmitted(false);
                                    setEmail('');
                                }}
                                className="try-again-link"
                            >
                                Try a different email
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-form-container">
                <h2>Reset Password</h2>
                <p className="auth-subtitle">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">
                            <i className="fas fa-envelope"></i>
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-submit-btn" 
                        disabled={loading || !email}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/login" className="back-link">
                        <i className="fas fa-arrow-left"></i>
                        Back to Login
                    </Link>
                    <Link to="/register" className="register-link">
                        Create Account
                    </Link>
                </div>

                <div className="security-note">
                    <i className="fas fa-shield-alt"></i>
                    <p>For security reasons, this link will expire in 24 hours and can only be used once.</p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;