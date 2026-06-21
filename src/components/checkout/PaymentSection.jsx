import { useState } from 'react';
import '../../components/css/PaymentSection.css';

function PaymentSection({ onPaymentComplete, total, shippingCost }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [mpesaCode, setMpesaCode] = useState('');
    const [error, setError] = useState('');

    const formatPrice = (price) => {
        return `KSh ${price.toFixed(2)}`;
    };

    const handleSTKPush = async () => {
        setIsProcessing(true);
        setError('');
        
        // Simulate STK push
        setTimeout(() => {
            setIsProcessing(false);
            const mockConfirmationCode = 'STK' + Math.random().toString(36).substring(2, 8).toUpperCase();
            setMpesaCode(mockConfirmationCode);
        }, 3000);
    };

    const handleConfirmPayment = () => {
        if (!mpesaCode) {
            setError('Please wait for STK push confirmation');
            return;
        }
        onPaymentComplete({
            method: 'M-Pesa',
            code: mpesaCode,
            amount: total
        });
    };

    return (
        <div className="payment-section">
            <h2>Payment Method</h2>
            
            <div className="payment-method-card">
                <div className="payment-method-header">
                    <img 
                        src="https://safaricom.co.ke/images/m-pesa-logo.png" 
                        alt="M-Pesa" 
                        className="mpesa-logo"
                    />
                    <span className="payment-badge">Only Accepted Payment</span>
                </div>

                <div className="payment-details">
                    <div className="amount-display">
                        <span>Amount to Pay:</span>
                        <strong>{formatPrice(total)}</strong>
                    </div>
                    
                    {shippingCost !== undefined && (
                        <div className="shipping-display">
                            <span>Shipping Cost:</span>
                            <strong>{formatPrice(shippingCost)}</strong>
                        </div>
                    )}

                    {!mpesaCode ? (
                        <button 
                            onClick={handleSTKPush}
                            className={`stk-push-btn ${isProcessing ? 'processing' : ''}`}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Sending STK Push...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-mobile-alt"></i>
                                    Pay with M-Pesa (STK Push)
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="payment-confirmation">
                            <div className="confirmation-code">
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <p>Payment Successful!</p>
                                    <small>Confirmation Code: {mpesaCode}</small>
                                </div>
                            </div>
                            <button 
                                onClick={handleConfirmPayment}
                                className="complete-payment-btn"
                            >
                                Complete Order
                            </button>
                        </div>
                    )}

                    {error && <div className="payment-error">{error}</div>}

                    <div className="payment-info">
                        <p>
                            <i className="fas fa-info-circle"></i>
                            You will receive an STK push prompt on your phone to complete the payment
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentSection;