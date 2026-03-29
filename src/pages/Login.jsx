import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
            <>
                <Helmet>
                    <title>Redirecting | VedaThrifts</title>
                    <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <div className="auth-page loading">
                    <div className="spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Redirecting...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                {/* Primary SEO */}
                <title>Login | VedaThrifts - Thrift Store Kenya</title>
                <meta name="description" content="Login to your VedaThrifts account. Access your orders, manage your wishlist, and enjoy a personalized thrift shopping experience. Kenya's sustainable fashion destination." />
                <meta name="keywords" content="login, sign in, VedaThrifts account, thrift store login, customer account, secondhand fashion account" />
                <meta name="author" content="VedaThrifts" />
                <meta name="robots" content="noindex, follow" />
                
                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:title" content="Login | VedaThrifts" />
                <meta property="og:description" content="Login to your VedaThrifts account. Access your orders and manage your wishlist." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://vedathrifts.com/login" />
                <meta property="og:image" content="https://vedathrifts.com/og-image-login.jpg" />
                <meta property="og:site_name" content="VedaThrifts" />
                <meta property="og:locale" content="en_KE" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Login | VedaThrifts" />
                <meta name="twitter:description" content="Login to your VedaThrifts account. Access your orders and manage your wishlist." />
                <meta name="twitter:image" content="https://vedathrifts.com/og-image-login.jpg" />
                
                {/* Canonical URL */}
                <link rel="canonical" href="https://vedathrifts.com/login" />
            </Helmet>

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
        </>
    );
}

export default Login;