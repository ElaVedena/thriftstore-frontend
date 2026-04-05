import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNotification } from '../hooks/useNotification';
import { checkoutService } from '../services/checkoutService';
import ShippingForm from '../components/checkout/ShippingForm';
import OrderSummary from '../components/checkout/OrderSummary';
import MpesaPayment from '../components/payment/MpesaPayment';
import '../components/css/Checkout.css';

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, totalPrice, clearCart } = useCart();
    const { showSuccess, showError, showInfo } = useNotification();
    const [step, setStep] = useState('shipping');
    const [shippingInfo, setShippingInfo] = useState(null);
    const [orderNumber, setOrderNumber] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed, timeout
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [pollingAttempts, setPollingAttempts] = useState(0);

    // Clear any pending orders on mount
    useEffect(() => {
        const pendingOrder = localStorage.getItem('pendingOrder');
        if (pendingOrder) {
            localStorage.removeItem('pendingOrder');
        }
        
        // Cleanup polling on unmount
        return () => {
            const pollInterval = sessionStorage.getItem('pollInterval');
            if (pollInterval) {
                clearInterval(parseInt(pollInterval));
                sessionStorage.removeItem('pollInterval');
            }
        };
    }, []);

    // Define shipping cost function - MATCHING OrderSummary.jsx
    const getShippingCost = (county) => {
        if (!county) return 0;
        
        // Nairobi and surrounding counties
        const nairobiRegion = ['Nairobi', 'Kiambu', 'Machakos', 'Kajiado'];
        // Central Kenya counties
        const centralRegion = ['Muranga', 'Nyeri', 'Kirinyaga', 'Nyandarua', 'Embu', 'Meru', 'Tharaka Nithi'];
        // Coastal counties
        const coastalRegion = ['Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta'];
        // Western Kenya counties
        const westernRegion = ['Kisumu', 'Kisii', 'Nyamira', 'Homa Bay', 'Migori', 'Siaya', 'Vihiga', 'Kakamega', 'Bungoma', 'Busia', 'Trans Nzoia'];
        // Rift Valley counties
        const riftRegion = ['Nakuru', 'Uasin Gishu', 'Kericho', 'Bomet', 'Nandi', 'Baringo', 'Laikipia', 'Samburu', 'Turkana', 'West Pokot', 'Elgeyo Marakwet'];
        // Northern and remote counties (higher shipping cost)
        const remoteRegion = ['Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo'];
        
        if (nairobiRegion.includes(county)) {
            return 150; // KSh 150 for Nairobi and surrounding
        } else if (centralRegion.includes(county)) {
            return 250; // KSh 250 for Central Kenya
        } else if (coastalRegion.includes(county)) {
            return 350; // KSh 350 for Coast
        } else if (westernRegion.includes(county)) {
            return 300; // KSh 300 for Western Kenya
        } else if (riftRegion.includes(county)) {
            return 250; // KSh 250 for Rift Valley
        } else if (remoteRegion.includes(county)) {
            return 500; // KSh 500 for remote areas
        } else {
            return 400; // Default for other counties
        }
    };

    const handleShippingSubmit = (data) => {
        setShippingInfo(data);
        setStep('payment');
        showSuccess('Shipping information saved!', { duration: 2000 });
        window.scrollTo(0, 0);
    };

    const handleInitiatePayment = async (phoneNumber) => {
        setCheckoutLoading(true);
        setPollingAttempts(0);
        
        try {
            // Calculate shipping and total using the correct shipping costs
            const shipping = getShippingCost(shippingInfo.county);
            const subtotal = totalPrice;
            const total = subtotal + shipping;

            console.log('Checkout Data:', {
                phoneNumber,
                subtotal,
                shipping,
                total,
                county: shippingInfo.county,
                email: shippingInfo.email
            });

            // Prepare order items with proper image URLs
            const orderItems = cartItems.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                size: item.size || 'One Size',
                imageUrl: item.imageUrl || ''
            }));

            // Generate a random payment code for testing
            const paymentCode = 'MPESA' + Math.random().toString(36).substring(2, 8).toUpperCase();

            // Prepare checkout data 
            const checkoutData = {
                phoneNumber: phoneNumber,
                subtotal: subtotal,
                shippingCost: shipping,
                total: total,
                paymentMethod: 'M-PESA',
                paymentCode: paymentCode,
                shippingAddress: shippingInfo.address,
                city: shippingInfo.city,
                county: shippingInfo.county,
                phone: shippingInfo.phone,
                email: shippingInfo.email,
                items: orderItems
            };

            console.log('========== FINAL CHECKOUT DATA ==========');
            console.log('Checkout data being sent:', JSON.stringify(checkoutData, null, 2));
            console.log('Email for confirmation:', shippingInfo.email);
            console.log('Payment Method:', checkoutData.paymentMethod);
            console.log('Payment Code:', checkoutData.paymentCode);

            // Call backend to initiate checkout
            const response = await checkoutService.initiateCheckout(checkoutData);
            
            console.log('========== RESPONSE DEBUG ==========');
            console.log('Full checkout response:', response);
            
            if (response.success) {
                // Try to get order number 
                const possibleOrderNumberFields = [
                    'orderNumber',
                    'order_number',
                    'orderNo',
                    'order_no',
                    'reference',
                    'accountReference',
                    'account_reference'
                ];
                
                let orderNum = null;
                
                // Try each possible field name
                for (const field of possibleOrderNumberFields) {
                    if (response.data?.data?.[field]) {
                        orderNum = response.data.data[field];
                        console.log(`Found order number in field '${field}':`, orderNum);
                        break;
                    }
                }
                
                // If still not found, try direct access to the data object
                if (!orderNum && response.data?.data) {
                    for (const key in response.data.data) {
                        const value = response.data.data[key];
                        if (typeof value === 'string' && value.startsWith('ORD-')) {
                            orderNum = value;
                            console.log(`Found order number in field '${key}' with value:`, value);
                            break;
                        }
                    }
                }
                
                console.log('Extracted order number:', orderNum);
                
                if (!orderNum) {
                    console.error('No order number found in response!');
                    console.log('Full response.data:', JSON.stringify(response.data, null, 2));
                    
                    showError('Could not get order number from server response');
                    setPaymentStatus('failed');
                    setCheckoutLoading(false);
                    return;
                }
                
                setOrderNumber(orderNum);
                
                // Store in session storage temporarily
                sessionStorage.setItem('currentOrderNumber', orderNum);
                
                setPaymentStatus('processing');
                showInfo('STK Push sent to your phone. Please check M-Pesa and enter PIN to complete payment.', {
                    title: 'Payment Initiated',
                    duration: 10000
                });

                // Show email notification
                showInfo(`Order confirmation will be sent to ${shippingInfo.email}`, {
                    title: 'Check Your Email',
                    duration: 5000
                });
                
                // Start polling for payment status using the order number
                startPolling(orderNum);
                
            } else {
                showError(response.message || 'Failed to initiate payment');
                setPaymentStatus('failed');
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            showError('Failed to initiate payment. Please try again.');
            setPaymentStatus('failed');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const startPolling = (orderNum) => {
        let attempts = 0;
        const maxAttempts = 60; 
        
        console.log('Starting polling for order:', orderNum);
        setPollingAttempts(0);
        
        const pollInterval = setInterval(async () => {
            attempts++;
            setPollingAttempts(attempts);
            
            try {
                console.log(`Polling attempt ${attempts} for order:`, orderNum);
                const statusResponse = await checkoutService.getOrderStatus(orderNum);
                
                console.log('Status response:', statusResponse);
                
                if (statusResponse.success) {
                    // Extract status from the response 
                    const orderStatus = statusResponse.data?.data?.status || 
                                       statusResponse.data?.status ||
                                       statusResponse.data?.orderStatus;
                    
                    console.log('Order status:', orderStatus, 'attempt', attempts);
                    
                    // Check for success statuses
                    if (orderStatus === 'PAID' || 
                        orderStatus === 'COMPLETED' || 
                        orderStatus === 'SUCCESS') {
                        console.log(' Payment successful!');
                        clearInterval(pollInterval);
                        handlePaymentSuccess(orderNum);
                    } 
                    // Check for failed statuses
                    else if (orderStatus === 'FAILED' || 
                             orderStatus === 'PAYMENT_FAILED' || 
                             orderStatus === 'CANCELLED') {
                        console.log(' Payment failed');
                        clearInterval(pollInterval);
                        setPaymentStatus('failed');
                        showError('Payment failed. Please try again.');
                    }
                    
                    else {
                        console.log('⏳ Payment still pending...');
                    }
                } else {
                    console.log('Status check returned not successful:', statusResponse.message);
                }
                
                // Check for timeout
                if (attempts >= maxAttempts) {
                    console.log('⏰ Polling timeout after', attempts, 'attempts');
                    clearInterval(pollInterval);
                    setPaymentStatus('timeout');
                    showInfo('Payment confirmation timeout. Please check your M-Pesa messages.', {
                        duration: 8000
                    });
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 4000); 

        // Store interval ID for cleanup
        sessionStorage.setItem('pollInterval', pollInterval);
    };

    const handlePaymentSuccess = async (orderNum) => {
        setPaymentStatus('success');
        
        try {
            // Get final order details
            const orderResponse = await checkoutService.getOrderStatus(orderNum);
            let orderDetails = null;
            
            if (orderResponse.success) {
                // Extract order details from response
                orderDetails = orderResponse.data?.data || orderResponse.data;
                
                // Add shipping info to order details if not present
                if (orderDetails && shippingInfo) {
                    orderDetails.shipping = {
                        fullName: shippingInfo.fullName,
                        phone: shippingInfo.phone,
                        email: shippingInfo.email,
                        address: shippingInfo.address,
                        city: shippingInfo.city,
                        county: shippingInfo.county
                    };
                }
            }
            
            // Clear cart
            clearCart();
            
            // Clear session storage
            sessionStorage.removeItem('currentOrderNumber');
            const pollInterval = sessionStorage.getItem('pollInterval');
            if (pollInterval) {
                clearInterval(parseInt(pollInterval));
                sessionStorage.removeItem('pollInterval');
            }
            
            // Calculate current shipping for fallback
            const shippingCost = shippingInfo ? getShippingCost(shippingInfo.county) : 0;
            
            // Create complete order data for confirmation page
            const completeOrderData = orderDetails || {
                orderNumber: orderNum,
                items: cartItems,
                subtotal: totalPrice,
                shippingCost: shippingCost,
                total: totalPrice + shippingCost,
                shipping: {
                    fullName: shippingInfo?.fullName,
                    phone: shippingInfo?.phone,
                    email: shippingInfo?.email,
                    address: shippingInfo?.address,
                    city: shippingInfo?.city,
                    county: shippingInfo?.county
                }
            };
            
            // Store order in localStorage for confirmation page
            localStorage.setItem('lastOrder', JSON.stringify(completeOrderData));
            
            // Show success message with email confirmation
            showSuccess('Payment successful! Check your email for order confirmation.', {
                title: 'Order Confirmed',
                duration: 7000,
                action: {
                    label: 'View Order',
                    onClick: () => navigate(`/orders/${orderNum}`)
                }
            });
            
            // Navigate to confirmation page with complete order data
            setTimeout(() => {
                navigate('/order-confirmation', { 
                    state: { 
                        orderData: completeOrderData, 
                        orderNumber: orderNum,
                        customerEmail: shippingInfo?.email
                    } 
                });
            }, 1500);
            
        } catch (error) {
            console.error('Error fetching order details:', error);
            
            const shippingCost = shippingInfo ? getShippingCost(shippingInfo.county) : 0;
            
            // Create fallback order data
            const fallbackOrderData = {
                orderNumber: orderNum,
                items: cartItems,
                subtotal: totalPrice,
                shippingCost: shippingCost,
                total: totalPrice + shippingCost,
                shipping: {
                    fullName: shippingInfo?.fullName,
                    phone: shippingInfo?.phone,
                    email: shippingInfo?.email,
                    address: shippingInfo?.address,
                    city: shippingInfo?.city,
                    county: shippingInfo?.county
                }
            };
            
            localStorage.setItem('lastOrder', JSON.stringify(fallbackOrderData));
            
            navigate('/order-confirmation', { 
                state: { 
                    orderData: fallbackOrderData,
                    orderNumber: orderNum,
                    customerEmail: shippingInfo?.email 
                } 
            });
        }
    };

    const handleRetryPayment = () => {
        setPaymentStatus('idle');
        setPollingAttempts(0);
        // Clear any existing polling
        const pollInterval = sessionStorage.getItem('pollInterval');
        if (pollInterval) {
            clearInterval(parseInt(pollInterval));
            sessionStorage.removeItem('pollInterval');
        }
    };

    // Calculate total with shipping for payment section
    const calculateTotalWithShipping = () => {
        if (shippingInfo) {
            const shipping = getShippingCost(shippingInfo.county);
            return totalPrice + shipping;
        }
        return totalPrice;
    };

    // Get current shipping cost for display
    const currentShipping = shippingInfo ? getShippingCost(shippingInfo.county) : 0;

    return (
        <div className="checkout-page">
            <div className="checkout-header">
                <h1>Checkout</h1>
                <div className="checkout-steps">
                    <div className={`step ${step === 'shipping' ? 'active' : ''} ${shippingInfo ? 'completed' : ''}`}>
                        <span className="step-number">1</span>
                        <span className="step-label">Shipping</span>
                    </div>
                    <div className={`step-line ${step === 'payment' ? 'active' : ''}`}></div>
                    <div className={`step ${step === 'payment' ? 'active' : ''}`}>
                        <span className="step-number">2</span>
                        <span className="step-label">Payment</span>
                    </div>
                </div>
                {paymentStatus === 'processing' && (
                    <div className="polling-info">
                        Polling for payment confirmation... ({pollingAttempts}/60)
                    </div>
                )}
            </div>

            <div className="checkout-container">
                <div className="checkout-main">
                    {step === 'shipping' && (
                        <ShippingForm onSubmit={handleShippingSubmit} />
                    )}
                    
                    {step === 'payment' && (
                        <>
                            {paymentStatus === 'processing' && (
                                <div className="payment-processing">
                                    <div className="payment-status-card">
                                        <div className="status-icon">
                                            <i className="fas fa-spinner fa-spin"></i>
                                        </div>
                                        <h3>Waiting for Payment</h3>
                                        <p className="status-message">
                                            STK Push sent to your phone. Please check M-Pesa and enter your PIN.
                                        </p>
                                        <div className="payment-details">
                                            <div className="detail-row">
                                                <span>Order Number:</span>
                                                <strong>{orderNumber}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Amount:</span>
                                                <strong>KSh {calculateTotalWithShipping().toFixed(2)}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Shipping:</span>
                                                <strong>KSh {currentShipping.toFixed(2)}</strong>
                                            </div>
                                        </div>
                                        <div className="email-notice">
                                            <i className="fas fa-envelope"></i>
                                            <span>A confirmation email will be sent to {shippingInfo?.email}</span>
                                        </div>
                                        <div className="polling-progress">
                                            <div 
                                                className="polling-bar" 
                                                style={{ width: `${(pollingAttempts / 60) * 100}%` }}
                                            ></div>
                                            <span>Waiting for payment confirmation... ({pollingAttempts}/60)</span>
                                        </div>
                                        <button 
                                            onClick={handleRetryPayment} 
                                            className="cancel-btn"
                                        >
                                            Cancel Payment
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {paymentStatus === 'success' && (
                                <div className="payment-success">
                                    <div className="success-icon">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <h2>Payment Successful!</h2>
                                    <p>Your order has been confirmed.</p>
                                    <p className="order-number">Order #{orderNumber}</p>
                                    <p className="email-confirm">
                                        <i className="fas fa-envelope"></i>
                                        Confirmation email sent to {shippingInfo?.email}
                                    </p>
                                    <p className="redirect-message">Redirecting to confirmation page...</p>
                                </div>
                            )}
                            
                            {paymentStatus === 'failed' && (
                                <div className="payment-error-container">
                                    <div className="payment-error">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <h3>Payment Failed</h3>
                                        <p>Your payment could not be processed. Please try again.</p>
                                        <button onClick={handleRetryPayment} className="retry-btn">
                                            <i className="fas fa-redo-alt"></i>
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {paymentStatus === 'timeout' && (
                                <div className="payment-timeout">
                                    <i className="fas fa-clock"></i>
                                    <h3>Payment Confirmation Timeout</h3>
                                    <p>Please check your M-Pesa messages. If payment was successful, your order will be processed.</p>
                                    <div className="timeout-actions">
                                        <button onClick={handleRetryPayment} className="retry-btn">
                                            <i className="fas fa-redo-alt"></i>
                                            Try Again
                                        </button>
                                        <button onClick={() => navigate('/orders')} className="check-orders-btn">
                                            <i className="fas fa-box"></i>
                                            Check My Orders
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {paymentStatus === 'idle' && (
                                <MpesaPayment
                                    amount={calculateTotalWithShipping()}
                                    onInitiate={handleInitiatePayment}
                                    loading={checkoutLoading}
                                />
                            )}
                        </>
                    )}
                </div>

                <div className="checkout-sidebar">
                    <OrderSummary 
                        items={cartItems}
                        subtotal={totalPrice}
                        shipping={currentShipping}
                        total={calculateTotalWithShipping()}
                        selectedCounty={shippingInfo?.county}
                    />
                </div>
            </div>
        </div>
    );
}

export default Checkout;