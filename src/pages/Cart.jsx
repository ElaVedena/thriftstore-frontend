import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../hooks/useNotification';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import '../components/css/Cart.css';

function Cart() {
    const { 
        cartItems, 
        totalItems, 
        totalPrice, 
        isCartLoading,
        updateQuantity, 
        removeFromCart,
        clearCart 
    } = useCart();
    const { isLoading: isAuthLoading } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useNotification();

    // Log cart data
    console.log('========== CART DEBUG ==========');
    console.log('cartItems:', cartItems);
    console.log('cartItems length:', cartItems?.length);
    console.log('totalItems:', totalItems);
    console.log('totalPrice:', totalPrice);
    console.log('isCartLoading:', isCartLoading);
    
    if (cartItems && cartItems.length > 0) {
        console.log('First item structure:', JSON.stringify(cartItems[0], null, 2));
    } else {
        console.log('cartItems is empty or undefined');
    }
    console.log('================================');

    const handleUpdateQuantity = (productId, size, quantity) => {
        try {
            updateQuantity(productId, size, quantity);
            showSuccess('Cart updated successfully', { duration: 2000 });
        } catch (error) {
            showError('Failed to update cart');
        }
    };

    const handleRemoveItem = (item) => {
        try {
            removeFromCart(item.productId, item.size);
            showWarning(`${item.productName} removed from cart`, {
                action: {
                    label: 'Undo',
                    onClick: () => {
                        showInfo('Undo feature coming soon');
                    }
                }
            });
        } catch (error) {
            showError('Failed to remove item');
        }
    };

    const handleClearCart = () => {
        if (cartItems.length > 0) {
            clearCart();
            showInfo('Cart cleared successfully', { duration: 3000 });
        }
    };

    // Show loading while either auth or cart is loading
    if (isAuthLoading || isCartLoading) {
        return (
            <div className="cart-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading your cart...</p>
            </div>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="empty-cart">
                <div className="empty-cart-content">
                    <i className="fas fa-shopping-cart"></i>
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <Link to="/shop" className="continue-shopping-btn">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>
                <button onClick={handleClearCart} className="clear-cart-btn">
                    <i className="fas fa-trash"></i>
                    Clear Cart
                </button>
            </div>

            <div className="cart-content">
                <div className="cart-items">
                    {cartItems.map((item) => (
                        <CartItem
                            key={`${item.productId}-${item.size}`}
                            item={item}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemove={() => handleRemoveItem(item)}
                        />
                    ))}
                </div>

                <div className="cart-summary-container">
                    <CartSummary
                        totalItems={totalItems}
                        subtotal={totalPrice}
                        shipping={totalPrice >= 50 ? 0 : 5.99}
                        tax={totalPrice * 0.08}
                    />
                </div>
            </div>

            <div className="cart-actions">
                <Link to="/shop" className="continue-shopping-link">
                    <i className="fas fa-arrow-left"></i>
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default Cart;