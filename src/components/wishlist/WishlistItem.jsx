import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../hooks/useNotification';
import '../../components/css/WishlistItem.css';

function WishlistItem({ item, onRemove, onAddToCart }) {
    const { removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { showSuccess, showError } = useNotification();

    const handleRemove = async () => {
        try {
            await removeFromWishlist(item.productId || item.id, item.name);
            if (onRemove) onRemove(item.name);
        } catch (error) {
            showError('Failed to remove item');
        }
    };

    const handleAddToCart = () => {
        const cartItem = {
            id: item.productId || item.id,
            name: item.name,
            price: item.price,
            image: item.imageUrl || item.image,
            quantity: 1,
            selectedSize: item.size || 'One Size'
        };
        
        addToCart(cartItem);
        if (onAddToCart) onAddToCart(item.name);
        showSuccess(`${item.name} added to cart!`);
    };

    const formatPrice = (price) => {
        if (!price) return 'KSh 0.00';
        return `KSh ${Number(price).toFixed(2)}`;
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = '/placeholder-image.jpg';
    };

    const imageUrl = item.imageUrl || item.image || '/placeholder-image.jpg';

    return (
        <div className="wishlist-item">
            <button onClick={handleRemove} className="remove-btn" title="Remove from wishlist">
                <i className="fas fa-times"></i>
            </button>

            <Link to={`/product/${item.productId || item.id}`} className="item-link">
                <div className="item-image">
                    <img 
                        src={imageUrl} 
                        alt={item.name}
                        onError={handleImageError}
                    />
                </div>

                <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    
                    {item.brand && (
                        <span className="item-brand">{item.brand}</span>
                    )}
                    
                    <div className="item-price">
                        <span className="current-price">{formatPrice(item.price)}</span>
                        {item.originalPrice && (
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
                    </div>
                </div>
            </Link>

            <div className="item-actions">
                <button onClick={handleAddToCart} className="add-to-cart-btn">
                    <i className="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>

                {item.inStock ? (
                    <span className="in-stock">
                        <i className="fas fa-check-circle"></i>
                        In Stock
                    </span>
                ) : (
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