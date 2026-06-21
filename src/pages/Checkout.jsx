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
    const [paymentStatus, setPaymentStatus] = useState('idle');
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        const pendingOrder = localStorage.getItem('pendingOrder');
        if (pendingOrder) {
            localStorage.removeItem('pendingOrder');
        }
        
        return () => {
            const pollInterval = sessionStorage.getItem('pollInterval');
            if (pollInterval) {
                clearInterval(parseInt(pollInterval));
                sessionStorage.removeItem('pollInterval');
            }
        };
    }, []);

    // UPDATED: Shipping costs - Nairobi = 200, all other counties = 300
    const getShippingCost = (county) => {
        if (!county) return 0;
        
        // Nairobi gets 200, all other counties get 300
        if (county.toLowerCase() === 'nairobi') {
            return 200;
        }
        return 300;
    };

    const handleShippingSubmit = (data) => {
        setShippingInfo(data);
        setStep('payment');
        showSuccess('Shipping information saved!', { duration: 2000 });
        window.scrollTo(0, 0);
    };

    const handleInitiatePayment = async (phoneNumber) => {
        setCheckoutLoading(true);
        
        try {
            const shipping = getShippingCost(shippingInfo.county);
            const subtotal = totalPrice;
            const total = subtotal + shipping;

            const orderItems = cartItems.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                size: item.size || 'One Size',
                imageUrl: item.imageUrl || ''
            }));

            const paymentCode = 'MPESA' + Math.random().toString(36).substring(2, 8).toUpperCase();

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

            const response = await checkoutService.initiateCheckout(checkoutData);
            
            if (response.success) {
                let orderNum = null;
                
                if (response.data?.data?.orderNumber) {
                    orderNum = response.data.data.orderNumber;
                } else if (response.data?.orderNumber) {
                    orderNum = response.data.orderNumber;
                }
                
                if (!orderNum) {
                    showError('Could not get order number from server response');
                    setPaymentStatus('failed');
                    setCheckoutLoading(false);
                    return;
                }
                
                setOrderNumber(orderNum);
                sessionStorage.setItem('currentOrderNumber', orderNum);
                setPaymentStatus('processing');
                
                showInfo('STK Push sent to your phone. Please check M-Pesa and enter PIN to complete payment.', {
                    title: 'Payment Initiated',
                    duration: 10000
                });
                
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
        
        const pollInterval = setInterval(async () => {
            attempts++;
            
            try {
                const statusResponse = await checkoutService.getOrderStatus(orderNum);
                
                if (statusResponse.success) {
                    const orderStatus = statusResponse.data?.data?.status || 
                                       statusResponse.data?.status ||
                                       statusResponse.data?.orderStatus;
                    
                    if (orderStatus === 'PAID' || orderStatus === 'COMPLETED' || orderStatus === 'SUCCESS') {
                        clearInterval(pollInterval);
                        handlePaymentSuccess(orderNum);
                    } else if (orderStatus === 'FAILED' || orderStatus === 'PAYMENT_FAILED' || orderStatus === 'CANCELLED') {
                        clearInterval(pollInterval);
                        setPaymentStatus('failed');
                        showError('Payment failed. Please try again.');
                    }
                }
                
                if (attempts >= maxAttempts) {
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

        sessionStorage.setItem('pollInterval', pollInterval);
    };

    const handlePaymentSuccess = async (orderNum) => {
        setPaymentStatus('success');
        
        try {
            const orderResponse = await checkoutService.getOrderStatus(orderNum);
            let orderDetails = null;
            
            if (orderResponse.success) {
                orderDetails = orderResponse.data?.data || orderResponse.data;
                
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
            
            clearCart();
            sessionStorage.removeItem('currentOrderNumber');
            const pollInterval = sessionStorage.getItem('pollInterval');
            if (pollInterval) {
                clearInterval(parseInt(pollInterval));
                sessionStorage.removeItem('pollInterval');
            }
            
            const shippingCost = shippingInfo ? getShippingCost(shippingInfo.county) : 0;
            
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
            
            localStorage.setItem('lastOrder', JSON.stringify(completeOrderData));
            
            showSuccess('Payment successful! Check your email for order confirmation.', {
                title: 'Order Confirmed',
                duration: 7000,
                action: {
                    label: 'View Order',
                    onClick: () => navigate(`/orders/${orderNum}`)
                }
            });
            
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
        const pollInterval = sessionStorage.getItem('pollInterval');
        if (pollInterval) {
            clearInterval(parseInt(pollInterval));
            sessionStorage.removeItem('pollInterval');
        }
    };

    const calculateTotalWithShipping = () => {
        if (shippingInfo) {
            const shipping = getShippingCost(shippingInfo.county);
            return totalPrice + shipping;
        }
        return totalPrice;
    };

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