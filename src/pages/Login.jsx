import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import LoginForm from '../components/auth/LoginForm';
import '../components/css/Auth.css';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, isAuthenticated } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [initialEmail, setInitialEmail] = useState('');

    // Check for email from registration and redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
        
        // Check if we have email from registration
        if (location.state?.email) {
            setInitialEmail(location.state.email);
            // Show success message if provided
            if (location.state?.message) {
                showSuccess(location.state.message, {
                    duration: 4000
                });
            }
        }
    }, [isAuthenticated, navigate, location, showSuccess]);

    const handleLogin = async (email, password) => {
        const result = await login(email, password);
        if (result?.success) {
            showSuccess('Welcome back! Successfully logged in.', {
                title: 'Login Successful',
                duration: 3000,
                action: {
                    label: 'Continue Shopping',
                    onClick: () => navigate('/shop')
                }
            });
            // Navigation will happen automatically via the useEffect above
        } else {
            showError(result?.message || 'Login failed. Please check your credentials.');
        }
    };

    // If already authenticated, don't render the form while redirecting
    if (isAuthenticated) {
        return (
            <div className="auth-page loading">
                <div className="spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Welcome Back</h2>
                <p>Login to your Vedathrifts account</p>
                
                <LoginForm 
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                    error={error}
                    initialEmail={initialEmail}
                />
                
                <div className="auth-links">
                    <p>
                        Don't have an account?{' '}
                        <a href="/register" onClick={(e) => {
                            e.preventDefault();
                            navigate('/register');
                        }}>
                            Register here
                        </a>
                    </p>
                    <a href="/forgot-password" className="forgot-password">
                        Forgot password?
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Login;