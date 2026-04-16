 import { useCart } from '../../context/CartContext';
import '../../components/css/OrderSummary.css';

function OrderSummary({ selectedCounty }) {
    const { cartItems, totalPrice } = useCart();

    // Shipping costs based on county 
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