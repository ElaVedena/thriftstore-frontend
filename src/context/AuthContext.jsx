import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

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

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            
            if (token && userStr) {
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

    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await authService.login(email, password);
            
            if (response.success) {
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: {
                        user: response.data.user,
                        token: response.data.token
                    }
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