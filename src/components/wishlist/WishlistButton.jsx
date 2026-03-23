import { useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../components/css/WishlistButton.css';

function WishlistButton({ product }) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const inWishlist = isInWishlist(product.id);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }

        setIsLoading(true);
        try {
            if (inWishlist) {
                await removeFromWishlist(product.id);
            } else {
                await addToWishlist(product);
            }
        } catch (error) {
            console.error('Failed to update wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            className={`wishlist-btn ${inWishlist ? 'liked' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={handleClick}
            disabled={isLoading}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
            ) : (
                <i className={`fa${inWishlist ? 's' : 'r'} fa-heart`}></i>
            )}
        </button>
    );
}

export default WishlistButton;