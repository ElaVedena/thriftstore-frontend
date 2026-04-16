import { useCart } from '../../context/CartContext';
import '../../components/css/OrderSummary.css';

function OrderSummary({ selectedCounty }) {
    const { cartItems, totalPrice } = useCart();

    // TESTING SHIPPING COSTS - All counties between 1-5 shillings
    const getShippingCost = (county) => {
        if (!county) return 0;
        
        // For testing purposes, return random shipping between 1-5 shillings
        // Using county name to determine consistent shipping for same county
        const countyHash = county.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const shippingAmount = (countyHash % 5) + 1; // Returns 1, 2, 3, 4, or 5
        
        return shippingAmount;
    };

    const shipping = selectedCounty ? getShippingCost(selectedCounty) : 0;
    const total = totalPrice + shipping;

    const formatPrice = (price) => {
        return `KSh ${price.toFixed(2)}`;
    };

    return (
        <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
                {cartItems.map((item, index) => (
                    <div key={`${item.productId || item.id}-${item.size || item.selectedSize}-${index}`} className="summary-item">
                        <div className="item-image">
                            <img src={item.imageUrl || item.image} alt={item.productName || item.name} />
                            <span className="item-quantity">{item.quantity}</span>
                        </div>
                        <div className="item-details">
                            <h4>{item.productName || item.name}</h4>
                            {(item.size || item.selectedSize) && (
                                <span className="item-size">Size: {item.size || item.selectedSize}</span>
                            )}
                        </div>
                        <div className="item-price">
                            {formatPrice((item.price || 0) * (item.quantity || 1))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="summary-totals">
                <div className="total-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="total-row">
                    <span>Shipping</span>
                    {selectedCounty ? (
                        <span>{formatPrice(shipping)}</span>
                    ) : (
                        <span className="shipping-pending">Select county to calculate</span>
                    )}
                </div>

                <div className="total-row grand-total">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>

            {!selectedCounty && (
                <div className="shipping-notice">
                    <i className="fas fa-info-circle"></i>
                    <span>Please select your county to calculate shipping cost</span>
                </div>
            )}

            {selectedCounty && (
                <div className="shipping-detail">
                    <i className="fas fa-truck"></i>
                    <small>
                        Shipping to <strong>{selectedCounty}</strong>: {formatPrice(shipping)}
                    </small>
                </div>
            )}
        </div>
    );
}

export default OrderSummary;