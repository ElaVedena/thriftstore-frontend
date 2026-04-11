import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../hooks/useNotification';
import CloudinaryImage from '../common/CloudinaryImage';
import '../../components/css/WishlistItem.css';

function WishlistItem({ item, onRemove, onAddToCart }) {
    const { removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useNotification();

    // Determine stock status from item data
    const isInStock = 
        item.inStock === true || 
        item.inStock === 'true' ||
        item.stock > 0 ||
        item.quantity > 0 ||
        (item.available !== undefined && item.available === true);
    
    const stockQuantity = item.stock || item.quantity || 0;
    const isLowStock = stockQuantity > 0 && stockQuantity <= 3;

    const handleRemove = async () => {
        try {
            await removeFromWishlist(item.productId || item.id, item.name);
            if (onRemove) onRemove(item.name);
        } catch (error) {
            showError('Failed to remove item');
        }
    };

    const handleAddToCart = () => {
        if (!isInStock) {
            showError(`${item.name} is out of stock and cannot be added to cart`);
            return;
        }

        const cartItem = {
            id: item.productId || item.id,
            name: item.name,
            price: item.price,
            image: item.imageUrl || item.image,
            quantity: 1,
            selectedSize: item.size || 'One Size',
            stock: stockQuantity
        };
        
        addToCart(cartItem);
        // Only show one notification - remove the duplicate from parent
        if (onAddToCart) onAddToCart(item.name);
    };

    const formatPrice = (price) => {
        if (!price) return 'KSh 0.00';
        return `KSh ${Number(price).toLocaleString('en-KE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
    };

    const imageUrl = item.imageUrl || item.image || '/placeholder-image.jpg';

    return (
        <div className="wishlist-item">
            <button onClick={handleRemove} className="remove-btn" title="Remove from wishlist">
                <i className="fas fa-times"></i>
            </button>

            <Link to={`/product/${item.productId || item.id}`} className="item-link">
                <div className="item-image">
                    <CloudinaryImage
                        src={imageUrl}
                        alt={item.name}
                        width={120}
                        height={120}
                        crop="scale"
                        quality="auto"
                        format="auto"
                        className="wishlist-img"
                        responsive={true}
                        mobileWidth={200}
                        mobileHeight={200}
                    />
                </div>

                <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    
                    {item.brand && (
                        <span className="item-brand">{item.brand}</span>
                    )}
                    
                    <div className="item-price">
                        <span className="current-price">{formatPrice(item.price)}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <span className="original-price">{formatPrice(item.originalPrice)}</span>
                        )}
                    </div>

                    <div className="item-meta">
                        {item.condition && (
                            <span className="item-condition">{item.condition}</span>
                        )}
                        {item.size && (
                            <span className="item-size">Size: {item.size}</span>
                        )}
                        {isLowStock && isInStock && (
                            <span className="low-stock-badge">
                                <i className="fas fa-exclamation-triangle"></i>
                                Only {stockQuantity} left!
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            <div className="item-actions">
                <button 
                    onClick={handleAddToCart} 
                    className={`add-to-cart-btn ${!isInStock ? 'disabled' : ''}`}
                    disabled={!isInStock}
                >
                    <i className="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>

                {/* Only show one stock status indicator */}
                {!isInStock && (
                    <span className="out-of-stock">
                        <i className="fas fa-times-circle"></i>
                        Out of Stock
                    </span>
                )}
            </div>
        </div>
    );
}

export default WishlistItem;