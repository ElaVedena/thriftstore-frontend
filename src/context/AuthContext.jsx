import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
        case 'REGISTER_START':
            return { ...state, isLoading: true, error: null };
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null
            };
        case 'LOGIN_FAILURE':
        case 'REGISTER_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            };
        case 'UPDATE_USER':
            return { ...state, user: action.payload };
        case 'AUTH_CHECK_COMPLETE':
            return { ...state, isLoading: false };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

// Check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        return Date.now() >= expiryTime;
    } catch (error) {
        return true;
    }
};

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);
    let refreshCartCallback = null;

    // Function to register refresh cart callback from CartContext
    const setRefreshCartCallback = (callback) => {
        refreshCartCallback = callback;
    };

    // Check auth on load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            
            if (token && userStr) {
                // Check if token is expired
                if (isTokenExpired(token)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    dispatch({ type: 'AUTH_CHECK_COMPLETE' });
                    return;
                }
                
                try {
                    const user = JSON.parse(userStr);
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: { user, token }
                    });
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    dispatch({ type: 'AUTH_CHECK_COMPLETE' });
                }
            } else {
                dispatch({ type: 'AUTH_CHECK_COMPLETE' });
            }
        };

        checkAuth();
    }, []);

    // Handle 401 responses from API - just logout silently
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && state.isAuthenticated) {
                    // Clear storage and logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    dispatch({ type: 'LOGOUT' });
                    
                    // Redirect to login if not already there
                    const isLoginPage = window.location.pathname === '/login';
                    if (!isLoginPage) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
        
        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [state.isAuthenticated]);

    // Periodic token check (every minute)
    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('token');
            if (token && isTokenExpired(token) && state.isAuthenticated) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dispatch({ type: 'LOGOUT' });
                
                const isLoginPage = window.location.pathname === '/login';
                if (!isLoginPage) {
                    window.location.href = '/login';
                }
            }
        }, 60000);
        
        return () => clearInterval(interval);
    }, [state.isAuthenticated]);

    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await authService.login(email, password);
            
            if (response.success) {
                const { user, token } = response.data;
                
                // 🔄 MERGE GUEST CART AFTER LOGIN
                console.log('🔄 Merging guest cart after login...');
                const mergeResult = await cartService.mergeGuestCart();
                console.log('Cart merge result:', mergeResult);
                
                // Refresh cart in context if callback is registered
                if (refreshCartCallback) {
                    await refreshCartCallback();
                }
                
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: { user, token }
                });
                return { success: true };
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: response.message });
                return { success: false, message: response.message };
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: 'An error occurred during login' });
            return { success: false, message: 'An error occurred during login' };
        }
    };

    const register = async (userData) => {
        dispatch({ type: 'REGISTER_START' });
        try {
            const response = await authService.register(userData);
            
            if (response.success) {
                // Auto-login after successful registration
                const loginResponse = await authService.login(userData.email, userData.password);
                
                if (loginResponse.success) {
                    // 🔄 MERGE GUEST CART AFTER REGISTRATION
                    console.log('🔄 Merging guest cart after registration...');
                    const mergeResult = await cartService.mergeGuestCart();
                    console.log('Cart merge result:', mergeResult);
                    
                    // Refresh cart in context if callback is registered
                    if (refreshCartCallback) {
                        await refreshCartCallback();
                    }
                    
                    dispatch({
                        type: 'REGISTER_SUCCESS',
                        payload: {
                            user: loginResponse.data.user,
                            token: loginResponse.data.token
                        }
                    });
                    return { 
                        success: true, 
                        message: 'Registration successful! Welcome to Vedathrifts.',
                        autoLogin: true 
                    };
                } else {
                    // Registration succeeded but auto-login failed
                    dispatch({ type: 'REGISTER_SUCCESS', payload: { user: null, token: null } });
                    return { 
                        success: true, 
                        message: 'Registration successful! Please log in.',
                        autoLogin: false 
                    };
                }
            } else {
                dispatch({ type: 'REGISTER_FAILURE', payload: response.message });
                return { success: false, message: response.message };
            }
        } catch (error) {
            dispatch({ type: 'REGISTER_FAILURE', payload: 'An error occurred during registration' });
            return { success: false, message: 'An error occurred during registration' };
        }
    };

    const logout = () => {
        authService.logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    const updateUser = (updatedUser) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        register,
        logout,
        updateUser,
        clearError,
        setRefreshCartCallback,
        isAdmin: () => state.user?.role === 'ADMIN' || state.user?.role === 'ROLE_ADMIN'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}