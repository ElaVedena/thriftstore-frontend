import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, requireAdmin = false }) {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check admin status
    if (requireAdmin) {
        const userRole = user?.role?.toUpperCase();
        if (userRole !== 'ADMIN') {
            console.log('Access denied - User role:', userRole);
            return <Navigate to="/" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;