import { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../hooks/useNotification';
import '../../components/css/MpesaPayment.css';

function MpesaPayment({ amount, onInitiate, loading }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const phoneInputRef = useRef(null);
    const { showError, showInfo } = useNotification();

    // Sync loading state with parent
    useEffect(() => {
        setLocalLoading(loading);
    }, [loading]);

    // Focus phone input on mount
    useEffect(() => {
        if (phoneInputRef.current) {
            phoneInputRef.current.focus();
        }
    }, []);

    
    const formatPhoneNumber = (value) => {
      
        const cleaned = value.replace(/\D/g, '');
        
   
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;

        const remaining = cleaned.slice(6, 10);
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}${remaining ? ' ' + remaining : ''}`;
    };

    const validatePhone = (phone) => {
        
        const cleaned = phone.replace(/\D/g, '');
        
        console.log('Validating phone number:', { original: phone, cleaned, length: cleaned.length });
        
      
        if (cleaned.length === 10) {
        
            if (/^(07|01)\d{8}$/.test(cleaned)) {
                return true;
            }
        } 
      
        else if (cleaned.length === 12) {
            if (/^254(7|1)\d{8}$/.test(cleaned)) {
                return true;
            }
        }
      
        else if (cleaned.length === 9) {
            if (/^7\d{8}$/.test(cleaned)) {
                return true; 
            }
        }
        
        return false;
    };

    const formatPhoneForBackend = (phone) => {
       
        let cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 9 && cleaned.startsWith('7')) {
            cleaned = '0' + cleaned;
        }
        
        if (cleaned.startsWith('0')) {
            return '254' + cleaned.substring(1);
        }
        if (cleaned.startsWith('7')) {
            return '254' + cleaned;
        }
        return cleaned;
    };

    const getDisplayPhone = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('254')) {
            return '0' + cleaned.substring(3);
        }
        if (cleaned.length === 9 && cleaned.startsWith('7')) {
            return '0' + cleaned;
        }
        return cleaned;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
        setPhoneError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePhone(phoneNumber)) {
            const cleaned = phoneNumber.replace(/\D/g, '');
            let errorMsg = 'Please enter a valid Safaricom phone number';
            
            if (cleaned.length === 9) {
                errorMsg = 'Phone number should be 10 digits (e.g., 0712 345 678) - you might be missing a leading 0';
            } else if (cleaned.length > 0 && cleaned.length !== 10 && cleaned.length !== 12) {
                errorMsg = `Phone number must be 10 digits (e.g., 0712 345 678). You entered ${cleaned.length} digits.`;
            }
            
            setPhoneError(errorMsg);
            showError(errorMsg);
            return;
        }

        const formattedPhone = formatPhoneForBackend(phoneNumber);
        const displayPhone = getDisplayPhone(formattedPhone);
        
        // Show confirmation before initiating payment
        showInfo(`Initiating payment to ${displayPhone} for KSh ${amount?.toFixed(2)}`, {
            duration: 3000
        });
        
        if (onInitiate) {
            onInitiate(formattedPhone);
        }
    };

    return (
        <div className="mpesa-payment">
            <div className="payment-header">
                <div className="payment-icon">
                    <i className="fas fa-mobile-alt"></i>
                </div>
                <h3>M-Pesa Payment</h3>
                <p className="payment-subtitle">Pay securely with M-Pesa</p>
            </div>
            
            <div className="payment-amount-display">
                <span className="amount-label">Total Amount:</span>
                <span className="amount-value">KSh {amount?.toFixed(2)}</span>
            </div>
            
            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                    <label htmlFor="phone">
                        <i className="fas fa-phone"></i>
                        M-Pesa Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        ref={phoneInputRef}
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="0712 345 678"
                        required
                        disabled={localLoading}
                        className={`phone-input ${phoneError ? 'error' : ''}`}
                        autoComplete="off"
                        maxLength="13" 
                    />
                    {phoneError && (
                        <small className="error-text">{phoneError}</small>
                    )}
                    <small className="help-text">
                        Enter your M-Pesa registered phone number (e.g., 0712 345 678)
                    </small>
                </div>

                <button 
                    type="submit" 
                    className={`mpesa-pay-btn ${localLoading ? 'loading' : ''}`}
                    disabled={localLoading}
                >
                    {localLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Processing...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-lock"></i>
                            Pay KSh {amount?.toFixed(2)} with M-Pesa
                        </>
                    )}
                </button>
            </form>

            <div className="payment-features">
                <div className="feature">
                    <i className="fas fa-bolt"></i>
                    <span>Instant Payment</span>
                </div>
                <div className="feature">
                    <i className="fas fa-shield-alt"></i>
                    <span>Secure Transaction</span>
                </div>
                <div className="feature">
                    <i className="fas fa-clock"></i>
                    <span>24/7 Support</span>
                </div>
            </div>

            <div className="mpesa-instructions">
                <h4>
                    <i className="fas fa-info-circle"></i>
                    How to pay:
                </h4>
                <ol>
                    <li>Enter your M-Pesa phone number above</li>
                    <li>Click the payment button to initiate</li>
                    <li>You'll receive an STK push prompt on your phone</li>
                    <li>Enter your M-Pesa PIN to authorize</li>
                    <li>Wait for confirmation page will update automatically</li>
                </ol>
                <div className="note warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <small>Don't close this page until payment is complete</small>
                </div>
                <div className="note info">
                    <i className="fas fa-clock"></i>
                    <small>STK push usually arrives within 30 seconds</small>
                </div>
            </div>

            <div className="security-badge">
                <i className="fas fa-check-circle"></i>
                <span>Secured by M-Pesa</span>
            </div>
        </div>
    );
}

export default MpesaPayment;