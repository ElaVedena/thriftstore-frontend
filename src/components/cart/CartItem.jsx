import { Link } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import CloudinaryImage from '../common/CloudinaryImage';
import '../../components/css/CartItem.css';

function CartItem({ item, onUpdateQuantity, onRemove }) {
    const { showSuccess } = useNotification();

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        const maxStock = item.stock || 10;
        
        if (newQuantity >= 1 && newQuantity <= maxStock) {
            onUpdateQuantity(item.productId, item.size, newQuantity);
            showSuccess('Quantity updated', { duration: 1500 });
        }
    };

    const handleRemove = () => {
        onRemove(item.productId, item.size);
    };

    // Get image URL 
    const imageUrl = item.imageUrl || '/placeholder-image.jpg';
    const maxStock = item.stock || 10;
    const isLowStock = maxStock < 5;

    // Generate quantity options based on available stock 
    const quantityOptions = [];
    const maxSelectable = Math.min(maxStock, 10);
    for (let i = 1; i <= maxSelectable; i++) {
        quantityOptions.push(i);
    }

    return (
        <div className="cart-item">
            <div className="cart-item-image">
                <Link to={`/product/${item.productId}`}>
                    <CloudinaryImage
                        src={imageUrl}
                        alt={item.productName}
                        width={100}
                        height={100}
                        crop="fill"
                        gravity="auto"
                        quality="auto"
                        format="auto"
                        className="cart-product-image"
                    />
                </Link>
            </div>

            <div className="cart-item-details">
                <div className="cart-item-header">
                    <Link to={`/product/${item.productId}`} className="cart-item-title">
                        <h3>{item.productName}</h3>
                    </Link>
                    <button 
                        className="remove-item-btn"
                        onClick={handleRemove}
                        aria-label="Remove item"
                        title="Remove from cart"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {item.brand && (
                    <span className="cart-item-brand">{item.brand}</span>
                )}

                <div className="cart-item-variants">
                    {item.size && (
                        <span className="item-size">Size: {item.size}</span>
                    )}
                    {item.condition && (
                        <span className="item-condition">{item.condition}</span>
                    )}
                </div>

                <div className="cart-item-price">
                    <span className="item-price">KSh {item.price?.toFixed(2) || '0.00'}</span>
                    {item.originalPrice && (
                        <span className="item-original-price">KSh {item.originalPrice?.toFixed(2)}</span>
                    )}
                    {isLowStock && (
                        <span className="low-stock-warning">Only {maxStock} left in stock!</span>
                    )}
                </div>

                <div className="cart-item-actions">
                    <div className="quantity-control">
                        <label htmlFor={`quantity-${item.productId}-${item.size}`}>
                            Qty:
                        </label>
                        <select
                            id={`quantity-${item.productId}-${item.size}`}
                            value={item.quantity || 1}
                            onChange={handleQuantityChange}
                            className="quantity-select"
                            aria-label="Select quantity"
                            disabled={maxStock === 0}
                        >
                            {quantityOptions.map(num => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>

                    <span className="item-total">
                        KSh {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default CartItem;