import { useEffect, useState, useCallback } from 'react'; 
import { NOTIFICATION_TYPES } from '../../context/NotificationContext';
import '../../components/css/Toast.css';

function Toast({ 
    notification, 
    onClose, 
    autoClose = 5000,
    pauseOnHover = true 
}) {
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    
    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(notification.id);
        }, 300);
    }, [notification.id, onClose]); 

    useEffect(() => {
        if (autoClose === 0 || isPaused) return;

        const interval = 100;
        const decrement = (interval / autoClose) * 100;
        
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleClose();
                    return 0;
                }
                return prev - decrement;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [autoClose, isPaused, handleClose]); 

    const getIcon = () => {
        switch (notification.type) {
            case NOTIFICATION_TYPES.SUCCESS:
                return 'fas fa-check-circle';
            case NOTIFICATION_TYPES.ERROR:
                return 'fas fa-exclamation-circle';
            case NOTIFICATION_TYPES.WARNING:
                return 'fas fa-exclamation-triangle';
            case NOTIFICATION_TYPES.INFO:
            default:
                return 'fas fa-info-circle';
        }
    };

    const getTitle = () => {
        if (notification.title) return notification.title;
        
        switch (notification.type) {
            case NOTIFICATION_TYPES.SUCCESS:
                return 'Success';
            case NOTIFICATION_TYPES.ERROR:
                return 'Error';
            case NOTIFICATION_TYPES.WARNING:
                return 'Warning';
            case NOTIFICATION_TYPES.INFO:
            default:
                return 'Info';
        }
    };

    return (
        <div
            className={`toast toast-${notification.type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => pauseOnHover && setIsPaused(false)}
            role="alert"
        >
            <div className="toast-content">
                <div className="toast-icon">
                    <i className={getIcon()}></i>
                </div>
                
                <div className="toast-message">
                    <h4 className="toast-title">{getTitle()}</h4>
                    <p className="toast-text">{notification.message}</p>
                </div>

                <button
                    className="toast-close"
                    onClick={handleClose}
                    aria-label="Close notification"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {autoClose > 0 && (
                <div className="toast-progress">
                    <div
                        className="toast-progress-bar"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            {notification.action && (
                <div className="toast-action">
                    <button
                        className="toast-action-btn"
                        onClick={() => {
                            notification.action.onClick();
                            handleClose();
                        }}
                    >
                        {notification.action.label}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Toast;