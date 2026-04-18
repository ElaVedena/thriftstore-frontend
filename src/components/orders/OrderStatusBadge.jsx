import '../../components/css/OrderStatusBadge.css';

function OrderStatusBadge({ status }) {
    // Normalize status to lowercase for consistent comparison
    const normalizedStatus = status ? status.toLowerCase() : '';
    
    const getStatusClass = () => {
        switch (normalizedStatus) {
            case 'paid':
                return 'status-paid';
            case 'processing':
                return 'status-processing';
            case 'shipped':
                return 'status-shipped';
            case 'delivered':
                return 'status-delivered';
            case 'cancelled':
            case 'payment_failed':
                return 'status-cancelled';
            case 'pending':
            case 'pending_payment':
                return 'status-pending';
            default:
                return 'status-pending';
        }
    };

    const getStatusIcon = () => {
        switch (normalizedStatus) {
            case 'paid':
                return 'fas fa-check-circle';
            case 'processing':
                return 'fas fa-cog fa-spin';
            case 'shipped':
                return 'fas fa-truck';
            case 'delivered':
                return 'fas fa-check-double';
            case 'cancelled':
                return 'fas fa-ban';
            case 'payment_failed':
                return 'fas fa-exclamation-triangle';
            case 'pending':
            case 'pending_payment':
                return 'fas fa-clock';
            default:
                return 'fas fa-circle';
        }
    };

    const getDisplayText = () => {
        if (!status) return 'Unknown';
        
        // Handle specific backend statuses
        const statusMap = {
            'paid': 'Paid',
            'processing': 'Processing',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',
            'payment_failed': 'Payment Failed',
            'pending': 'Pending',
            'pending_payment': 'Pending Payment'
        };
        
        // Check if status exists in map
        if (statusMap[normalizedStatus]) {
            return statusMap[normalizedStatus];
        }
        
        // Fallback: Convert from backend format (e.g., "PAID" -> "Paid")
        return status
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <span className={`order-status-badge ${getStatusClass()}`} title={getDisplayText()}>
            <i className={getStatusIcon()}></i>
            <span>{getDisplayText()}</span>
        </span>
    );
}

export default OrderStatusBadge;