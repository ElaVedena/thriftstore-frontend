import { useNotification } from '../../context/NotificationContext';
import '../../components/css/NotificationBadge.css';

function NotificationBadge({ onClick }) {
    const { unreadCount, markAllAsRead } = useNotification();

    if (unreadCount === 0) return null;

    return (
        <button
            className="notification-badge"
            onClick={onClick}
            aria-label={`${unreadCount} unread notifications`}
        >
            <span className="badge-count">{unreadCount}</span>
            <span className="badge-label">New</span>
        </button>
    );
}

export default NotificationBadge;