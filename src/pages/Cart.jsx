import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
            clearCart(); // Notification is handled inside clearCart in CartContext
            // Removed duplicate showInfo here
        }
    };

    // Generate cart-specific SEO data
    const getCartTitle = () => {
        if (cartItems && cartItems.length > 0) {
            return `Shopping Cart (${totalItems} items) | VedaThrifts`;
        }
        return 'Shopping Cart | VedaThrifts';
    };

    const getCartDescription = () => {
        if (cartItems && cartItems.length > 0) {
            return `Your cart contains ${totalItems} ${totalItems === 1 ? 'item' : 'items'} totaling KES ${totalPrice?.toFixed(2) || 0}. Review your items and proceed to checkout for sustainable fashion from VedaThrifts.`;
        }
        return 'Your shopping cart is empty. Start adding quality secondhand fashion, vintage clothing, and sustainable style from VedaThrifts.';
    };

    // Show loading while either auth or cart is loading
    if (isAuthLoading || isCartLoading) {
        return (
            <>
                <Helmet>
                    <title>Loading Cart | VedaThrifts</title>
                    <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <div className="cart-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading your cart...</p>
                </div>
            </>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <>
                <Helmet>
                    <title>Empty Cart | VedaThrifts</title>
                    <meta name="description" content="Your shopping cart is empty. Start adding quality secondhand fashion, vintage clothing, and sustainable style from VedaThrifts." />
                    <meta name="robots" content="noindex, follow" />
                    
                    {/* Open Graph / Facebook / WhatsApp */}
                    <meta property="og:title" content="Empty Cart | VedaThrifts" />
                    <meta property="og:description" content="Your shopping cart is empty. Start adding quality secondhand fashion, vintage clothing, and sustainable style from VedaThrifts." />
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content="https://vedathrifts.com/cart" />
                    <meta property="og:image" content="https://vedathrifts.com/og-image-cart.jpg" />
                    <meta property="og:site_name" content="VedaThrifts" />
                    <meta property="og:locale" content="en_KE" />
                    
                    {/* Twitter Card */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="Empty Cart | VedaThrifts" />
                    <meta name="twitter:description" content="Your shopping cart is empty. Start adding quality secondhand fashion, vintage clothing, and sustainable style from VedaThrifts." />
                    <meta name="twitter:image" content="https://vedathrifts.com/og-image-cart.jpg" />
                    
                    {/* Canonical URL */}
                    <link rel="canonical" href="https://vedathrifts.com/cart" />
                </Helmet>
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
            </>
        );
    }

    return (
        <>
            <Helmet>
                {/* Primary SEO */}
                <title>{getCartTitle()}</title>
                <meta name="description" content={getCartDescription()} />
                <meta name="keywords" content="shopping cart, VedaThrifts cart, thrift store cart, secondhand fashion cart, checkout" />
                <meta name="author" content="VedaThrifts" />
                <meta name="robots" content="noindex, follow" />
                
                {/* Open Graph / Facebook / WhatsApp */}
                <meta property="og:title" content={getCartTitle()} />
                <meta property="og:description" content={getCartDescription()} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://vedathrifts.com/cart" />
                <meta property="og:image" content="https://vedathrifts.com/og-image-cart.jpg" />
                <meta property="og:image:alt" content="VedaThrifts Shopping Cart" />
                <meta property="og:site_name" content="VedaThrifts" />
                <meta property="og:locale" content="en_KE" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={getCartTitle()} />
                <meta name="twitter:description" content={getCartDescription()} />
                <meta name="twitter:image" content="https://vedathrifts.com/og-image-cart.jpg" />
                
                {/* Canonical URL */}
                <link rel="canonical" href="https://vedathrifts.com/cart" />
                
                {/* Additional meta for cart */}
                <meta name="robots" content="noindex, follow" />
            </Helmet>

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
        </>
    );
}

export default Cart;