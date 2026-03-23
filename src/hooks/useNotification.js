import { useCallback } from 'react';
import { useNotification as useNotificationContext } from '../context/NotificationContext';

export function useNotification() {
    const notification = useNotificationContext();

    const showSuccess = useCallback((message, options = {}) => {
        notification.success(message, options);
    }, [notification]);

    const showError = useCallback((message, options = {}) => {
        notification.error(message, options);
    }, [notification]);

    const showInfo = useCallback((message, options = {}) => {
        notification.info(message, options);
    }, [notification]);

    const showWarning = useCallback((message, options = {}) => {
        notification.warning(message, options);
    }, [notification]);

    const showApiResponse = useCallback((response, successMessage, errorMessage) => {
        if (response.success) {
            notification.success(successMessage || response.message || 'Operation successful');
        } else {
            notification.error(errorMessage || response.message || 'Operation failed');
        }
    }, [notification]);

    return {
        ...notification,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showApiResponse
    };
}