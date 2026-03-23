import { createContext, useContext, useReducer, useCallback } from 'react';

const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
};

// Toast positions
export const TOAST_POSITIONS = {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center'
};

const initialState = {
    notifications: [],
    position: TOAST_POSITIONS.TOP_RIGHT,
    maxNotifications: 5,
    autoClose: 5000, // 5 seconds
    pauseOnHover: true
};

const notificationReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_NOTIFICATION': {
            const newNotification = {
                id: Date.now() + Math.random(),
                type: action.payload.type || NOTIFICATION_TYPES.INFO,
                message: action.payload.message,
                title: action.payload.title,
                duration: action.payload.duration || state.autoClose,
                createdAt: new Date().toISOString(),
                read: false,
                action: action.payload.action,
                data: action.payload.data
            };

            // Limit number of notifications
            const notifications = [newNotification, ...state.notifications].slice(0, state.maxNotifications);

            return {
                ...state,
                notifications
            };
        }

        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload)
            };

        case 'CLEAR_ALL':
            return {
                ...state,
                notifications: []
            };

        case 'MARK_AS_READ':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload ? { ...n, read: true } : n
                )
            };

        case 'MARK_ALL_AS_READ':
            return {
                ...state,
                notifications: state.notifications.map(n => ({ ...n, read: true }))
            };

        case 'UPDATE_SETTINGS':
            return {
                ...state,
                ...action.payload
            };

        default:
            return state;
    }
};

export function NotificationProvider({ children, settings = {} }) {
    const [state, dispatch] = useReducer(notificationReducer, {
        ...initialState,
        ...settings
    });

    // Add a notification
    const showNotification = useCallback((message, options = {}) => {
        if (!message) return;

        const type = options.type || NOTIFICATION_TYPES.INFO;
        const notification = {
            message,
            ...options,
            type
        };

        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

        // Auto-remove if duration is set
        if (options.duration !== 0) {
            setTimeout(() => {
                
            }, options.duration || state.autoClose);
        }
    }, [state.autoClose]);

    // Convenience methods
    const success = useCallback((message, options = {}) => {
        showNotification(message, { ...options, type: NOTIFICATION_TYPES.SUCCESS });
    }, [showNotification]);

    const error = useCallback((message, options = {}) => {
        showNotification(message, { ...options, type: NOTIFICATION_TYPES.ERROR });
    }, [showNotification]);

    const info = useCallback((message, options = {}) => {
        showNotification(message, { ...options, type: NOTIFICATION_TYPES.INFO });
    }, [showNotification]);

    const warning = useCallback((message, options = {}) => {
        showNotification(message, { ...options, type: NOTIFICATION_TYPES.WARNING });
    }, [showNotification]);

    const removeNotification = useCallback((id) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    }, []);

    const clearAll = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' });
    }, []);

    const markAsRead = useCallback((id) => {
        dispatch({ type: 'MARK_AS_READ', payload: id });
    }, []);

    const markAllAsRead = useCallback(() => {
        dispatch({ type: 'MARK_ALL_AS_READ' });
    }, []);

    const updateSettings = useCallback((newSettings) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
    }, []);

    const value = {
        notifications: state.notifications,
        position: state.position,
        unreadCount: state.notifications.filter(n => !n.read).length,
        showNotification,
        success,
        error,
        info,
        warning,
        removeNotification,
        clearAll,
        markAsRead,
        markAllAsRead,
        updateSettings
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}