import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import RegisterForm from '../components/auth/RegisterForm';
import '../components/css/Auth.css';

function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, isLoading, error, isAuthenticated } = useAuth();
    const { showSuccess, showError, showInfo } = useNotification();
    const [registeredEmail, setRegisteredEmail] = useState(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Check for email from location state 
    useEffect(() => {
        if (location.state?.email) {
            setRegisteredEmail(location.state.email);
        }
    }, [location.state]);

    const handleRegister = async (userData) => {
        const result = await register(userData);
        
        if (result.success) {
            setRegisteredEmail(userData.email);
            
            // Show success message with email confirmation info
            showSuccess(
                <div>
                    <p><strong>Welcome to Vedathrifts!</strong></p>
                    <p>Your account has been created successfully.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                        📧 A welcome email has been sent to <strong>{userData.email}</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                        (Check your spam folder if you don't see it)
                    </p>
                </div>,
                {
                    title: 'Registration Successful',
                    duration: 6000
                }
            );

            if (result.autoLogin) {
                // No need to navigate - the useEffect will redirect
            } else {
                // Navigate to login with email pre-filled
                setTimeout(() => {
                    navigate('/login', { 
                        state: { 
                            email: userData.email,
                            message: 'Account created! Please log in with your credentials.',
                            justRegistered: true
                        }
                    });
                }, 2000);
            }
        } else {
            showError(result.message || 'Registration failed. Please try again.');
        }
    };

    const handleResendWelcomeEmail = async () => {
        if (!registeredEmail) return;
        
        try {
            showInfo('Resending welcome email...', { duration: 2000 });
            
            // Call API to resend welcome email
            const response = await fetch(`/api/auth/resend-welcome-email?email=${registeredEmail}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess(
                    <div>
                        <p>Welcome email resent successfully!</p>
                        <p style={{ fontSize: '0.85rem' }}>Please check your inbox at <strong>{registeredEmail}</strong></p>
                    </div>,
                    { duration: 5000 }
                );
            } else {
                showError(data.message || 'Failed to resend email');
            }
        } catch (error) {
            showError('Failed to resend welcome email');
            console.error('Resend email error:', error);
        }
    };

    // Don't render form if already authenticated
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Create Account</h2>
                <p>Join Vedathrifts today</p>
                
                {registeredEmail ? (
                    <div className="email-confirmation-message">
                        <div className="success-icon">✓</div>
                        <h3>Account Created Successfully!</h3>
                        <p>A welcome email has been sent to:</p>
                        <p className="email-highlight">{registeredEmail}</p>
                        
                        <div className="email-tips">
                            <p> Check your inbox (and spam folder)</p>
                            <p>Add <strong>noreply@vedathrifts.com</strong> to your contacts</p>
                            <p>You can now log in with your credentials</p>
                        </div>
                        
                        <div className="action-buttons">
                            <button 
                                onClick={() => navigate('/login', { 
                                    state: { email: registeredEmail }
                                })} 
                                className="login-btn"
                            >
                                Go to Login
                            </button>
                            
                            <button 
                                onClick={handleResendWelcomeEmail} 
                                className="resend-btn"
                            >
                                Resend Welcome Email
                            </button>
                        </div>
                    </div>
                ) : (
                    <RegisterForm 
                        onSubmit={handleRegister}
                        isLoading={isLoading}
                        error={error}
                    />
                )}
            </div>
        </div>
    );
}

export default Register;