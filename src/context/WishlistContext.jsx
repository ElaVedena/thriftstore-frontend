import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
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
            // Ensure each item has an 'id' field that matches productId
            const itemsWithId = (action.payload || []).map(item => ({
                ...item,
                id: item.productId || item.id // Ensure id exists
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
            // Ensure the new item has an id field
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

    // Load wishlist
    useEffect(() => {
        const loadWishlist = async () => {
            if (isAuthLoading) return;

            dispatch({ type: 'FETCH_WISHLIST_START' });

            if (isAuthenticated && user) {
                try {
                    const response = await wishlistService.getWishlist();
                    console.log('Wishlist response:', response);
                    if (response.success) {
                        dispatch({ type: 'FETCH_WISHLIST_SUCCESS', payload: response.data });
                    } else {
                        dispatch({ type: 'FETCH_WISHLIST_FAILURE', payload: response.message });
                        showError(response.message || 'Failed to load wishlist');
                    }
                } catch (error) {
                    console.error('Error loading wishlist:', error);
                    dispatch({ type: 'FETCH_WISHLIST_FAILURE', payload: 'Failed to load wishlist' });
                }
            } else {
                // Load guest wishlist from localStorage
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
        };

        loadWishlist();
    }, [isAuthenticated, user, isAuthLoading, showError]);

    // Save wishlist for guests
    useEffect(() => {
        if (!isAuthenticated && !isAuthLoading && state.items.length > 0) {
            localStorage.setItem('guest_wishlist', JSON.stringify(state.items));
        } else if (!isAuthenticated && !isAuthLoading && state.items.length === 0) {
            localStorage.removeItem('guest_wishlist');
        }
    }, [state.items, isAuthenticated, isAuthLoading]);

    const addToWishlist = useCallback(async (product) => {
        const productId = product.id || product.productId;
        const productName = product.name || product.productName;
        
        // Check if already in wishlist
        const isAlreadyInWishlist = state.items.some(item => {
            const itemId = item.productId || item.id;
            return itemId === productId;
        });
        
        if (isAlreadyInWishlist) {
            showError(`${productName} is already in your wishlist`);
            return { success: false };
        }

        // Optimistic update
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
                    // Revert on failure
                    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
                    showError(response.message || 'Failed to add to wishlist');
                    return { success: false };
                } else {
                    showSuccess(`${productName} added to wishlist!`);
                    return { success: true };
                }
            } catch (error) {
                // Revert on error
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
        // Store item for potential revert
        const removedItem = state.items.find(item => {
            const itemId = item.productId || item.id;
            return itemId === productId;
        });

        // Optimistic update
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });

        if (isAuthenticated && user) {
            try {
                const response = await wishlistService.removeFromWishlist(productId);
                if (!response.success) {
                    // Revert on failure
                    if (removedItem) {
                        dispatch({ type: 'ADD_TO_WISHLIST', payload: removedItem });
                    }
                    showError(response.message || 'Failed to remove from wishlist');
                    return { success: false };
                } else {
                    showSuccess(productName ? `${productName} removed from wishlist` : 'Item removed from wishlist');
                    return { success: true };
                }
            } catch (error) {
                // Revert on error
                if (removedItem) {
                    dispatch({ type: 'ADD_TO_WISHLIST', payload: removedItem });
                }
                showError('Failed to remove from wishlist');
                return { success: false };
            }
        } else {
            showSuccess(productName ? `${productName} removed from wishlist` : 'Item removed from wishlist');
            return { success: true };
        }
    }, [state.items, isAuthenticated, user, showError, showSuccess]);

    const isInWishlist = useCallback((productId) => {
        const isIn = state.items.some(item => {
            const itemId = item.productId || item.id;
            return itemId === productId;
        });
        console.log(`Checking product ${productId} in wishlist: ${isIn}`, state.items);
        return isIn;
    }, [state.items]);

    const clearWishlist = useCallback(async () => {
        if (state.items.length === 0) return;

        dispatch({ type: 'CLEAR_WISHLIST' });

        if (isAuthenticated && user) {
            try {
                const response = await wishlistService.clearWishlist();
                if (!response.success) {
                    showError(response.message || 'Failed to clear wishlist');
                } else {
                    showSuccess('Wishlist cleared');
                }
            } catch (error) {
                showError('Failed to clear wishlist');
            }
        } else {
            localStorage.removeItem('guest_wishlist');
            showSuccess('Wishlist cleared');
        }
    }, [state.items.length, isAuthenticated, user, showError, showSuccess]);

    const refreshWishlist = useCallback(async () => {
        if (!isAuthenticated || !user) return;
        
        dispatch({ type: 'FETCH_WISHLIST_START' });
        try {
            const response = await wishlistService.getWishlist();
            if (response.success) {
                dispatch({ type: 'FETCH_WISHLIST_SUCCESS', payload: response.data });
            } else {
                dispatch({ type: 'FETCH_WISHLIST_FAILURE', payload: response.message });
            }
        } catch (error) {
            dispatch({ type: 'FETCH_WISHLIST_FAILURE', payload: 'Failed to refresh wishlist' });
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