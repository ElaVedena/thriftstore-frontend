import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';
import { useNotification } from '../hooks/useNotification';

const WishlistContext = createContext();

const initialState = {
    items: [],
    totalItems: 0,
    isLoading: false,
    error: null
};

const wishlistReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_WISHLIST_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_WISHLIST_SUCCESS':
            const itemsWithId = (action.payload || []).map(item => ({
                ...item,
                id: item.productId || item.id
            }));
            return {
                ...state,
                items: itemsWithId,
                totalItems: itemsWithId.length,
                isLoading: false,
                error: null
            };
        case 'FETCH_WISHLIST_FAILURE':
            return { ...state, isLoading: false, error: action.payload };
        case 'ADD_TO_WISHLIST':
            const exists = state.items.some(item => {
                const itemId = item.productId || item.id;
                const newId = action.payload.productId || action.payload.id;
                return itemId === newId;
            });
            if (exists) {
                return state;
            }
            const newItem = {
                ...action.payload,
                id: action.payload.productId || action.payload.id
            };
            const newItems = [...state.items, newItem];
            return {
                ...state,
                items: newItems,
                totalItems: newItems.length
            };
        case 'REMOVE_FROM_WISHLIST':
            const filteredItems = state.items.filter(item => {
                const itemId = item.productId || item.id;
                return itemId !== action.payload;
            });
            return {
                ...state,
                items: filteredItems,
                totalItems: filteredItems.length
            };
        case 'CLEAR_WISHLIST':
            return initialState;
        default:
            return state;
    }
};

export function WishlistProvider({ children }) {
    const [state, dispatch] = useReducer(wishlistReducer, initialState);
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { showError, showSuccess } = useNotification();
    const isInitialLoad = useRef(true);
    const isRefreshing = useRef(false);

    // Load wishlist only once on mount
    useEffect(() => {
        const loadWishlist = async () => {
            if (isAuthLoading) return;
            if (!isInitialLoad.current) return;

            dispatch({ type: 'FETCH_WISHLIST_START' });

            if (isAuthenticated && user) {
                try {
                    const response = await wishlistService.getWishlist();
                    if (response.success) {
                        dispatch({ type: 'FETCH_WISHLIST_SUCCESS', payload: response.data });
                    } else {
                        dispatch({ type: 'FETCH_WISHLIST_FAILURE', payload: response.message });
                    }
                } catch (error) {
                    console.error('Error loading wishlist:', error);
                    dispatch({ type: 'FETCH_WISHLIST_FAILURE', payload: 'Failed to load wishlist' });
                }
            } else {
                try {
                    const guestWishlist = localStorage.getItem('guest_wishlist');
                    if (guestWishlist) {
                        const parsed = JSON.parse(guestWishlist);
                        dispatch({ type: 'FETCH_WISHLIST_SUCCESS', payload: parsed });
                    } else {
                        dispatch({ type: 'FETCH_WISHLIST_SUCCESS', payload: [] });
                    }
                } catch (error) {
                    console.error('Failed to load guest wishlist:', error);
                    dispatch({ type: 'FETCH_WISHLIST_SUCCESS', payload: [] });
                }
            }
            isInitialLoad.current = false;
        };

        loadWishlist();
    }, [isAuthenticated, user, isAuthLoading]);

    // Save wishlist for guests (no page reload)
    useEffect(() => {
        if (!isAuthenticated && !isAuthLoading && !isInitialLoad.current) {
            localStorage.setItem('guest_wishlist', JSON.stringify(state.items));
        }
    }, [state.items, isAuthenticated, isAuthLoading]);

    const addToWishlist = useCallback(async (product) => {
        const productId = product.id || product.productId;
        const productName = product.name || product.productName;
        
        const isAlreadyInWishlist = state.items.some(item => {
            const itemId = item.productId || item.id;
            return itemId === productId;
        });
        
        if (isAlreadyInWishlist) {
            showError(`${productName} is already in your wishlist`);
            return { success: false };
        }

        const wishlistItem = {
            id: productId,
            productId: productId,
            productName: productName,
            price: product.price,
            imageUrl: product.images?.[0] || product.imageUrl
        };
        
        dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem });

        if (isAuthenticated && user) {
            try {
                const productDetails = {
                    productName: productName,
                    price: product.price,
                    imageUrl: product.images?.[0] || product.imageUrl
                };
                
                const response = await wishlistService.addToWishlist(productId, productDetails);
                
                if (!response.success) {
                    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
                    showError(response.message || 'Failed to add to wishlist');
                    return { success: false };
                } else {
                    showSuccess(`${productName} added to wishlist!`);
                    return { success: true };
                }
            } catch (error) {
                dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
                showError('Failed to add to wishlist');
                return { success: false };
            }
        } else {
            showSuccess(`${productName} added to wishlist!`);
            return { success: true };
        }
    }, [state.items, isAuthenticated, user, showError, showSuccess]);

    const removeFromWishlist = useCallback(async (productId, productName) => {
        const removedItem = state.items.find(item => {
            const itemId = item.productId || item.id;
            return itemId === productId;
        });

        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });

        if (isAuthenticated && user) {
            try {
                const response = await wishlistService.removeFromWishlist(productId);
                if (!response.success) {
                    if (removedItem) {
                        dispatch({ type: 'ADD_TO_WISHLIST', payload: removedItem });
                    }
                    showError(response.message || 'Failed to remove from wishlist');
                    return { success: false };
                } else {
                    // Only show notification if productName is provided
                    if (productName) {
                        showSuccess(`${productName} removed from wishlist`);
                    }
                    return { success: true };
                }
            } catch (error) {
                if (removedItem) {
                    dispatch({ type: 'ADD_TO_WISHLIST', payload: removedItem });
                }
                showError('Failed to remove from wishlist');
                return { success: false };
            }
        } else {
            if (productName) {
                showSuccess(`${productName} removed from wishlist`);
            }
            return { success: true };
        }
    }, [state.items, isAuthenticated, user, showError, showSuccess]);

    const isInWishlist = useCallback((productId) => {
        return state.items.some(item => {
            const itemId = item.productId || item.id;
            return itemId === productId;
        });
    }, [state.items]);

    const clearWishlist = useCallback(async () => {
        if (state.items.length === 0) return;

        dispatch({ type: 'CLEAR_WISHLIST' });

        if (isAuthenticated && user) {
            try {
                const response = await wishlistService.clearWishlist();
                if (!response.success) {
                    showError(response.message || 'Failed to clear wishlist');
                }
            } catch (error) {
                showError('Failed to clear wishlist');
            }
        } else {
            localStorage.removeItem('guest_wishlist');
        }
    }, [state.items.length, isAuthenticated, user, showError]);

    const refreshWishlist = useCallback(async () => {
        // Prevent multiple simultaneous refreshes
        if (isRefreshing.current) return;
        if (!isAuthenticated || !user) return;
        
        isRefreshing.current = true;
        
        try {
            const response = await wishlistService.getWishlist();
            if (response.success) {
                dispatch({ type: 'FETCH_WISHLIST_SUCCESS', payload: response.data });
            }
        } catch (error) {
            console.error('Failed to refresh wishlist:', error);
        } finally {
            isRefreshing.current = false;
        }
    }, [isAuthenticated, user]);

    const value = {
        wishlistItems: state.items,
        totalItems: state.totalItems,
        isLoading: state.isLoading,
        error: state.error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        refreshWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}