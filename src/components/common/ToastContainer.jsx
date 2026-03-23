import { useNotification, TOAST_POSITIONS } from '../../context/NotificationContext';
import Toast from './Toast';
import '../../components/css/ToastContainer.css';

function ToastContainer() {
    const { notifications, position, removeNotification, autoClose, pauseOnHover } = useNotification();

    const getPositionClass = () => {
        switch (position) {
            case TOAST_POSITIONS.TOP_LEFT:
                return 'top-left';
            case TOAST_POSITIONS.TOP_CENTER:
                return 'top-center';
            case TOAST_POSITIONS.BOTTOM_RIGHT:
                return 'bottom-right';
            case TOAST_POSITIONS.BOTTOM_LEFT:
                return 'bottom-left';
            case TOAST_POSITIONS.BOTTOM_CENTER:
                return 'bottom-center';
            case TOAST_POSITIONS.TOP_RIGHT:
            default:
                return 'top-right';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className={`toast-container ${getPositionClass()}`}>
            {notifications.map((notification) => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onClose={removeNotification}
                    autoClose={notification.duration || autoClose}
                    pauseOnHover={pauseOnHover}
                />
            ))}
        </div>
    );
}

export default ToastContainer;