import React from 'react';
import '../../components/css/PaymentStatus.css';

function PaymentStatus({ status, orderNumber, amount, onRetry }) {
    const getStatusContent = () => {
        switch (status) {
            case 'processing':
                return {
                    icon: 'fa-spinner fa-spin',
                    title: 'Waiting for Payment',
                    message: 'STK Push sent to your phone. Please check M-Pesa and enter your PIN.',
                    color: '#ffc107'
                };
            case 'success':
                return {
                    icon: 'fa-check-circle',
                    title: 'Payment Successful!',
                    message: 'Your payment has been processed successfully.',
                    color: '#28a745'
                };
            case 'failed':
                return {
                    icon: 'fa-times-circle',
                    title: 'Payment Failed',
                    message: 'Your payment could not be processed. Please try again.',
                    color: '#dc3545'
                };
            case 'timeout':
                return {
                    icon: 'fa-clock',
                    title: 'Payment Confirmation Timeout',
                    message: 'Please check your M-Pesa messages. If payment was successful, your order will be processed.',
                    color: '#ff9800'
                };
            default:
                return {
                    icon: 'fa-info-circle',
                    title: 'Payment Status',
                    message: 'Processing your payment...',
                    color: '#17a2b8'
                };
        }
    };

    const content = getStatusContent();

    return (
        <div className={`payment-status-card ${status}`}>
            <div className="status-icon" style={{ color: content.color }}>
                <i className={`fas ${content.icon}`}></i>
            </div>
            
            <h3 className="status-title">{content.title}</h3>
            <p className="status-message">{content.message}</p>
            
            {orderNumber && (
                <div className="order-info">
                    <p><strong>Order Number:</strong> {orderNumber}</p>
                </div>
            )}
            
            {amount && status === 'processing' && (
                <div className="amount-info">
                    <p><strong>Amount:</strong> KSh {amount.toFixed(2)}</p>
                </div>
            )}
            
            {status === 'failed' && onRetry && (
                <button onClick={onRetry} className="retry-btn">
                    <i className="fas fa-redo-alt"></i>
                    Try Again
                </button>
            )}
            
            {status === 'timeout' && (
                <div className="timeout-actions">
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        <i className="fas fa-redo-alt"></i>
                        Try Again
                    </button>
                    <button onClick={() => window.location.href = '/orders'} className="check-orders-btn">
                        <i className="fas fa-box"></i>
                        Check My Orders
                    </button>
                </div>
            )}
        </div>
    );
}

export default PaymentStatus;