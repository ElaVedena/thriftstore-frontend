import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../components/css/CartSummary.css';

function CartSummary({ totalItems, subtotal }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    const formatPrice = (price) => {
        return `KSh ${price.toFixed(2)}`;
    };

    const handleCheckout = () => {
        if (isAuthenticated) {
            navigate('/checkout');
        } else {
            // Save current cart and redirect to login
            navigate('/login?redirect=checkout');
        }
    };

    return (
        <div className="cart-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(subtotal)}</span>
            </div>
            
            <div className="summary-total">
                <span>Total</span>
                <span className="total-price">{formatPrice(subtotal)}</span>
            </div>

            <p className="shipping-note">
                <i className="fas fa-truck"></i>
                Shipping cost will be calculated at checkout
            </p>

            <button onClick={handleCheckout} className="checkout-btn">
                Proceed to Checkout
            </button>

            <div className="payment-icons">
                <i className="fas fa-mobile-alt"></i> M-Pesa
            </div>

            <p className="secure-checkout">
                <i className="fas fa-lock"></i>
                Secure Checkout
            </p>
            
            {!isAuthenticated && (
                <p className="login-prompt">
                    <i className="fas fa-info-circle"></i>
                    You'll need to log in to complete your purchase
                </p>
            )}
        </div>
    );
}

export default CartSummary;