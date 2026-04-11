import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useNotification } from '../hooks/useNotification';
import WishlistItem from '../components/wishlist/WishlistItem';
import '../components/css/Wishlist.css';

function Wishlist() {
    const { wishlistItems, isLoading, error, clearWishlist, refreshWishlist } = useWishlist();
    const { showSuccess, showInfo, showWarning, showError } = useNotification();

    const handleClearWishlist = async () => {
        if (wishlistItems.length > 0) {
            try {
                await clearWishlist();
                showInfo('Wishlist cleared successfully', { duration: 3000 });
            } catch (error) {
                showError('Failed to clear wishlist');
            }
        }
    };

    const handleItemRemoved = (itemName) => {
        showWarning(`${itemName} removed from wishlist`);
        // Don't refresh here - let the context handle it
    };

    const handleItemAddedToCart = (itemName) => {
        // Only show one notification - remove the duplicate from WishlistItem
        showSuccess(`${itemName} added to cart!`, {
            action: {
                label: 'View Cart',
                onClick: () => window.location.href = '/cart'
            }
        });
    };

    const handleRetry = () => {
        refreshWishlist();
    };

    if (isLoading) {
        return (
            <div className="wishlist-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading your wishlist...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="wishlist-error">
                <i className="fas fa-exclamation-circle"></i>
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <button onClick={handleRetry} className="retry-btn">
                    Try Again
                </button>
                <Link to="/shop" className="shop-now-btn">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    if (!wishlistItems || wishlistItems.length === 0) {
        return (
            <div className="empty-wishlist">
                <i className="fas fa-heart-broken"></i>
                <h2>Your Wishlist is Empty</h2>
                <p>Save items you love to your wishlist and they'll appear here</p>
                <Link to="/shop" className="shop-now-btn">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="wishlist-header">
                <div className="header-left">
                    <h1>My Wishlist</h1>
                    <span className="item-count">
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                    </span>
                </div>
                <button 
                    onClick={handleClearWishlist} 
                    className="clear-wishlist-btn"
                    disabled={wishlistItems.length === 0}
                >
                    <i className="fas fa-trash"></i>
                    Clear Wishlist
                </button>
            </div>

            <div className="wishlist-grid">
                {wishlistItems.map(item => {
                    const mappedItem = {
                        id: item.productId || item.id,
                        productId: item.productId || item.id,
                        name: item.productName || item.name,
                        productName: item.productName || item.name,
                        price: item.price,
                        image: item.imageUrl || item.image,
                        imageUrl: item.imageUrl || item.image,
                        brand: item.brand,
                        condition: item.condition,
                        size: item.size,
                        inStock: item.stock > 0 || item.inStock === true,
                        stock: item.stock || 0
                    };
                    
                    return (
                        <WishlistItem 
                            key={mappedItem.id}
                            item={mappedItem}
                            onRemove={() => handleItemRemoved(mappedItem.name)}
                            onAddToCart={() => handleItemAddedToCart(mappedItem.name)}
                        />
                    );
                })}
            </div>

            <div className="wishlist-footer">
                <Link to="/shop" className="continue-shopping-link">
                    <i className="fas fa-arrow-left"></i>
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default Wishlist;