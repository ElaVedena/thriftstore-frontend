import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useNotification } from '../../../hooks/useNotification';
import '../../../components/css/ProductActions.css'; 

function ProductActions({ product, onAddToCart }) {
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { showSuccess, showError, showWarning } = useNotification();

    const sizes = useMemo(() => product?.availableSizes || [], [product?.availableSizes]);
   
    const stock = useMemo(() => product?.stock || 0, [product?.stock]);
    const isInStock = useMemo(() => stock > 0, [stock]);
    
    const stockLevel = useMemo(() => {
        if (stock <= 2) return 'critical-stock';
        if (stock <= 5) return 'low-stock';
        return '';
    }, [stock]);
    
    const isLiked = useMemo(() => isInWishlist(product?.id), [isInWishlist, product?.id]);

    // Set default size if only one size available
    useEffect(() => {
        if (sizes.length === 1) {
            setSelectedSize(sizes[0]);
        }
    }, [sizes]);

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= stock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        // Validate product exists
        if (!product || !product.id) {
            showError('Invalid product');
            return;
        }

        // Check if product is in stock
        if (!isInStock) {
            showWarning('This product is out of stock');
            return;
        }

        // Check if size is required and selected
        if (sizes.length > 0 && !selectedSize) {
            showWarning('Please select a size');
            return;
        }

        setIsAdding(true);

        try {
            const cartItem = {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: quantity,
                size: selectedSize || 'One Size',
                imageUrl: product.images?.[0],
                stock: stock
            };

            await addToCart(cartItem);
            showSuccess('Product added to cart successfully!');
            
        } catch (error) {
            console.error('Failed to add to cart:', error);
            showError('Failed to add product to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggleWishlist = async () => {
        try {
            if (isLiked) {
                await removeFromWishlist(product.id);
                showSuccess('Removed from wishlist');
            } else {
                await addToWishlist(product);
                showSuccess('Added to wishlist');
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
            showError('Failed to update wishlist');
        }
    };

    return (
        <div className="product-actions">
            {/* Size Selection */}
            {sizes.length > 0 && (
                <div className="size-selector">
                    <label>Select Size:</label>
                    <div className="size-options">
                        {sizes.map(size => (
                            <button
                                key={size}
                                type="button"
                                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                onClick={() => setSelectedSize(size)}
                                disabled={!isInStock}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity Selector - Only show if in stock */}
            {isInStock && (
                <div className="quantity-selector">
                    <label>Quantity:</label>
                    <div className="quantity-controls-wrapper">
                        <div className="quantity-controls">
                            <button 
                                type="button"
                                onClick={() => handleQuantityChange(-1)}
                                className="quantity-btn"
                                disabled={quantity <= 1 || isAdding}
                            >
                                -
                            </button>
                            <span className="quantity-display">{quantity}</span>
                            <button 
                                type="button"
                                onClick={() => handleQuantityChange(1)}
                                className="quantity-btn"
                                disabled={quantity >= stock || isAdding}
                            >
                                +
                            </button>
                        </div>
                        
                        {/* Stock info */}
                        <div className={`stock-info ${stockLevel}`}>
                            <i className="fas fa-check-circle"></i>
                            <span>{stock} available</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
                {isInStock ? (
                    <button 
                        type="button"
                        onClick={handleAddToCart}
                        className="add-to-cart-btn"
                        disabled={isAdding}
                    >
                        {isAdding ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Adding...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-shopping-cart"></i>
                                Add to Cart
                            </>
                        )}
                    </button>
                ) : (
                    <div className="out-of-stock-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>Out of Stock</span>
                    </div>
                )}
                
                {/* Wishlist button */}
                <button 
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                    disabled={isAdding}
                    aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <i className={`fa${isLiked ? 's' : 'r'} fa-heart`}></i>
                </button>
            </div>
        </div>
    );
}

export default ProductActions;