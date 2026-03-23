import { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';
import { useNotification } from '../hooks/useNotification';

const CartContext = createContext();

const initialState = {
    items: [],
    totalItems: 0,
    totalPrice: 0
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            // Check if item exists using productId and size
            const existingItemIndex = state.items.findIndex(
                item => item.productId === action.payload.productId && 
                       item.size === action.payload.size
            );

            let updatedItems;
            if (existingItemIndex >= 0) {
                updatedItems = state.items.map((item, index) => {
                    if (index === existingItemIndex) {
                        return {
                            ...item,
                            quantity: item.quantity + action.payload.quantity
                        };
                    }
                    return item;
                });
            } else {
                // Add new item with backendcompatible structure
                updatedItems = [...state.items, {
                    productId: action.payload.productId,
                    productName: action.payload.productName,
                    price: action.payload.price,
                    quantity: action.payload.quantity,
                    size: action.payload.size,
                    imageUrl: action.payload.imageUrl,
                    stock: action.payload.stock || 999 
                }];
            }

            return {
                ...state,
                items: updatedItems,
                totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
                totalPrice: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
        }

        case 'UPDATE_QUANTITY': {
            // First update all items with the new quantity
            const updatedItems = state.items.map(item => {
                if (item.productId === action.payload.productId && 
                    item.size === action.payload.size) {
                    return {
                        ...item,
                        quantity: action.payload.quantity
                    };
                }
                return item;
            });
            
            // Then filter out items with quantity 0 
            const filteredItems = updatedItems.filter(item => item.quantity > 0);

            return {
                ...state,
                items: filteredItems,
                totalItems: filteredItems.reduce((total, item) => total + item.quantity, 0),
                totalPrice: filteredItems.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
        }

        case 'REMOVE_ITEM': {
            const updatedItems = state.items.filter(
                item => !(item.productId === action.payload.productId && 
                         item.size === action.payload.size)
            );

            return {
                ...state,
                items: updatedItems,
                totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
                totalPrice: updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
        }

        case 'CLEAR_CART':
            return initialState;

        case 'LOAD_CART': {
            console.log('LOAD_CART payload:', action.payload);
            
            // Handle nested cart structure from backend
            const cartData = action.payload.cart || action.payload;
            const items = cartData.items || [];
            
            console.log('Extracted items:', items);
            
            const formattedItems = items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                imageUrl: item.imageUrl,
                stock: item.stock || 999 
            }));

            // Don't update if the items are the same 
            if (JSON.stringify(state.items) === JSON.stringify(formattedItems)) {
                console.log('Items unchanged, skipping LOAD_CART');
                return state;
            }

            return {
                ...state,
                items: formattedItems,
                totalItems: formattedItems.reduce((total, item) => total + item.quantity, 0),
                totalPrice: formattedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
        }

        case 'MERGE_CART': {
            const guestItems = action.payload;
            const existingItems = state.items;
            
            const mergedItems = [...existingItems];
            
            guestItems.forEach(guestItem => {
                const existingIndex = mergedItems.findIndex(
                    item => item.productId === guestItem.productId && 
                           item.size === guestItem.size
                );
                
                if (existingIndex >= 0) {
                    mergedItems[existingIndex] = {
                        ...mergedItems[existingIndex],
                        quantity: mergedItems[existingIndex].quantity + guestItem.quantity,
                        stock: guestItem.stock || mergedItems[existingIndex].stock
                    };
                } else {
                    mergedItems.push({
                        productId: guestItem.productId,
                        productName: guestItem.productName,
                        price: guestItem.price,
                        quantity: guestItem.quantity,
                        size: guestItem.size,
                        imageUrl: guestItem.imageUrl,
                        stock: guestItem.stock || 999
                    });
                }
            });

            return {
                ...state,
                items: mergedItems,
                totalItems: mergedItems.reduce((total, item) => total + item.quantity, 0),
                totalPrice: mergedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
            };
        }

        default:
            return state;
    }
};

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const [isCartLoading, setIsCartLoading] = useState(true);
    const [cartError, setCartError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { showError, showWarning, showSuccess, showInfo } = useNotification();
    
    // Use ref to track if this is the initial load
    const isInitialLoad = useRef(true);
    // Use ref to store last synced state to prevent unnecessary syncs
    const lastSyncedState = useRef('');
    // Add ref to track if a sync is in progress
    const isSyncing = useRef(false);
    // Add ref to track pending updates
    const pendingUpdate = useRef(null);
    // Add ref to track last update time to throttle
    const lastUpdateTime = useRef(0);
    // Add ref to track whether cart was just cleared
    const justCleared = useRef(false);

    // Load cart based on user authentication status
    useEffect(() => {
        const loadCart = async () => {
            if (isAuthLoading) return;
            
            setIsCartLoading(true);
            setCartError(null);
            
            if (isAuthenticated && user) {
                try {
                    // Load cart from backend
                    const response = await cartService.getCart();
                    
                    if (response.success) {
                        console.log('Cart data received:', response.data);
                        
                        // Only dispatch if data is different from current state
                        const currentStateString = JSON.stringify(state.items);
                        const cartData = response.data.cart || response.data;
                        const newItems = cartData.items || [];
                        
                        if (JSON.stringify(newItems) !== currentStateString) {
                            dispatch({ type: 'LOAD_CART', payload: response.data });
                        }
                        
                        // Update last synced state after loading
                        lastSyncedState.current = JSON.stringify(newItems);
                        
                        // Check for guest cart to merge
                        const guestCart = localStorage.getItem('guest_cart');
                        if (guestCart) {
                            try {
                                const parsedGuestCart = JSON.parse(guestCart);
                                if (parsedGuestCart.items?.length > 0) {
                                    showInfo('Merging your guest cart with your account...', {
                                        duration: 3000
                                    });
                                    // Merge guest cart with backend
                                    const mergeResponse = await cartService.mergeCart(parsedGuestCart.items);
                                    if (mergeResponse.success) {
                                        // Reload cart after merge
                                        const updatedCart = await cartService.getCart();
                                        if (updatedCart.success) {
                                            const updatedCartData = updatedCart.data.cart || updatedCart.data;
                                            const updatedItems = updatedCartData.items || [];
                                            
                                            if (JSON.stringify(updatedItems) !== JSON.stringify(newItems)) {
                                                dispatch({ type: 'LOAD_CART', payload: updatedCart.data });
                                            }
                                            lastSyncedState.current = JSON.stringify(updatedItems);
                                            
                                            showSuccess('Cart merged successfully!', {
                                                duration: 3000
                                            });
                                        }
                                    }
                                    localStorage.removeItem('guest_cart');
                                }
                            } catch (error) {
                                console.error('Failed to merge guest cart:', error);
                                showError('Failed to merge guest cart. Please try again.');
                            }
                        }
                    } else {
                        // If backend fails try to load guest cart as fallback
                        console.warn('Backend cart failed, checking guest cart:', response.message);
                        const guestCart = localStorage.getItem('guest_cart');
                        if (guestCart) {
                            try {
                                const parsedCart = JSON.parse(guestCart);
                                dispatch({ type: 'LOAD_CART', payload: parsedCart });
                                showWarning('Using your guest cart. Sign in to sync with your account.', {
                                    duration: 5000
                                });
                            } catch (error) {
                                console.error('Failed to load guest cart:', error);
                            }
                        }
                        setCartError(response.message);
                    }
                } catch (error) {
                    console.error('Cart loading error:', error);
                    setCartError('Failed to load your cart');
                    showError('Failed to load your cart. Please refresh the page.', {
                        duration: 5000
                    });
                    
                    // Fallback to guest cart
                    const guestCart = localStorage.getItem('guest_cart');
                    if (guestCart) {
                        try {
                            const parsedCart = JSON.parse(guestCart);
                            dispatch({ type: 'LOAD_CART', payload: parsedCart });
                        } catch (e) {
                            console.error('Failed to load guest cart:', e);
                        }
                    }
                }
            } else {
                // Load guest cart from localStorage
                const guestCart = localStorage.getItem('guest_cart');
                if (guestCart) {
                    try {
                        const parsedCart = JSON.parse(guestCart);
                        dispatch({ type: 'LOAD_CART', payload: parsedCart });
                    } catch (error) {
                        console.error('Failed to load guest cart:', error);
                    }
                }
            }
            
            setIsCartLoading(false);
            isInitialLoad.current = false;
            setIsInitialized(true);
        };

        loadCart();
    }, [isAuthenticated, user, isAuthLoading, showError, showWarning, showSuccess, showInfo]);

    // Save cart to localStorage for guests, sync with backend for authenticated users
    useEffect(() => {
        if (isCartLoading || isAuthLoading || isInitialLoad.current || !isInitialized) return;
        
        // Don't sync if there's an error
        if (cartError) return;
        
        if (isAuthenticated && user) {
            // Only sync if items have actually changed
            const currentStateString = JSON.stringify(state.items);
            
            // Skip sync if state hasn't changed
            if (currentStateString === lastSyncedState.current) {
                return;
            }
            
            // Don't sync empty carts unless they were explicitly cleared by user
            if (state.items.length === 0 && lastSyncedState.current !== '[]' && !justCleared.current) {
                
                console.log('Skipping empty cart sync - trusting backend');
                return;
            }
            
            // Reset justCleared flag
            if (justCleared.current) {
                justCleared.current = false;
            }
            
            // Throttle updates 
            const now = Date.now();
            if (now - lastUpdateTime.current < 2000) {
                console.log('Throttling sync - too frequent');
                return;
            }
            
            // Cancel any pending sync
            if (pendingUpdate.current) {
                clearTimeout(pendingUpdate.current);
            }
            
            // Sync with backend (debounced to avoid too many requests)
            pendingUpdate.current = setTimeout(async () => {
                // Skip if already syncing
                if (isSyncing.current) {
                    console.log('Sync already in progress, skipping');
                    return;
                }
                
                isSyncing.current = true;
                lastUpdateTime.current = Date.now();
                
                try {
                    console.log('Syncing cart with backend:', state.items);
                    const response = await cartService.updateCart(state.items);
                    if (response.success) {
                        // Update last synced state on success
                        lastSyncedState.current = currentStateString;
                        console.log('Cart synced successfully');
                    } else {
                        console.error('Cart sync failed:', response.message);
                    }
                } catch (error) {
                    console.error('Failed to sync cart with backend:', error);
                } finally {
                    isSyncing.current = false;
                    pendingUpdate.current = null;
                }
            }, 3000); 
            
            return () => {
                if (pendingUpdate.current) {
                    clearTimeout(pendingUpdate.current);
                }
            };
        } else {
            // Save to guest cart in localStorage
            localStorage.setItem('guest_cart', JSON.stringify(state));
        }
    }, [state, isAuthenticated, user, isCartLoading, isAuthLoading, cartError, isInitialized]);

    const addToCart = useCallback(async (product) => {
        // Check if product has stock and if adding would exceed available stock
        if (product.stock !== undefined && product.stock <= 0) {
            showError('This product is out of stock');
            return;
        }
        
        // Check if adding this quantity would exceed available stock
        const existingItem = state.items.find(
            item => item.productId === product.productId && item.size === (product.size || 'One Size')
        );
        
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const totalRequested = currentQuantity + (product.quantity || 1);
        const availableStock = product.stock || 999;
        
        if (totalRequested > availableStock) {
            showError(`Only ${availableStock} items available in stock. You already have ${currentQuantity} in your cart.`);
            return;
        }
        
        const cartItem = {
            productId: product.productId || product.id,
            productName: product.productName || product.name,
            price: product.price,
            quantity: product.quantity || 1,
            size: product.size || product.selectedSize || 'One Size',
            imageUrl: product.imageUrl || product.image || product.images?.[0],
            stock: product.stock
        };
        
        // Store current state for potential rollback
        const previousItems = [...state.items];
        
        // Optimistic update
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        
        if (isAuthenticated && user) {
            try {
                const response = await cartService.addToCart(cartItem);
                if (!response.success) {
                    // Rollback on failure
                    dispatch({ type: 'LOAD_CART', payload: { items: previousItems } });
                    showError(response.message || 'Failed to add item to cart');
                } else {
                    showSuccess('Item added to cart!', { duration: 2000 });
                }
            } catch (error) {
                console.error('Failed to add item to cart:', error);
                // Rollback on error
                dispatch({ type: 'LOAD_CART', payload: { items: previousItems } });
                showError('Failed to add item to cart. Please try again.');
            }
        } else {
            showSuccess('Item added to cart!', { duration: 2000 });
        }
    }, [isAuthenticated, user, showError, showSuccess, state.items]);

    const updateQuantity = useCallback(async (productId, size, quantity) => {
        // Find the item to check stock
        const item = state.items.find(
            item => item.productId === productId && item.size === size
        );
        
        // Check if requested quantity exceeds available stock
        if (item && item.stock && quantity > item.stock) {
            showError(`Only ${item.stock} items available in stock.`);
            return;
        }
        
        // Store current state for potential rollback
        const previousItems = [...state.items];
        
        // Optimistic update - update UI immediately
        dispatch({ 
            type: 'UPDATE_QUANTITY', 
            payload: { productId, size, quantity } 
        });
        
        if (isAuthenticated && user) {
            try {
                // Send to backend
                const response = await cartService.updateItemQuantity(productId, size, quantity);
                
                if (!response.success) {
                    // If backend fails, revert the optimistic update
                    dispatch({ 
                        type: 'LOAD_CART', 
                        payload: { items: previousItems } 
                    });
                    showError(response.message || 'Failed to update cart');
                }
                // On success, do nothing the optimistic update is already correct
            } catch (error) {
                console.error('Failed to update cart:', error);
                
                // Revert optimistic update on error
                dispatch({ 
                    type: 'LOAD_CART', 
                    payload: { items: previousItems } 
                });
                showError('Failed to update cart. Please try again.');
            }
        }
    }, [isAuthenticated, user, showError, state.items]);

    const removeFromCart = useCallback(async (productId, size) => {
        // Store current state for potential rollback
        const previousItems = [...state.items];
        
        dispatch({ 
            type: 'REMOVE_ITEM', 
            payload: { productId, size } 
        });
        
        if (isAuthenticated && user) {
            try {
                const response = await cartService.removeFromCart(productId, size);
                
                if (!response.success) {
                    // Revert on failure
                    dispatch({ 
                        type: 'LOAD_CART', 
                        payload: { items: previousItems } 
                    });
                    showError(response.message || 'Failed to remove item');
                } else {
                    showInfo('Item removed from cart', { duration: 1500 });
                }
            } catch (error) {
                console.error('Failed to remove item:', error);
                
                // Revert on error
                dispatch({ 
                    type: 'LOAD_CART', 
                    payload: { items: previousItems } 
                });
                showError('Failed to remove item. Please try again.');
            }
        } else {
            showInfo('Item removed from cart', { duration: 1500 });
        }
    }, [isAuthenticated, user, showError, showInfo, state.items]);

    const clearCart = useCallback(async () => {
        // Store previous state for potential rollback
        const previousItems = [...state.items];
        
        dispatch({ type: 'CLEAR_CART' });
        justCleared.current = true;
        
        if (isAuthenticated && user) {
            try {
                const response = await cartService.clearCart();
                if (response.success) {
                    // Update last synced state after clearing
                    lastSyncedState.current = '[]';
                    showInfo('Cart cleared', { duration: 2000 });
                } else {
                    // Revert on failure
                    dispatch({ type: 'LOAD_CART', payload: { items: previousItems } });
                    showError(response.message || 'Failed to clear cart');
                }
            } catch (error) {
                console.error('Failed to clear cart:', error);
                // Revert on error
                dispatch({ type: 'LOAD_CART', payload: { items: previousItems } });
                showError('Failed to clear cart. Please try again.');
            }
        } else {
            localStorage.removeItem('guest_cart');
            showInfo('Cart cleared', { duration: 2000 });
        }
    }, [isAuthenticated, user, showError, showInfo, state.items]);

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated || !user) return;
        
        setIsCartLoading(true);
        try {
            const response = await cartService.getCart();
            if (response.success) {
                // Only dispatch if data is different
                const currentStateString = JSON.stringify(state.items);
                const cartData = response.data.cart || response.data;
                const newItems = cartData.items || [];
                
                if (JSON.stringify(newItems) !== currentStateString) {
                    dispatch({ type: 'LOAD_CART', payload: response.data });
                }
                lastSyncedState.current = JSON.stringify(newItems);
                showSuccess('Cart refreshed!', { duration: 1500 });
            } else {
                showError(response.message || 'Failed to refresh cart');
            }
        } catch (error) {
            console.error('Failed to refresh cart:', error);
            showError('Failed to refresh cart. Please try again.');
        } finally {
            setIsCartLoading(false);
        }
    }, [isAuthenticated, user, state.items, showError, showSuccess]);

    const value = {
        cartItems: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        isCartLoading,
        cartError,
        isInitialized,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}