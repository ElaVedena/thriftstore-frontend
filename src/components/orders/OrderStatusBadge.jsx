import '../../components/css/OrderStatusBadge.css';

function OrderStatusBadge({ status }) {
    const normalizedStatus = status ? status.toLowerCase() : '';
    
    const getStatusClass = () => {
        switch (normalizedStatus) {
            case 'paid':
            case 'delivered':
                return 'status-delivered';
            case 'shipped':
                return 'status-shipped';
            case 'processing':
                return 'status-processing';
            case 'pending':
            case 'pending_payment':
                return 'status-pending';
            case 'cancelled':
            case 'payment_failed':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    const getStatusIcon = () => {
        switch (normalizedStatus) {
            case 'paid':
            case 'delivered':
                return 'fas fa-check-circle';
            case 'shipped':
                return 'fas fa-truck';
            case 'processing':
                return 'fas fa-cog';
            case 'pending':
            case 'pending_payment':
                return 'fas fa-clock';
            case 'cancelled':
            case 'payment_failed':
                return 'fas fa-times-circle';
            default:
                return 'fas fa-circle';
        }
    };

    const getDisplayText = () => {
        if (!status) return 'Unknown';
        
        // Convert from backend format
        return status
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <span className={`order-status-badge ${getStatusClass()}`}>
            <i className={getStatusIcon()}></i>
            <span>{getDisplayText()}</span>
        </span>
    );
}

export default OrderStatusBadge;