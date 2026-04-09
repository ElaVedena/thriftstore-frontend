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
            const items = action.payload.items || [];
            
            const formattedItems = items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                imageUrl: item.imageUrl,
                stock: item.stock || 999 
            }));

            // Deep comparison to prevent unnecessary updates
            const currentItemsString = JSON.stringify(state.items);
            const newItemsString = JSON.stringify(formattedItems);
            
            if (currentItemsString === newItemsString) {
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
            const existingItems = [...state.items];
            
            guestItems.forEach(guestItem => {
                const existingIndex = existingItems.findIndex(
                    item => item.productId === guestItem.productId && 
                           item.size === guestItem.size
                );
                
                if (existingIndex >= 0) {
                    existingItems[existingIndex] = {
                        ...existingItems[existingIndex],
                        quantity: existingItems[existingIndex].quantity + guestItem.quantity,
                        stock: guestItem.stock || existingItems[existingIndex].stock
                    };
                } else {
                    existingItems.push({
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
                items: existingItems,
                totalItems: existingItems.reduce((total, item) => total + item.quantity, 0),
                totalPrice: existingItems.reduce((total, item) => total + (item.price * item.quantity), 0)
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
    
    // Use refs to prevent infinite loops
    const isInitialLoad = useRef(true);
    const lastSyncedState = useRef('');
    const isSyncing = useRef(false);
    const pendingUpdate = useRef(null);
    const lastUpdateTime = useRef(0);
    const justCleared = useRef(false);
    const mergeAttempted = useRef(false);
    const isLoadingRef = useRef(false);

    // Load cart based on user authentication status
    useEffect(() => {
        const loadCart = async () => {
            if (isAuthLoading) return;
            if (isLoadingRef.current) return;
            
            isLoadingRef.current = true;
            setIsCartLoading(true);
            
            if (isAuthenticated && user) {
                try {
                    const response = await cartService.getCart();
                    
                    if (response.success) {
                        const cartData = response.data.cart || response.data;
                        const newItems = cartData.items || [];
                        
                        dispatch({ type: 'LOAD_CART', payload: { items: newItems } });
                        lastSyncedState.current = JSON.stringify(newItems);
                        
                        // Check for guest cart to merge (only once)
                        const guestCart = localStorage.getItem('guest_cart');
                        if (guestCart && !mergeAttempted.current) {
                            mergeAttempted.current = true;
                            try {
                                const parsedGuestCart = JSON.parse(guestCart);
                                const guestItems = parsedGuestCart.items || [];
                                
                                if (guestItems.length > 0) {
                                    showInfo('Merging your guest cart with your account...', { duration: 3000 });
                                    
                                    const mergeResponse = await cartService.mergeCart(guestItems);
                                    if (mergeResponse.success) {
                                        // Reload cart after merge
                                        const updatedCart = await cartService.getCart();
                                        if (updatedCart.success) {
                                            const updatedCartData = updatedCart.data.cart || updatedCart.data;
                                            const updatedItems = updatedCartData.items || [];
                                            dispatch({ type: 'LOAD_CART', payload: { items: updatedItems } });
                                            lastSyncedState.current = JSON.stringify(updatedItems);
                                            showSuccess('Guest cart merged successfully!', { duration: 3000 });
                                        }
                                    }
                                    localStorage.removeItem('guest_cart');
                                }
                            } catch (error) {
                                console.error('Failed to merge guest cart:', error);
                            }
                        }
                    } else {
                        console.warn('Backend cart failed:', response.message);
                        setCartError(response.message);
                    }
                } catch (error) {
                    console.error('Cart loading error:', error);
                    setCartError('Failed to load your cart');
                }
            } else {
                // Load guest cart from localStorage
                const guestCartResult = cartService.getGuestCart();
                if (guestCartResult.success && guestCartResult.data.items.length > 0) {
                    dispatch({ type: 'LOAD_CART', payload: { items: guestCartResult.data.items } });
                }
            }
            
            setIsCartLoading(false);
            isLoadingRef.current = false;
            isInitialLoad.current = false;
            setIsInitialized(true);
        };

        loadCart();
    }, [isAuthenticated, user, isAuthLoading]);

    // Save cart to localStorage for guests only (no sync loop)
    useEffect(() => {
        if (isCartLoading || isAuthLoading || isInitialLoad.current || !isInitialized) return;
        if (cartError) return;
        
        // Only save for guests (not authenticated)
        if (!isAuthenticated) {
            cartService.saveGuestCart(state.items);
        }
    }, [state.items, isAuthenticated, isCartLoading, isAuthLoading, cartError, isInitialized]);

    const addToCart = useCallback(async (product) => {
        const cartItem = {
            productId: product.productId || product.id,
            productName: product.productName || product.name,
            price: product.price,
            quantity: product.quantity || 1,
            size: product.size || product.selectedSize || 'One Size',
            imageUrl: product.imageUrl || product.image || product.images?.[0],
            stock: product.stock
        };
        
        // Optimistic update - update UI immediately
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        
        // Show success message immediately
        showSuccess('Item added to cart!', { duration: 2000 });
        
        // Sync with backend in background (don't reload products)
        if (isAuthenticated && user) {
            try {
                // Don't wait for response or refresh cart - just sync in background
                await cartService.addToCart(cartItem);
                // No cart refresh here - prevents product reload
            } catch (error) {
                console.error('Failed to sync cart with backend:', error);
                // Don't show error to user since optimistic update already succeeded
                // Just log it for debugging
            }
        }
    }, [isAuthenticated, user, showSuccess]);

    const updateQuantity = useCallback(async (productId, size, quantity) => {
        const item = state.items.find(
            item => item.productId === productId && item.size === size
        );
        
        if (item && item.stock && quantity > item.stock) {
            showError(`Only ${item.stock} items available in stock.`);
            return;
        }
        
        // Optimistic update
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } });
        
        if (isAuthenticated && user) {
            try {
                await cartService.updateItemQuantity(productId, size, quantity);
                // No cart refresh here
            } catch (error) {
                console.error('Failed to update cart:', error);
                // Revert by refreshing cart only on error
                const refreshResponse = await cartService.getCart();
                if (refreshResponse.success) {
                    const cartData = refreshResponse.data.cart || refreshResponse.data;
                    dispatch({ type: 'LOAD_CART', payload: { items: cartData.items || [] } });
                }
                showError('Failed to update cart. Please try again.');
            }
        }
    }, [isAuthenticated, user, showError, state.items]);

    const removeFromCart = useCallback(async (productId, size) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { productId, size } });
        
        if (isAuthenticated && user) {
            try {
                await cartService.removeFromCart(productId, size);
                // No cart refresh here
                showInfo('Item removed from cart', { duration: 1500 });
            } catch (error) {
                console.error('Failed to remove item:', error);
                // Revert by refreshing cart only on error
                const refreshResponse = await cartService.getCart();
                if (refreshResponse.success) {
                    const cartData = refreshResponse.data.cart || refreshResponse.data;
                    dispatch({ type: 'LOAD_CART', payload: { items: cartData.items || [] } });
                }
                showError('Failed to remove item. Please try again.');
            }
        } else {
            showInfo('Item removed from cart', { duration: 1500 });
        }
    }, [isAuthenticated, user, showError, showInfo]);

    const clearCart = useCallback(async () => {
        dispatch({ type: 'CLEAR_CART' });
        justCleared.current = true;
        
        if (isAuthenticated && user) {
            try {
                await cartService.clearCart();
                // No cart refresh here
                showSuccess('Cart cleared', { duration: 2000 });
            } catch (error) {
                console.error('Failed to clear cart:', error);
                // Revert by refreshing cart only on error
                const refreshResponse = await cartService.getCart();
                if (refreshResponse.success) {
                    const cartData = refreshResponse.data.cart || refreshResponse.data;
                    dispatch({ type: 'LOAD_CART', payload: { items: cartData.items || [] } });
                }
                showError('Failed to clear cart. Please try again.');
            }
        } else {
            showSuccess('Cart cleared', { duration: 2000 });
        }
    }, [isAuthenticated, user, showError, showSuccess]);

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated || !user) return;
        
        try {
            const response = await cartService.getCart();
            if (response.success) {
                const cartData = response.data.cart || response.data;
                const items = cartData.items || [];
                dispatch({ type: 'LOAD_CART', payload: { items } });
                lastSyncedState.current = JSON.stringify(items);
            }
        } catch (error) {
            console.error('Failed to refresh cart:', error);
        }
    }, [isAuthenticated, user]);

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